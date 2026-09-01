# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from db.database import get_db
from db.models import Cluster, BlindspotMetric, Article, Source
from analytics.ner_chile import ChileNER

router = APIRouter(prefix="/analytics", tags=["Analítica y Pluralidad"])

@router.get("/plurality", summary="Métricas de pluralidad y distribución de espectro")
def get_plurality_metrics(db: Session = Depends(get_db)):
    total_clusters = db.query(Cluster).count()
    if total_clusters == 0:
        return {"plurality_score": 100.0, "total_events": 0, "breakdown": {}}

    balanced = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "balanced").count()
    left_blindspots = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "blindspot_left").count()
    right_blindspots = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "blindspot_right").count()
    skewed = db.query(BlindspotMetric).filter(BlindspotMetric.blindspot_side == "skewed").count()

    plurality_pct = round((balanced / total_clusters) * 100, 1)

    return {
        "plurality_index_score": plurality_pct,
        "total_events": total_clusters,
        "balanced_events": balanced,
        "left_blindspots": left_blindspots,
        "right_blindspots": right_blindspots,
        "skewed_events": skewed,
        "health_status": "Óptimo (Alta pluralidad)" if plurality_pct > 60 else "Alerta de Polarización Mediática"
    }

@router.get("/entities", summary="Entidades y figuras públicas más mencionadas")
def get_top_entities(db: Session = Depends(get_db)):
    articles = db.query(Article).order_by(Article.published_at.desc()).limit(100).all()
    all_text = " ".join([a.title + " " + (a.clean_text or "") for a in articles])
    entities = ChileNER.extract_entities(all_text)
    return entities
