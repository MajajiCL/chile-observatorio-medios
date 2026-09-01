# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import os

from db.database import get_db
from db.models import Source, Article
from config.settings import settings

router = APIRouter(prefix="/sources", tags=["Fuentes y Medios"])

@router.get("", summary="Listar medios y fuentes de información")
def list_sources(
    spectrum: Optional[str] = Query(None, description="Filtrar por espectro: izquierda, centro, derecha, etc."),
    category: Optional[str] = Query(None, description="Filtrar por categoría: prensa-tradicional, prensa-digital-investigacion, prensa-regional, fuente-oficial"),
    region: Optional[str] = Query(None, description="Filtrar por región"),
    db: Session = Depends(get_db)
):
    query = db.query(Source).filter(Source.active == True)
    if spectrum:
        query = query.filter(Source.spectrum == spectrum)
    if category:
        query = query.filter(Source.category == category)
    if region:
        query = query.filter(Source.region.ilike(f"%{region}%"))
    
    sources = query.order_by(Source.name.asc()).all()
    results = []
    for s in sources:
        results.append({
            "id": s.id,
            "slug": s.slug,
            "name": s.name,
            "url": s.url,
            "spectrum": s.spectrum,
            "category": s.category,
            "ownership": s.ownership,
            "ownership_type": s.ownership_type,
            "funding_model": s.funding_model,
            "facticity_rating": s.facticity_rating,
            "region": s.region,
            "total_articles": db.query(Article).filter(Article.source_id == s.id).count()
        })
    return results

@router.get("/{slug}", summary="Obtener ficha de transparencia de un medio")
def get_source(slug: str, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.slug == slug).first()
    if not source:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    
    recent_articles = (
        db.query(Article)
        .filter(Article.source_id == source.id)
        .order_by(Article.published_at.desc())
        .limit(10)
        .all()
    )

    return {
        "id": source.id,
        "slug": source.slug,
        "name": source.name,
        "url": source.url,
        "spectrum": source.spectrum,
        "category": source.category,
        "ownership": source.ownership,
        "ownership_type": source.ownership_type,
        "funding_model": source.funding_model,
        "facticity_rating": source.facticity_rating,
        "region": source.region,
        "rss_feeds": json.loads(source.rss_feeds_json) if source.rss_feeds_json else [],
        "recent_articles": [
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "published_at": a.published_at.isoformat() if a.published_at else None,
                "category": a.category
            } for a in recent_articles
        ]
    }
