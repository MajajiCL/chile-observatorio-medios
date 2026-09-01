# -*- coding: utf-8 -*-
import pytest
from analytics.ner_chile import ChileNER

def test_extract_authorities():
    text = "El Presidente Gabriel Boric junto al ministro Mario Marcel y la vocera Camila Vallejo anunciaron medidas económicas en La Moneda."
    entities = ChileNER.extract_entities(text)
    
    assert "Gabriel Boric" in entities["people"]
    assert "Mario Marcel" in entities["people"]
    assert "Camila Vallejo" in entities["people"]
    assert "Gobierno de Chile" in entities["institutions"]

def test_extract_institutions_and_locations():
    text = "Carabineros de Chile y la Fiscalía de Valparaíso investigan hecho ocurrido en Viña del Mar. En tanto, Codelco reportó operaciones normales en la Región de Antofagasta."
    entities = ChileNER.extract_entities(text)
    
    assert "Carabineros de Chile" in entities["institutions"]
    assert "Ministerio Público" in entities["institutions"]
    assert "Codelco" in entities["institutions"]
    assert "Valparaíso" in entities["locations"]
    assert "Viña del Mar" in entities["locations"]
    assert "Región de Antofagasta" in entities["locations"]
