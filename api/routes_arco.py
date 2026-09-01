# -*- coding: utf-8 -*-
import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import ArcoRequest, AuditLog

router = APIRouter(prefix="/arco", tags=["Transparencia y Derechos ARCO (Ley 21.719)"])

class ArcoSubmission(BaseModel):
    request_type: str = Field(..., description="Tipo de derecho: acceso, rectificacion, supresion, oposicion")
    contact_email: EmailStr = Field(..., description="Correo del solicitante")
    target_identifier: str = Field(..., description="Identificador o dato personal objeto de la solicitud (RUT o Nombre)")
    description: str = Field(..., description="Fundamento y detalle de la solicitud")

@router.post("/request", summary="Ingresar solicitud de derechos ARCO (Ley N° 21.719)")
def submit_arco_request(payload: ArcoSubmission, db: Session = Depends(get_db)):
    valid_types = ["acceso", "rectificacion", "supresion", "oposicion"]
    if payload.request_type.lower() not in valid_types:
        raise HTTPException(status_code=400, detail=f"Tipo de solicitud inválido. Debe ser uno de: {valid_types}")

    ticket_id = "ARCO-" + uuid.uuid4().hex[:8].upper()
    email_hash = hashlib.sha256(payload.contact_email.lower().strip().encode("utf-8")).hexdigest()
    
    # Enmascarar el identificador para no guardar datos sensibles en claro
    masked_target = payload.target_identifier[:3] + "***" + payload.target_identifier[-2:] if len(payload.target_identifier) > 5 else "***"

    req = ArcoRequest(
        ticket_id=ticket_id,
        request_type=payload.request_type.lower(),
        requester_email_hash=email_hash,
        target_identifier_masked=masked_target,
        description=payload.description,
        status="pendiente",
        created_at=datetime.utcnow()
    )
    db.add(req)

    # Registrar en auditoría
    audit = AuditLog(
        action="arco_request_created",
        entity_type="arco_request",
        entity_id=ticket_id,
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {
        "status": "received",
        "ticket_id": ticket_id,
        "legal_deadline_days": 30,
        "message": "Solicitud ingresada formalmente bajo la Ley N° 21.719. El plazo legal máximo de respuesta es de 30 días corridos."
    }

@router.get("/status/{ticket_id}", summary="Consultar estado de solicitud ARCO")
def check_arco_status(ticket_id: str, db: Session = Depends(get_db)):
    req = db.query(ArcoRequest).filter(ArcoRequest.ticket_id == ticket_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Ticket de solicitud ARCO no encontrado")

    return {
        "ticket_id": req.ticket_id,
        "request_type": req.request_type,
        "target_identifier_masked": req.target_identifier_masked,
        "status": req.status,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "resolved_at": req.resolved_at.isoformat() if req.resolved_at else None,
        "resolution_notes": req.resolution_notes
    }
