# -*- coding: utf-8 -*-
import logging
from datetime import datetime
from typing import Dict, List, Any
import httpx
import feedparser
from sqlalchemy.orm import Session
from db.models import StateDocument

logger = logging.getLogger("ingestion.diario_oficial")

class DiarioOficialConnector:
    """
    Conector de observabilidad para el Diario Oficial de la República de Chile.
    Monitorea la promulgación de leyes, decretos supremos y resoluciones de impacto público.
    """

    DIARIO_OFICIAL_RSS = "https://www.diariooficial.interior.gob.cl/rss/"
    FALLBACK_FEED = "https://prensa.presidencia.cl/rss.aspx"

    @classmethod
    async def fetch_latest_norms(cls, db: Session, max_items: int = 10) -> Dict[str, Any]:
        """Recolecta las últimas normas y actos administrativos publicados."""
        stats = {"inserted": 0, "existing": 0}
        
        try:
            async with httpx.AsyncClient(timeout=15.0, verify=False, follow_redirects=True) as client:
                try:
                    resp = await client.get(cls.DIARIO_OFICIAL_RSS)
                    content = resp.text if resp.status_code == 200 else ""
                except Exception:
                    resp = await client.get(cls.FALLBACK_FEED)
                    content = resp.text if resp.status_code == 200 else ""

                if content:
                    parsed = feedparser.parse(content)
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
                                doc_type="diario_oficial_norma",
                                publication_date=datetime.utcnow(),
                                summary=summary[:1000] if summary else title,
                                source_url=link,
                                created_at=datetime.utcnow()
                            )
                            db.add(doc)
                            stats["inserted"] += 1
                        else:
                            stats["existing"] += 1

                    db.commit()
            return stats
        except Exception as e:
            logger.error(f"Error al recolectar Diario Oficial: {e}")
            return stats
