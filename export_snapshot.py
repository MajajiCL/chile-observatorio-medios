import json, os
from db.database import SessionLocal
from db.models import Source, Article, Cluster, ClusterArticle, BlindspotMetric, EconomicIndicator, StateDocument
from analytics.ner_chile import ChileNER
from analytics.summarizer import MultiAngleSummarizer

base_dir = r"C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios"
os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)

db = SessionLocal()
try:
    sources = db.query(Source).filter(Source.active == True).all()
    sources_data = [{
        "id": s.id,
        "slug": s.slug,
        "name": s.name,
        "url": s.url,
        "spectrum": s.spectrum,
        "category": s.category,
        "ownership": s.ownership,
        "ownership_type": s.ownership_type,
        "funding_model": s.funding_model,
        "facticity_rating": s.facticity_rating,
        "region": s.region,
        "total_articles": db.query(Article).filter(Article.source_id == s.id).count()
    } for s in sources]

    indicators = db.query(EconomicIndicator).all()
    indicators_data = [{
        "code": i.code,
        "name": i.name,
        "value": i.value,
        "unit": i.unit,
        "date": i.date.isoformat() if i.date else None,
        "source": i.source
    } for i in indicators]

    clusters = db.query(Cluster).filter(Cluster.status == "active").order_by(Cluster.last_seen_at.desc()).all()
    clusters_data = []
    blindspots_data = []
    
    for c in clusters:
        metric = c.blindspot_metric
        blindspot_dict = {
            "is_blindspot": metric.is_blindspot if metric else False,
            "side": metric.blindspot_side if metric else "insufficient_sources",
            "left_pct": metric.left_pct if metric else 0.0,
            "center_pct": metric.center_pct if metric else 0.0,
            "right_pct": metric.right_pct if metric else 0.0,
            "divergence_score": metric.divergence_score if metric else 0.0
        } if metric else None

        cluster_item = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "article_count": c.article_count,
            "first_seen_at": c.first_seen_at.isoformat() if c.first_seen_at else None,
            "last_seen_at": c.last_seen_at.isoformat() if c.last_seen_at else None,
            "blindspot": blindspot_dict
        }
        clusters_data.append(cluster_item)

        if metric and metric.is_blindspot:
            blindspots_data.append({
                "cluster_id": c.id,
                "title": c.title,
                "category": c.category,
                "article_count": c.article_count,
                "first_seen_at": c.first_seen_at.isoformat() if c.first_seen_at else None,
                "blindspot_side": metric.blindspot_side,
                "coverage": {
                    "left_pct": metric.left_pct,
                    "center_pct": metric.center_pct,
                    "right_pct": metric.right_pct,
                    "left_count": metric.left_count,
                    "center_count": metric.center_count,
                    "right_count": metric.right_count
                },
                "divergence_score": metric.divergence_score,
                "explanation": (
                    "Noticia cubierta mayoritariamente por medios del sector derecho. La prensa de izquierda presenta una cobertura nula o mínima."
                    if metric.blindspot_side == "blindspot_left" else
                    "Noticia cubierta mayoritariamente por medios del sector izquierdo. La prensa de derecha presenta una cobertura nula o mínima."
                )
            })

    # Analítica y Entidades
    articles = db.query(Article).order_by(Article.published_at.desc()).limit(100).all()
    all_text = " ".join([a.title + " " + (a.clean_text or "") for a in articles])
    entities = ChileNER.extract_entities(all_text)

    # Detalle de cada cluster con sus artículos para el modal
    clusters_detail = {}
    for c in clusters:
        arts = (
            db.query(Article, Source, ClusterArticle.similarity_score)
            .join(ClusterArticle, ClusterArticle.article_id == Article.id)
            .join(Source, Source.id == Article.source_id)
            .filter(ClusterArticle.cluster_id == c.id)
            .order_by(Article.published_at.desc())
            .all()
        )
        clusters_detail[str(c.id)] = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "articles": [{
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "snippet": a.clean_text[:250] + "..." if a.clean_text else (a.raw_summary[:250] if a.raw_summary else ""),
                "similarity_score": round(sim, 3),
                "source": {
                    "id": src.id,
                    "name": src.name,
                    "slug": src.slug,
                    "spectrum": src.spectrum,
                    "ownership": src.ownership
                }
            } for a, src, sim in arts]
        }

    snapshot = {
        "generated_at": clusters[0].last_seen_at.isoformat() if clusters and clusters[0].last_seen_at else None,
        "stats": {
            "sources_count": len(sources),
            "articles_indexed_count": db.query(Article).count(),
            "clusters_active_count": len(clusters),
            "blindspots_detected_count": len(blindspots_data)
        },
        "economic_indicators": indicators_data,
        "sources": sources_data,
        "clusters": clusters_data,
        "clusters_detail": clusters_detail,
        "blindspots": blindspots_data,
        "entities": entities,
        "plurality": {
            "total_events": len(clusters),
            "balanced_events": len([c for c in clusters if c.blindspot_metric and c.blindspot_metric.blindspot_side == "balanced"]),
            "left_blindspots": len([c for c in clusters if c.blindspot_metric and c.blindspot_metric.blindspot_side == "blindspot_left"]),
            "right_blindspots": len([c for c in clusters if c.blindspot_metric and c.blindspot_metric.blindspot_side == "blindspot_right"]),
            "skewed_events": len([c for c in clusters if c.blindspot_metric and c.blindspot_metric.blindspot_side == "skewed"])
        }
    }

    with open(os.path.join(base_dir, "data", "snapshot.json"), "w", encoding="utf-8") as f:
        json.dump(snapshot, f, indent=2, ensure_ascii=False)
    print("Snapshot generado con éxito en data/snapshot.json.")
finally:
    db.close()
