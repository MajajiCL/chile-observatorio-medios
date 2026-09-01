# -*- coding: utf-8 -*-
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base
from db.models import Source, Article, Cluster, ClusterArticle, BlindspotMetric
from analytics.blindspot_engine import BlindspotEngine

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Crear fuentes representativas de los 3 bloques
    src_der1 = Source(slug="der1", name="Medio Derecha 1", url="http://d1.cl", spectrum="derecha", category="prensa-tradicional", ownership="Corp D1", ownership_type="privado", funding_model="pub", rss_feeds_json="[]")
    src_der2 = Source(slug="der2", name="Medio Derecha 2", url="http://d2.cl", spectrum="centro-derecha", category="prensa-tradicional", ownership="Corp D2", ownership_type="privado", funding_model="pub", rss_feeds_json="[]")
    src_izq1 = Source(slug="izq1", name="Medio Izquierda 1", url="http://i1.cl", spectrum="izquierda", category="prensa-digital", ownership="Corp I1", ownership_type="privado", funding_model="pub", rss_feeds_json="[]")
    src_izq2 = Source(slug="izq2", name="Medio Izquierda 2", url="http://i2.cl", spectrum="centro-izquierda", category="prensa-digital", ownership="Corp I2", ownership_type="privado", funding_model="pub", rss_feeds_json="[]")
    src_cen1 = Source(slug="cen1", name="Medio Centro", url="http://c1.cl", spectrum="centro", category="prensa-tradicional", ownership="Corp C1", ownership_type="privado", funding_model="pub", rss_feeds_json="[]")
    
    session.add_all([src_der1, src_der2, src_izq1, src_izq2, src_cen1])
    session.commit()
    
    yield session
    session.close()

def test_blindspot_detection_right_skewed(test_db):
    """Prueba un evento cubierto 80% por la derecha y 0% por la izquierda."""
    cluster = Cluster(title="Caso de discusion tributaria y gasto publico", article_count=4)
    test_db.add(cluster)
    test_db.flush()
    
    # Crear 4 notas de derecha y 1 de centro
    src_d1 = test_db.query(Source).filter_by(slug="der1").first()
    src_d2 = test_db.query(Source).filter_by(slug="der2").first()
    src_c = test_db.query(Source).filter_by(slug="cen1").first()
    
    for i, src in enumerate([src_d1, src_d2, src_d1, src_c]):
        art = Article(source_id=src.id, title=f"Nota {i}", url=f"http://test.cl/{i}", content_hash=f"hash{i}")
        test_db.add(art)
        test_db.flush()
        link = ClusterArticle(cluster_id=cluster.id, article_id=art.id)
        test_db.add(link)
    
    test_db.commit()
    
    engine = BlindspotEngine(test_db)
    metric = engine.calculate_cluster_metrics(cluster.id)
    
    assert metric.is_blindspot is True
    assert metric.blindspot_side == "blindspot_left" # Punto ciego para la izquierda
    assert metric.right_pct >= 0.65
    assert metric.left_pct == 0.0

def test_blindspot_detection_balanced(test_db):
    """Prueba un evento con cobertura equilibrada transversal."""
    cluster = Cluster(title="Terremoto en el norte grande de Chile", article_count=4)
    test_db.add(cluster)
    test_db.flush()
    
    src_d1 = test_db.query(Source).filter_by(slug="der1").first()
    src_i1 = test_db.query(Source).filter_by(slug="izq1").first()
    src_c = test_db.query(Source).filter_by(slug="cen1").first()
    
    for i, src in enumerate([src_d1, src_i1, src_c, src_c]):
        art = Article(source_id=src.id, title=f"Sismo {i}", url=f"http://sismo.cl/{i}", content_hash=f"shash{i}")
        test_db.add(art)
        test_db.flush()
        link = ClusterArticle(cluster_id=cluster.id, article_id=art.id)
        test_db.add(link)
    
    test_db.commit()
    
    engine = BlindspotEngine(test_db)
    metric = engine.calculate_cluster_metrics(cluster.id)
    
    assert metric.is_blindspot is False
    assert metric.blindspot_side == "balanced"
