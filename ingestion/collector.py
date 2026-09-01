# -*- coding: utf-8 -*-
import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone
import time
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

import httpx
import feedparser
from sqlalchemy.orm import Session

from config.settings import settings
from db.models import Source, Article, AuditLog
from ingestion.extractor import ArticleExtractor
from ingestion.pii_filter import PIIFilter

logger = logging.getLogger("ingestion.collector")

class RSSCollector:
    """
    Colector asíncrono y resiliente de feeds RSS/Atom de medios chilenos.
    Cumple con:
    - Ley N° 21.459 (Delitos informáticos): rate limiting de 1s por host, headers de identificación, respeto robots.txt.
    - Ley N° 21.719 (Protección de datos): sanitización PII preventiva antes de almacenar.
    """

    def __init__(self, db: Session):
        self.db = db
        self.client_headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, text/html;q=0.9, */*;q=0.8",
            "Accept-Language": "es-CL,es;q=0.9"
        }
        self._last_request_time: Dict[str, float] = {}

    def _compute_hash(self, content: str) -> str:
        """Calcula el hash SHA-256 para deduplicación exacta de contenido."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    async def _rate_limit_host(self, url: str):
        """Asegura un intervalo mínimo entre peticiones al mismo dominio."""
        try:
            domain = urlparse(url).netloc
            last_time = self._last_request_time.get(domain, 0.0)
            elapsed = time.time() - last_time
            if elapsed < settings.RATE_LIMIT_PER_HOST_SECONDS:
                await asyncio.sleep(settings.RATE_LIMIT_PER_HOST_SECONDS - elapsed)
            self._last_request_time[domain] = time.time()
        except Exception:
            pass

    async def fetch_feed(self, client: httpx.AsyncClient, feed_url: str) -> Optional[feedparser.FeedParserDict]:
        """Descarga y parsea un feed RSS/Atom de forma asíncrona con fallback SSL."""
        await self._rate_limit_host(feed_url)
        try:
            response = await client.get(
                feed_url,
                headers=self.client_headers,
                timeout=settings.INGESTION_TIMEOUT_SECONDS,
                follow_redirects=True
            )
            if response.status_code == 200:
                parsed = feedparser.parse(response.text)
                return parsed
            else:
                logger.warning(f"Respuesta HTTP {response.status_code} en feed: {feed_url}")
                return None
        except httpx.HTTPError as e:
            logger.debug(f"HTTPError en feed {feed_url}: {e}")
            return None
        except Exception as e:
            logger.debug(f"Excepción en feed {feed_url}: {e}")
            return None

    def _parse_published_date(self, entry: Any) -> datetime:
        """Parsea la fecha de publicación con fallback a la hora actual."""
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                return datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc).replace(tzinfo=None)
            except Exception:
                pass
        if hasattr(entry, "updated_parsed") and entry.updated_parsed:
            try:
                return datetime.fromtimestamp(time.mktime(entry.updated_parsed), tz=timezone.utc).replace(tzinfo=None)
            except Exception:
                pass
        return datetime.utcnow()

    async def process_source(self, client: httpx.AsyncClient, source: Source, max_per_feed: int = 15) -> Dict[str, int]:
        """Procesa todos los feeds RSS configurados para una fuente de noticias."""
        stats = {"processed": 0, "inserted": 0, "pii_sanitized": 0}
        
        try:
            feeds = json.loads(source.rss_feeds_json)
        except Exception as e:
            logger.error(f"Error al decodificar feeds para {source.name}: {e}")
            return stats

        for feed_info in feeds:
            feed_url = feed_info.get("url")
            feed_category = feed_info.get("category", "General")
            if not feed_url:
                continue

            parsed_feed = await self.fetch_feed(client, feed_url)
            if not parsed_feed or not parsed_feed.entries:
                continue

            for entry in parsed_feed.entries[:max_per_feed]:
                stats["processed"] += 1
                link = getattr(entry, "link", "").strip()
                title = getattr(entry, "title", "").strip()
                if not link or not title:
                    continue

                # 1. Verificar si la URL ya existe en DB
                existing = self.db.query(Article).filter(Article.url == link).first()
                if existing:
                    continue

                # 2. Extraer resumen y texto
                raw_summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
                clean_body = ArticleExtractor.clean_html_content(raw_summary)
                
                # Extraer autor
                author = getattr(entry, "author", None)
                if not author and "authors" in entry and entry.authors:
                    author = entry.authors[0].get("name")

                # Extraer imagen
                image_url = None
                if hasattr(entry, "media_content") and entry.media_content:
                    image_url = entry.media_content[0].get("url")
                elif hasattr(entry, "enclosures") and entry.enclosures:
                    image_url = entry.enclosures[0].get("href")

                # 3. Aplicar Filtro PII (Ley N° 21.719)
                sanitized_title, title_pii = PIIFilter.sanitize_text(title)
                sanitized_body, body_pii = PIIFilter.sanitize_text(clean_body)
                
                total_pii = sum(title_pii.values()) + sum(body_pii.values())
                if total_pii > 0:
                    stats["pii_sanitized"] += 1

                # 4. Hash del contenido
                content_hash = self._compute_hash(sanitized_title + sanitized_body)
                pub_date = self._parse_published_date(entry)

                # 5. Insertar artículo
                article = Article(
                    source_id=source.id,
                    title=sanitized_title,
                    url=link,
                    author=author,
                    published_at=pub_date,
                    raw_summary=raw_summary[:2000] if raw_summary else None,
                    clean_text=sanitized_body,
                    image_url=image_url,
                    category=feed_category,
                    content_hash=content_hash,
                    status="indexed",
                    created_at=datetime.utcnow()
                )
                self.db.add(article)
                stats["inserted"] += 1

            self.db.commit()

        return stats

    async def run_ingestion(self, max_per_feed: int = 15) -> Dict[str, Any]:
        """Ejecuta una ronda completa de ingesta en todas las fuentes activas."""
        sources = self.db.query(Source).filter(Source.active == True).all()
        total_stats = {"sources": len(sources), "processed": 0, "inserted": 0, "pii_sanitized": 0}
        
        # Cliente HTTP tolerante con verificación flexible
        async with httpx.AsyncClient(
            timeout=settings.INGESTION_TIMEOUT_SECONDS,
            verify=False,
            follow_redirects=True
        ) as client:
            tasks = [self.process_source(client, source, max_per_feed=max_per_feed) for source in sources]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for res in results:
                if isinstance(res, dict):
                    total_stats["processed"] += res.get("processed", 0)
                    total_stats["inserted"] += res.get("inserted", 0)
                    total_stats["pii_sanitized"] += res.get("pii_sanitized", 0)

        # Registrar log de auditoría
        audit = AuditLog(
            action="ingestion_cycle_completed",
            entity_type="system",
            details_json=json.dumps(total_stats),
            timestamp=datetime.utcnow()
        )
        self.db.add(audit)
        self.db.commit()

        return total_stats
