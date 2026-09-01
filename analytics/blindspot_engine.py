# -*- coding: utf-8 -*-
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from config.settings import settings
from db.models import Cluster, ClusterArticle, Article, Source, BlindspotMetric

class BlindspotEngine:
    """
    Motor analítico de detección de Puntos Ciegos (Blindspots) y divergencia editorial.
    Inspirado en metodologías de desintermediación como Ground News / Media Cloud,
    adaptado al mapa de concentración y espectro de medios en Chile.
    """

    SPECTRUM_MAP = {
        "izquierda": "left",
        "centro-izquierda": "left",
        "centro": "center",
        "centro-derecha": "right",
        "derecha": "right",
        "investigacion-no-alineada": "independent",
        "fuente-oficial": "institutional",
        "institucional-oficial": "institutional"
    }

    def __init__(self, db: Session):
        self.db = db

    def calculate_cluster_metrics(self, cluster_id: int) -> Optional[BlindspotMetric]:
        """
        Calcula la distribución de cobertura por espectro y evalúa si existe un punto ciego.
        """
        cluster = self.db.query(Cluster).filter(Cluster.id == cluster_id).first()
        if not cluster:
            return None

        # Obtener todas las notas asociadas al cluster y sus fuentes
        articles = (
            self.db.query(Article, Source)
            .join(ClusterArticle, ClusterArticle.article_id == Article.id)
            .join(Source, Source.id == Article.source_id)
            .filter(ClusterArticle.cluster_id == cluster_id)
            .all()
        )

        counts = {
            "left": 0,
            "center": 0,
            "right": 0,
            "institutional": 0,
            "independent": 0
        }

        # Contar fuentes únicas por bloque para evitar que 1 medio con 5 notas distorsione
        sources_seen = set()
        for art, src in articles:
            spectrum_block = self.SPECTRUM_MAP.get(src.spectrum, "center")
            counts[spectrum_block] += 1
            sources_seen.add(src.id)

        total_sources = len(sources_seen)
        total_political = counts["left"] + counts["center"] + counts["right"]

        if total_political > 0:
            left_pct = counts["left"] / total_political
            center_pct = counts["center"] / total_political
            right_pct = counts["right"] / total_political
        else:
            left_pct = center_pct = right_pct = 0.0

        # Diagnóstico de Punto Ciego (Blindspot)
        is_blindspot = False
        blindspot_side = "balanced"
        
        if total_political >= 2:
            # Si la derecha cubre fuertemente y la izquierda omite/silencia
            if right_pct >= settings.BLINDSPOT_HIGH_COVERAGE_THRESHOLD and left_pct <= settings.BLINDSPOT_LOW_COVERAGE_THRESHOLD:
                is_blindspot = True
                blindspot_side = "blindspot_left" # Punto ciego para el sector izquierdo
            
            # Si la izquierda cubre fuertemente y la derecha omite/silencia
            elif left_pct >= settings.BLINDSPOT_HIGH_COVERAGE_THRESHOLD and right_pct <= settings.BLINDSPOT_LOW_COVERAGE_THRESHOLD:
                is_blindspot = True
                blindspot_side = "blindspot_right" # Punto ciego para el sector derecho
                
            elif abs(left_pct - right_pct) <= settings.BALANCED_TOLERANCE:
                blindspot_side = "balanced"
            else:
                blindspot_side = "skewed"
        else:
            blindspot_side = "insufficient_sources"

        # Cálculo de Divergencia (0.0 a 1.0)
        divergence_score = abs(left_pct - right_pct) if total_political > 0 else 0.0

        # Guardar o actualizar métrica
        metric = self.db.query(BlindspotMetric).filter(BlindspotMetric.cluster_id == cluster_id).first()
        if not metric:
            metric = BlindspotMetric(
                cluster_id=cluster_id,
                left_count=counts["left"],
                center_count=counts["center"],
                right_count=counts["right"],
                institutional_count=counts["institutional"],
                independent_count=counts["independent"],
                total_sources=total_sources,
                left_pct=round(left_pct, 3),
                center_pct=round(center_pct, 3),
                right_pct=round(right_pct, 3),
                is_blindspot=is_blindspot,
                blindspot_side=blindspot_side,
                divergence_score=round(divergence_score, 3),
                calculated_at=datetime.utcnow()
            )
            self.db.add(metric)
        else:
            metric.left_count = counts["left"]
            metric.center_count = counts["center"]
            metric.right_count = counts["right"]
            metric.institutional_count = counts["institutional"]
            metric.independent_count = counts["independent"]
            metric.total_sources = total_sources
            metric.left_pct = round(left_pct, 3)
            metric.center_pct = round(center_pct, 3)
            metric.right_pct = round(right_pct, 3)
            metric.is_blindspot = is_blindspot
            metric.blindspot_side = blindspot_side
            metric.divergence_score = round(divergence_score, 3)
            metric.calculated_at = datetime.utcnow()

        self.db.commit()
        return metric
