# -*- coding: utf-8 -*-
import argparse
import asyncio
import json
import os
import sys
from datetime import datetime

from db.database import engine, Base, SessionLocal
from db.models import Source, Article, Cluster, BlindspotMetric, AuditLog, EconomicIndicator, StateDocument, ArcoRequest
from api.app import init_db_and_seeds
from ingestion.collector import RSSCollector
from ingestion.connectors import EconomicIndicatorConnector, DiarioOficialConnector, CongresoConnector
from analytics.clustering import ClusterEngine
from analytics.blindspot_engine import BlindspotEngine
from analytics.ner_chile import ChileNER

def cmd_init_db():
    print("Inicializando base de datos y cargando catálogo de medios chilenos...")
    init_db_and_seeds()
    db = SessionLocal()
    try:
        count = db.query(Source).count()
        print(f"[OK] Base de datos lista. {count} medios y fuentes cargados con éxito.")
    finally:
        db.close()

def cmd_ingest(limit_per_feed: int = 10):
    print(f"Ejecutando recolección de feeds RSS de medios chilenos (límite: {limit_per_feed} por feed)...")
    init_db_and_seeds()
    db = SessionLocal()
    try:
        collector = RSSCollector(db)
        stats = asyncio.run(collector.run_ingestion(max_per_feed=limit_per_feed))
        print("\n--- RESUMEN DE INGESTA ---")
        print(f"Fuentes consultadas: {stats.get('sources', 0)}")
        print(f"Artículos procesados: {stats.get('processed', 0)}")
        print(f"Nuevos artículos indexados: {stats.get('inserted', 0)}")
        print(f"Artículos sanitizados (Ley 21.719 PII): {stats.get('pii_sanitized', 0)}")
    finally:
        db.close()

def cmd_cluster(threshold: float = 0.52):
    print(f"Ejecutando agrupamiento y clustering semántico (umbral similitud: {threshold})...")
    init_db_and_seeds()
    db = SessionLocal()
    try:
        engine_cluster = ClusterEngine(db)
        stats = engine_cluster.process_unclustered_articles(similarity_threshold=threshold)
        print("\n--- RESUMEN DE CLUSTERING ---")
        print(f"Artículos procesados: {stats.get('articles_processed', 0)}")
        print(f"Nuevos eventos/clusters creados: {stats.get('clusters_created', 0)}")
        print(f"Artículos asociados a eventos existentes: {stats.get('articles_merged', 0)}")
    finally:
        db.close()

def cmd_sync_state():
    print("Sincronizando datos oficiales del Estado (Indicadores económicos, Diario Oficial y Congreso)...")
    init_db_and_seeds()
    db = SessionLocal()
    try:
        stats_econ = asyncio.run(EconomicIndicatorConnector.fetch_and_store_indicators(db))
        stats_do = asyncio.run(DiarioOficialConnector.fetch_latest_norms(db))
        stats_leg = asyncio.run(CongresoConnector.fetch_legislative_updates(db))
        print("\n--- RESUMEN DATOS DE ESTADO ---")
        print(f"Indicadores Banco Central actualizados: {stats_econ}")
        print(f"Normas Diario Oficial indexadas: {stats_do}")
        print(f"Boletines legislativos indexados: {stats_leg}")
    finally:
        db.close()

def cmd_pipeline(limit_per_feed: int = 10):
    print("=== INICIANDO PIPELINE COMPLETO DEL OBSERVATORIO ===")
    cmd_init_db()
    cmd_sync_state()
    cmd_ingest(limit_per_feed=limit_per_feed)
    cmd_cluster()
    cmd_report()

def cmd_report():
    init_db_and_seeds()
    db = SessionLocal()
    try:
        total_sources = db.query(Source).count()
        total_articles = db.query(Article).count()
        total_clusters = db.query(Cluster).count()
        indicators = db.query(EconomicIndicator).all()
        
        blindspots = (
            db.query(Cluster, BlindspotMetric)
            .join(BlindspotMetric, BlindspotMetric.cluster_id == Cluster.id)
            .filter(BlindspotMetric.is_blindspot == True)
            .all()
        )

        print("\n" + "="*70)
        print("   OBSERVATORIO DE INFORMACION PUBLICA DIGITAL DE CHILE   ")
        print("="*70)
        print(f"  Fuentes monitoreadas:       {total_sources}")
        print(f"  Artículos totales en base:  {total_articles}")
        print(f"  Eventos fácticos agrupados: {total_clusters}")
        print(f"  Puntos Ciegos activos:      {len(blindspots)}")
        print("-"*70)
        
        if indicators:
            print("  INDICADORES OFICIALES:")
            ind_line = " | ".join([f"{i.code}: {i.value} {i.unit}" for i in indicators[:5]])
            print(f"  {ind_line}")
            print("-"*70)

        if blindspots:
            print("\n>>> PUNTOS CIEGOS DETECTADOS EN LA AGENDA:")
            for cluster, metric in blindspots[:10]:
                lado = "IZQUIERDA (Cobertura masiva en Derecha)" if metric.blindspot_side == "blindspot_left" else "DERECHA (Cobertura masiva en Izquierda)"
                print(f"\n[EVENTO #{cluster.id}] {cluster.title}")
                print(f"  - Artículos vinculados: {cluster.article_count}")
                print(f"  - Punto Ciego de: {lado}")
                print(f"  - Cobertura: Izq: {metric.left_pct*100:.1f}% | Centro: {metric.center_pct*100:.1f}% | Der: {metric.right_pct*100:.1f}%")
                print(f"  - Divergencia: {metric.divergence_score:.2f}")
        else:
            print("\nNo se registran asimetrías extremas en los clusters actuales (cobertura transversal o fuentes insuficientes).")

        print("="*70 + "\n")
    finally:
        db.close()

def cmd_serve(host: str = "127.0.0.1", port: int = 8000):
    import uvicorn
    print(f"Iniciando servidor API y Dashboard en http://{host}:{port}...")
    uvicorn.run("api.app:app", host=host, port=port, reload=False)

def main():
    parser = argparse.ArgumentParser(description="CLI del Observatorio de Medios de Chile")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")

    subparsers.add_parser("init-db", help="Inicializar esquema y sembrar catálogo de medios")
    
    ingest_parser = subparsers.add_parser("ingest", help="Recolectar feeds RSS en vivo")
    ingest_parser.add_argument("--limit", type=int, default=10, help="Límite de artículos por feed")

    cluster_parser = subparsers.add_parser("cluster", help="Agrupar notas en clusters de eventos")
    cluster_parser.add_argument("--threshold", type=float, default=0.52, help="Umbral de similitud semántica")

    subparsers.add_parser("sync-state", help="Sincronizar indicadores económicos y Diario Oficial")

    pipe_parser = subparsers.add_parser("pipeline", help="Ejecutar ciclo completo (ingesta + estado + clustering + reporte)")
    pipe_parser.add_argument("--limit", type=int, default=10, help="Límite de artículos por feed")

    subparsers.add_parser("report", help="Mostrar reporte de estado y puntos ciegos")

    serve_parser = subparsers.add_parser("serve", help="Levantar servidor FastAPI y Dashboard Web")
    serve_parser.add_argument("--host", type=str, default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=8000)

    args = parser.parse_args()

    if args.command == "init-db":
        cmd_init_db()
    elif args.command == "ingest":
        cmd_ingest(limit_per_feed=args.limit)
    elif args.command == "cluster":
        cmd_cluster(threshold=args.threshold)
    elif args.command == "sync-state":
        cmd_sync_state()
    elif args.command == "pipeline":
        cmd_pipeline(limit_per_feed=args.limit)
    elif args.command == "report":
        cmd_report()
    elif args.command == "serve":
        cmd_serve(host=args.host, port=args.port)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
