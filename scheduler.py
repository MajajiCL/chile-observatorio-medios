# -*- coding: utf-8 -*-
import asyncio
import logging
import time
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler

from db.database import SessionLocal
from ingestion.collector import RSSCollector
from ingestion.connectors import EconomicIndicatorConnector, DiarioOficialConnector, CongresoConnector
from analytics.clustering import ClusterEngine
from api.app import init_db_and_seeds

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("scheduler")

def job_ingest_and_cluster():
    """Ejecuta el ciclo de ingesta continua y deduplicación de eventos."""
    logger.info(">>> Iniciando ciclo programado de ingesta y clustering...")
    db = SessionLocal()
    try:
        collector = RSSCollector(db)
        stats_ingest = asyncio.run(collector.run_ingestion(max_per_feed=15))
        logger.info(f"Ingesta completada: {stats_ingest}")

        cluster_engine = ClusterEngine(db)
        stats_cluster = cluster_engine.process_unclustered_articles()
        logger.info(f"Clustering completado: {stats_cluster}")
    except Exception as e:
        logger.error(f"Error en tarea de ingesta/clustering: {e}")
    finally:
        db.close()

def job_sync_state_and_economics():
    """Sincroniza indicadores oficiales del Banco Central y fuentes del Estado."""
    logger.info(">>> Sincronizando indicadores macroeconómicos y Diario Oficial...")
    db = SessionLocal()
    try:
        asyncio.run(EconomicIndicatorConnector.fetch_and_store_indicators(db))
        asyncio.run(DiarioOficialConnector.fetch_latest_norms(db))
        asyncio.run(CongresoConnector.fetch_legislative_updates(db))
        logger.info("Datos oficiales actualizados.")
    except Exception as e:
        logger.error(f"Error sincronizando datos de Estado: {e}")
    finally:
        db.close()

def main():
    logger.info("Inicializando base de datos del Observatorio...")
    init_db_and_seeds()

    # Ejecutar primera ronda de inmediato
    job_sync_state_and_economics()
    job_ingest_and_cluster()

    scheduler = BlockingScheduler()
    # Ejecutar cada 15 minutos
    scheduler.add_job(job_ingest_and_cluster, 'interval', minutes=15, id='job_ingest_cluster')
    # Ejecutar cada 30 minutos
    scheduler.add_job(job_sync_state_and_economics, 'interval', minutes=30, id='job_state_sync')

    logger.info("Scheduler activo. Tareas programadas cada 15 y 30 minutos.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler detenido por el usuario.")

if __name__ == "__main__":
    main()
