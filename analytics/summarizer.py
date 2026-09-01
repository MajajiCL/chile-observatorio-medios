# -*- coding: utf-8 -*-
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from db.models import Cluster, ClusterArticle, Article, Source

class MultiAngleSummarizer:
    """
    Generador de síntesis neutral y balanceada multi-ángulo.
    Cumple con la Ley N° 17.336 sobre Propiedad Intelectual mediante el ejercicio
    del legítimo derecho de cita, resúmenes sintéticos derivados y atribución
    explícita con redirección a las fuentes originales.
    """

    @classmethod
    def generate_cluster_brief(cls, db: Session, cluster_id: int) -> Dict[str, Any]:
        """
        Construye un informe multi-perspectiva del cluster noticioso.
        """
        cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
        if not cluster:
            return {}

        articles = (
            db.query(Article, Source)
            .join(ClusterArticle, ClusterArticle.article_id == Article.id)
            .join(Source, Source.id == Article.source_id)
            .filter(ClusterArticle.cluster_id == cluster_id)
            .all()
        )

        angles_by_spectrum: Dict[str, List[Dict[str, Any]]] = {
            "izquierda": [],
            "centro": [],
            "derecha": [],
            "institucional": [],
            "investigacion": []
        }

        sources_list = []

        for art, src in articles:
            spectrum = src.spectrum
            group = "centro"
            if spectrum in ["izquierda", "centro-izquierda"]:
                group = "izquierda"
            elif spectrum in ["derecha", "centro-derecha"]:
                group = "derecha"
            elif spectrum in ["institucional-oficial", "fuente-oficial"]:
                group = "institucional"
            elif spectrum == "investigacion-no-alineada":
                group = "investigacion"

            item = {
                "article_id": art.id,
                "title": art.title,
                "source_name": src.name,
                "source_slug": src.slug,
                "url": art.url,
                "published_at": art.published_at.isoformat() if art.published_at else None,
                "ownership": src.ownership,
                "snippet": art.clean_text[:200] + "..." if art.clean_text else (art.raw_summary[:200] if art.raw_summary else "")
            }
            angles_by_spectrum[group].append(item)
            sources_list.append({
                "source_name": src.name,
                "spectrum": src.spectrum,
                "ownership": src.ownership,
                "url": art.url,
                "title": art.title
            })

        # Extraer puntos clave de consenso
        all_titles = [art.title for art, _ in articles]
        
        brief = {
            "cluster_id": cluster.id,
            "topic_title": cluster.title,
            "category": cluster.category,
            "first_seen": cluster.first_seen_at.isoformat() if cluster.first_seen_at else None,
            "last_seen": cluster.last_seen_at.isoformat() if cluster.last_seen_at else None,
            "total_articles": len(articles),
            "angles_by_spectrum": angles_by_spectrum,
            "sources_references": sources_list,
            "compliance_notice": "Información procesada bajo la excepción de derecho de cita (Art. 71B Ley N° 17.336). Todos los derechos patrimoniales pertenecen a sus respectivos autores y medios."
        }

        return brief
