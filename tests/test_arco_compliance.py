# -*- coding: utf-8 -*-
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base
from db.models import ArcoRequest, AuditLog

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_arco_request_and_audit(db_session):
    ticket = "ARCO-TEST-001"
    req = ArcoRequest(
        ticket_id=ticket,
        request_type="supresion",
        requester_email_hash="hash12345",
        target_identifier_masked="123***-9",
        description="Solicitud de eliminación de dato personal según Ley 21.719",
        status="pendiente",
        created_at=datetime.utcnow()
    )
    db_session.add(req)
    
    audit = AuditLog(
        action="arco_request_created",
        entity_type="arco_request",
        entity_id=ticket,
        timestamp=datetime.utcnow()
    )
    db_session.add(audit)
    db_session.commit()
    
    saved_req = db_session.query(ArcoRequest).filter_by(ticket_id=ticket).first()
    saved_audit = db_session.query(AuditLog).filter_by(entity_id=ticket).first()
    
    assert saved_req is not None
    assert saved_req.request_type == "supresion"
    assert saved_req.status == "pendiente"
    assert saved_audit is not None
    assert saved_audit.action == "arco_request_created"
