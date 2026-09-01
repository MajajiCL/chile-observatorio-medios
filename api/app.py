# -*- coding: utf-8 -*-
from contextlib import asynccontextmanager
import json
import os
import logging
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from config.settings import settings
from db.database import engine, Base, get_db, SessionLocal
from db.models import Source, Article, Cluster, BlindspotMetric, AuditLog, EconomicIndicator, StateDocument
from api.routes_sources import router as sources_router
from api.routes_clusters import router as clusters_router
from api.routes_blindspots import router as blindspots_router
from api.routes_state_data import router as state_router
from api.routes_arco import router as arco_router
from api.routes_analytics import router as analytics_router
from ingestion.collector import RSSCollector
from ingestion.connectors import EconomicIndicatorConnector, DiarioOficialConnector, CongresoConnector
from analytics.clustering import ClusterEngine

logger = logging.getLogger("api.app")

def init_db_and_seeds():
    """Crea tablas e inserta catálogo base de fuentes si la BD está vacía."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        source_count = db.query(Source).count()
        if source_count == 0:
            seed_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "sources_seed.json")
            if os.path.exists(seed_path):
                with open(seed_path, "r", encoding="utf-8") as f:
                    sources_data = json.load(f)
                
                for s in sources_data:
                    new_src = Source(
                        slug=s["slug"],
                        name=s["name"],
                        url=s["url"],
                        spectrum=s["spectrum"],
                        category=s["category"],
                        ownership=s["ownership"],
                        ownership_type=s["ownership_type"],
                        funding_model=s["funding_model"],
                        facticity_rating=s.get("facticity_rating", "alta"),
                        region=s.get("region", "Nacional"),
                        rss_feeds_json=json.dumps(s.get("rss_feeds", []))
                    )
                    db.add(new_src)
                db.commit()
                logger.info(f"Sembradas {len(sources_data)} fuentes de información chilenas.")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db_and_seeds()
    # Inicializar indicadores económicos
    db = SessionLocal()
    try:
        if db.query(EconomicIndicator).count() == 0:
            await EconomicIndicatorConnector.fetch_and_store_indicators(db)
    except Exception as e:
        logger.debug(f"Aviso al iniciar indicadores: {e}")
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="Observatorio de Información Pública Digital de Chile",
    description="""
    Plataforma de observabilidad, análisis de sesgo y monitoreo transparente de medios chilenos.
    
    Principios de diseño:
    * **Transparencia Estructural**: Detección objetiva de puntos ciegos y asimetrías de cobertura.
    * **Cumplimiento Ley N° 21.719**: Privacidad desde el diseño, exclusión de datos personales y trazabilidad ARCO.
    * **Cumplimiento Ley N° 21.459**: Ingestión controlada, rate-limiting y respeto de directivas robots.txt.
    * **Cumplimiento Ley N° 17.336**: Ejercicio del derecho de cita legítima con resúmenes sintéticos y enlaces originales.
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar endpoints de API REST
app.include_router(sources_router, prefix="/api/v1")
app.include_router(clusters_router, prefix="/api/v1")
app.include_router(blindspots_router, prefix="/api/v1")
app.include_router(state_router, prefix="/api/v1")
app.include_router(arco_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")

@app.get("/api/v1/stats", tags=["Estadísticas Generales"])
def get_global_stats(db: Session = Depends(get_db)):
    return {
        "sources_count": db.query(Source).filter(Source.active == True).count(),
        "articles_indexed_count": db.query(Article).count(),
        "clusters_active_count": db.query(Cluster).filter(Cluster.status == "active").count(),
        "blindspots_detected_count": db.query(BlindspotMetric).filter(BlindspotMetric.is_blindspot == True).count()
    }

async def run_pipeline_task():
    db = SessionLocal()
    try:
        collector = RSSCollector(db)
        await collector.run_ingestion(max_per_feed=settings.MAX_ARTICLES_PER_FEED)
        
        cluster_engine = ClusterEngine(db)
        cluster_engine.process_unclustered_articles()
    finally:
        db.close()

@app.post("/api/v1/ingest/trigger", tags=["Operaciones"])
async def trigger_ingestion(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_pipeline_task)
    return {"status": "success", "message": "Ciclo de recolección y clustering iniciado en segundo plano."}

# Servir Frontend Dashboard
static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

    @app.get("/", include_in_schema=False)
    def serve_frontend_index():
        return FileResponse(os.path.join(static_path, "index.html"))
