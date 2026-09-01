# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from db.database import get_db
from db.models import EconomicIndicator, StateDocument
from ingestion.connectors import EconomicIndicatorConnector, DiarioOficialConnector, CongresoConnector

router = APIRouter(prefix="/state", tags=["Datos Oficiales del Estado"])

@router.get("/indicators", summary="Indicadores macroeconómicos oficiales de Chile")
def get_economic_indicators(db: Session = Depends(get_db)):
    indicators = db.query(EconomicIndicator).order_by(EconomicIndicator.id.asc()).all()
    return [
        {
            "code": ind.code,
            "name": ind.name,
            "value": ind.value,
            "unit": ind.unit,
            "date": ind.date.isoformat() if ind.date else None,
            "source": ind.source,
            "updated_at": ind.updated_at.isoformat() if ind.updated_at else None
        } for ind in indicators
    ]

@router.get("/documents", summary="Leyes, decretos y boletines oficiales")
def get_state_documents(
    doc_type: Optional[str] = Query(None, description="Filtrar por tipo: diario_oficial_norma, proyecto_ley_senado, proyecto_ley_camara"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(StateDocument)
    if doc_type:
        query = query.filter(StateDocument.doc_type == doc_type)
    
    docs = query.order_by(StateDocument.publication_date.desc()).limit(limit).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type,
            "publication_date": d.publication_date.isoformat() if d.publication_date else None,
            "summary": d.summary,
            "source_url": d.source_url
        } for d in docs
    ]

async def sync_state_data_task(db: Session):
    await EconomicIndicatorConnector.fetch_and_store_indicators(db)
    await DiarioOficialConnector.fetch_latest_norms(db)
    await CongresoConnector.fetch_legislative_updates(db)

@router.post("/sync", summary="Sincronizar datos oficiales en vivo")
async def trigger_state_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(sync_state_data_task, db)
    return {"status": "success", "message": "Sincronización de datos del Estado iniciada en segundo plano."}
