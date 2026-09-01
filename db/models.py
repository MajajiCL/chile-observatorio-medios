# -*- coding: utf-8 -*-
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from db.database import Base

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    url = Column(String(255), nullable=False)
    spectrum = Column(String(32), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    ownership = Column(String(255), nullable=False)
    ownership_type = Column(String(64), nullable=False)
    funding_model = Column(String(64), nullable=False)
    facticity_rating = Column(String(32), default="alta")
    region = Column(String(64), default="Nacional")
    active = Column(Boolean, default=True)
    rss_feeds_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    articles = relationship("Article", back_populates="source", cascade="all, delete-orphan")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    url = Column(String(1024), unique=True, index=True, nullable=False)
    author = Column(String(128), nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow, index=True)
    raw_summary = Column(Text, nullable=True)
    clean_text = Column(Text, nullable=True)
    image_url = Column(String(1024), nullable=True)
    category = Column(String(64), nullable=True)
    content_hash = Column(String(64), index=True, nullable=False)
    embedding_json = Column(Text, nullable=True)
    entities_json = Column(Text, nullable=True) # Entidades nombradas detectadas
    status = Column(String(32), default="indexed")
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="articles")
    cluster_links = relationship("ClusterArticle", back_populates="article", cascade="all, delete-orphan")


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), default="General", index=True)
    first_seen_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow, index=True)
    centroid_json = Column(Text, nullable=True)
    article_count = Column(Integer, default=1)
    status = Column(String(32), default="active", index=True)
    
    # Enriquecimiento semántico y LLM
    key_entities_json = Column(Text, nullable=True) # Personas, instituciones, lugares
    framing_analysis_json = Column(Text, nullable=True) # Análisis de tono y encuadre por sector
    ai_summary_json = Column(Text, nullable=True) # Síntesis neutral generada
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cluster_articles = relationship("ClusterArticle", back_populates="cluster", cascade="all, delete-orphan")
    blindspot_metric = relationship("BlindspotMetric", back_populates="cluster", uselist=False, cascade="all, delete-orphan")


class ClusterArticle(Base):
    __tablename__ = "cluster_articles"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False, index=True)
    similarity_score = Column(Float, default=1.0)
    added_at = Column(DateTime, default=datetime.utcnow)

    cluster = relationship("Cluster", back_populates="cluster_articles")
    article = relationship("Article", back_populates="cluster_links")


class BlindspotMetric(Base):
    __tablename__ = "blindspot_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), unique=True, nullable=False, index=True)
    
    left_count = Column(Integer, default=0)
    center_count = Column(Integer, default=0)
    right_count = Column(Integer, default=0)
    institutional_count = Column(Integer, default=0)
    independent_count = Column(Integer, default=0)
    total_sources = Column(Integer, default=0)
    
    left_pct = Column(Float, default=0.0)
    center_pct = Column(Float, default=0.0)
    right_pct = Column(Float, default=0.0)
    
    is_blindspot = Column(Boolean, default=False, index=True)
    blindspot_side = Column(String(32), default="balanced", index=True)
    divergence_score = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    cluster = relationship("Cluster", back_populates="blindspot_metric")


class EconomicIndicator(Base):
    """Registro de indicadores macroeconómicos oficiales de Chile."""
    __tablename__ = "economic_indicators"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), index=True, nullable=False) # UF, DOLAR, EURO, IPC, UTM, IMACEC, TPM
    name = Column(String(64), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(32), default="CLP")
    date = Column(DateTime, index=True, nullable=False)
    source = Column(String(64), default="Banco Central de Chile")
    updated_at = Column(DateTime, default=datetime.utcnow)


class StateDocument(Base):
    """Normas, leyes y boletines oficiales del Estado de Chile."""
    __tablename__ = "state_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(512), nullable=False)
    doc_type = Column(String(64), index=True, nullable=False) # diario_oficial_ley, diario_oficial_decreto, proyecto_ley_senado, proyecto_ley_camara
    document_number = Column(String(64), nullable=True)
    publication_date = Column(DateTime, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    source_url = Column(String(1024), nullable=False)
    raw_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ArcoRequest(Base):
    """Registro de solicitudes de derechos ARCO según Ley N° 21.719."""
    __tablename__ = "arco_requests"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(32), unique=True, index=True, nullable=False)
    request_type = Column(String(32), nullable=False) # acceso, rectificacion, supresion, oposicion
    requester_email_hash = Column(String(64), nullable=False)
    target_identifier_masked = Column(String(128), nullable=False) # Ej: RUT enmascarado o nombre
    description = Column(Text, nullable=False)
    status = Column(String(32), default="pendiente", index=True) # pendiente, en_revision, resuelta, rechazada
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(64), nullable=False, index=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=True)
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
