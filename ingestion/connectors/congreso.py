# -*- coding: utf-8 -*-
import logging
from datetime import datetime
from typing import Dict, List, Any
import httpx
import feedparser
from sqlalchemy.orm import Session
from db.models import StateDocument

logger = logging.getLogger("ingestion.congreso")

class CongresoConnector:
    """
    Conector de observabilidad legislativa para el Congreso Nacional de Chile
    (Senado y Cámara de Diputadas y Diputados).
    Monitorea proyectos de ley, votaciones y boletines parlamentarios.
    """

    SENADO_FEED = "https://www.senado.cl/rss/noticias.xml"
    CAMARA_FEED = "https://www.camara.cl/rss/noticias.aspx"

    @classmethod
    async def fetch_legislative_updates(cls, db: Session, max_items: int = 10) -> Dict[str, Any]:
        stats = {"senado_inserted": 0, "camara_inserted": 0}
        
        feeds = [
            ("proyecto_ley_senado", cls.SENADO_FEED),
            ("proyecto_ley_camara", cls.CAMARA_FEED)
        ]

        async with httpx.AsyncClient(timeout=15.0, verify=False, follow_redirects=True) as client:
            for doc_type, feed_url in feeds:
                try:
                    resp = await client.get(feed_url)
                    if resp.status_code == 200:
                        parsed = feedparser.parse(resp.text)
                        for entry in parsed.entries[:max_items]:
                            title = getattr(entry, "title", "").strip()
                            link = getattr(entry, "link", "").strip()
                            summary = getattr(entry, "summary", "").strip()
                            if not title or not link:
                                continue

                            existing = db.query(StateDocument).filter(StateDocument.source_url == link).first()
                            if not existing:
                                doc = StateDocument(
                                    title=title,
                                    doc_type=doc_type,
                                    publication_date=datetime.utcnow(),
                                    summary=summary[:1000] if summary else title,
                                    source_url=link,
                                    created_at=datetime.utcnow()
                                )
                                db.add(doc)
                                if "senado" in doc_type:
                                    stats["senado_inserted"] += 1
                                else:
                                    stats["camara_inserted"] += 1
                        db.commit()
                except Exception as e:
                    logger.debug(f"Aviso al consultar feed legislativo {feed_url}: {e}")

        return stats
