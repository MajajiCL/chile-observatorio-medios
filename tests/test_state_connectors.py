# -*- coding: utf-8 -*-
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base
from db.models import EconomicIndicator, StateDocument

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_economic_indicator_persistence(db_session):
    ind = EconomicIndicator(
        code="UF",
        name="Unidad de Fomento",
        value=38500.50,
        unit="CLP",
        date=datetime.utcnow(),
        source="Banco Central de Chile"
    )
    db_session.add(ind)
    db_session.commit()
    
    stored = db_session.query(EconomicIndicator).filter_by(code="UF").first()
    assert stored is not None
    assert stored.value == 38500.50
    assert stored.unit == "CLP"

def test_state_document_persistence(db_session):
    doc = StateDocument(
        title="Ley N° 21.719 sobre Protección de Datos Personales",
        doc_type="diario_oficial_ley",
        document_number="21719",
        publication_date=datetime.utcnow(),
        summary="Modifica la Ley N° 19.628 y crea la Agencia de Protección de Datos.",
        source_url="https://www.diariooficial.cl/norma/21719"
    )
    db_session.add(doc)
    db_session.commit()
    
    stored = db_session.query(StateDocument).filter_by(document_number="21719").first()
    assert stored is not None
    assert "Protección de Datos" in stored.title
