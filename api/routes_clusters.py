# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from db.database import get_db
from db.models import Cluster, ClusterArticle, Article, Source, BlindspotMetric
from analytics.summarizer import MultiAngleSummarizer

router = APIRouter(prefix="/clusters", tags=["Eventos y Clusters Noticiosos"])

@router.get("", summary="Listar eventos fácticos deduplicados")
def list_clusters(
    category: Optional[str] = Query(None, description="Filtrar por categoría temática"),
    search: Optional[str] = Query(None, description="Búsqueda por texto en título"),
    is_blindspot: Optional[bool] = Query(None, description="Filtrar solo eventos con punto ciego"),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Cluster).filter(Cluster.status == "active")
    
    if category:
        query = query.filter(Cluster.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(Cluster.title.ilike(f"%{search}%"))
    if is_blindspot is not None:
        query = query.join(BlindspotMetric).filter(BlindspotMetric.is_blindspot == is_blindspot)

    total = query.count()
    clusters = query.order_by(Cluster.last_seen_at.desc()).offset(offset).limit(limit).all()

    items = []
    for c in clusters:
        metric = c.blindspot_metric
        items.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "article_count": c.article_count,
            "first_seen_at": c.first_seen_at.isoformat() if c.first_seen_at else None,
            "last_seen_at": c.last_seen_at.isoformat() if c.last_seen_at else None,
            "blindspot": {
                "is_blindspot": metric.is_blindspot if metric else False,
                "side": metric.blindspot_side if metric else "insufficient_sources",
                "left_pct": metric.left_pct if metric else 0.0,
                "center_pct": metric.center_pct if metric else 0.0,
                "right_pct": metric.right_pct if metric else 0.0,
                "divergence_score": metric.divergence_score if metric else 0.0
            } if metric else None
        })

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "clusters": items
    }

@router.get("/{cluster_id}", summary="Detalle de un evento y cobertura por medio")
def get_cluster_detail(cluster_id: int, db: Session = Depends(get_db)):
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Evento/Cluster no encontrado")

    articles = (
        db.query(Article, Source, ClusterArticle.similarity_score)
        .join(ClusterArticle, ClusterArticle.article_id == Article.id)
        .join(Source, Source.id == Article.source_id)
        .filter(ClusterArticle.cluster_id == cluster_id)
        .order_by(Article.published_at.desc())
        .all()
    )

    articles_list = []
    for art, src, sim in articles:
        articles_list.append({
            "id": art.id,
            "title": art.title,
            "url": art.url,
            "author": art.author,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "snippet": art.clean_text[:250] + "..." if art.clean_text else (art.raw_summary[:250] if art.raw_summary else ""),
            "image_url": art.image_url,
            "similarity_score": round(sim, 3),
            "source": {
                "id": src.id,
                "name": src.name,
                "slug": src.slug,
                "spectrum": src.spectrum,
                "ownership": src.ownership,
                "category": src.category
            }
        })

    metric = cluster.blindspot_metric

    return {
        "id": cluster.id,
        "title": cluster.title,
        "description": cluster.description,
        "category": cluster.category,
        "article_count": cluster.article_count,
        "first_seen_at": cluster.first_seen_at.isoformat() if cluster.first_seen_at else None,
        "last_seen_at": cluster.last_seen_at.isoformat() if cluster.last_seen_at else None,
        "blindspot_metric": {
            "left_count": metric.left_count if metric else 0,
            "center_count": metric.center_count if metric else 0,
            "right_count": metric.right_count if metric else 0,
            "institutional_count": metric.institutional_count if metric else 0,
            "independent_count": metric.independent_count if metric else 0,
            "left_pct": metric.left_pct if metric else 0.0,
            "center_pct": metric.center_pct if metric else 0.0,
            "right_pct": metric.right_pct if metric else 0.0,
            "is_blindspot": metric.is_blindspot if metric else False,
            "blindspot_side": metric.blindspot_side if metric else "insufficient_sources",
            "divergence_score": metric.divergence_score if metric else 0.0
        } if metric else None,
        "articles": articles_list
    }

@router.get("/{cluster_id}/brief", summary="Informe sintético multi-ángulo con derecho de cita (Ley 17.336)")
def get_cluster_brief(cluster_id: int, db: Session = Depends(get_db)):
    brief = MultiAngleSummarizer.generate_cluster_brief(db, cluster_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return brief
