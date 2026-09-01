# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from db.database import get_db
from db.models import Cluster, BlindspotMetric, Article, Source

router = APIRouter(prefix="/blindspots", tags=["Observatorio de Puntos Ciegos"])

@router.get("", summary="Listar eventos con asimetría de cobertura (Puntos Ciegos)")
def list_blindspots(
    side: Optional[str] = Query(None, description="Filtrar por lado: blindspot_left, blindspot_right, skewed"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Cluster, BlindspotMetric)
        .join(BlindspotMetric, BlindspotMetric.cluster_id == Cluster.id)
        .filter(BlindspotMetric.is_blindspot == True)
    )

    if side:
        query = query.filter(BlindspotMetric.blindspot_side == side)

    results = query.order_by(BlindspotMetric.divergence_score.desc()).limit(limit).all()

    items = []
    for cluster, metric in results:
        items.append({
            "cluster_id": cluster.id,
            "title": cluster.title,
            "category": cluster.category,
            "article_count": cluster.article_count,
            "first_seen_at": cluster.first_seen_at.isoformat() if cluster.first_seen_at else None,
            "blindspot_side": metric.blindspot_side,
            "coverage": {
                "left_pct": metric.left_pct,
                "center_pct": metric.center_pct,
                "right_pct": metric.right_pct,
                "left_count": metric.left_count,
                "center_count": metric.center_count,
                "right_count": metric.right_count
            },
            "divergence_score": metric.divergence_score,
            "explanation": (
                "Noticia cubierta mayoritariamente por medios del sector derecho. La prensa de izquierda presenta una cobertura nula o mínima."
                if metric.blindspot_side == "blindspot_left" else
                "Noticia cubierta mayoritariamente por medios del sector izquierdo. La prensa de derecha presenta una cobertura nula o mínima."
            )
        })

    return {
        "total_blindspots": len(items),
        "blindspots": items
    }

@router.get("/summary", summary="Resumen estadístico de sesgo y puntos ciegos en la agenda")
def get_blindspots_summary(db: Session = Depends(get_db)):
    total_clusters = db.query(Cluster).count()
    blindspots_left = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "blindspot_left").count()
    blindspots_right = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "blindspot_right").count()
    balanced_events = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "balanced").count()
    insufficient = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "insufficient_sources").count()

    return {
        "total_events_monitored": total_clusters,
        "blindspots_left_count": blindspots_left,
        "blindspots_right_count": blindspots_right,
        "balanced_events_count": balanced_events,
        "insufficient_sources_count": insufficient,
        "plurality_index_pct": round((balanced_events / total_clusters * 100) if total_clusters > 0 else 0, 1)
    }
