# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy.orm import Session

from config.settings import settings
from db.models import Article, Cluster, ClusterArticle, AuditLog
from analytics.embeddings import SemanticVectorEngine
from analytics.blindspot_engine import BlindspotEngine

logger = logging.getLogger("analytics.clustering")

class ClusterEngine:
    """
    Motor de agrupamiento y deduplicación incremental de eventos noticiosos.
    Agrupa múltiples notas de distintos medios en torno a un único suceso fáctico.
    """

    def __init__(self, db: Session):
        self.db = db

    def _update_centroid(self, old_centroid: List[float], new_vector: List[float], count: int) -> List[float]:
        """Calcula el nuevo centroide ponderado normalizado."""
        v_old = np.array(old_centroid, dtype=np.float32)
        v_new = np.array(new_vector, dtype=np.float32)
        updated = (v_old * (count - 1) + v_new) / count
        norm = np.linalg.norm(updated)
        if norm > 0:
            updated = updated / norm
        return updated.tolist()

    def process_unclustered_articles(self, similarity_threshold: Optional[float] = None) -> Dict[str, int]:
        """
        Procesa los artículos no agrupados dentro de la ventana de tiempo configurada.
        """
        threshold = similarity_threshold or settings.SIMILARITY_THRESHOLD
        window_start = datetime.utcnow() - timedelta(hours=settings.TEMPORAL_WINDOW_HOURS)
        
        # 1. Obtener artículos pendientes
        articles = (
            self.db.query(Article)
            .filter(Article.status == "indexed")
            .filter(Article.published_at >= window_start)
            .order_by(Article.published_at.asc())
            .all()
        )

        stats = {"articles_processed": len(articles), "clusters_created": 0, "articles_merged": 0}
        if not articles:
            return stats

        # 2. Obtener clusters activos en la ventana
        active_clusters = (
            self.db.query(Cluster)
            .filter(Cluster.status == "active")
            .filter(Cluster.last_seen_at >= window_start)
            .all()
        )

        # Cache de centroides
        cluster_centroids: Dict[int, List[float]] = {}
        for c in active_clusters:
            if c.centroid_json:
                cluster_centroids[c.id] = json.loads(c.centroid_json)

        affected_cluster_ids = set()

        for art in articles:
            # Calcular o cargar embedding
            if art.embedding_json:
                art_vec = json.loads(art.embedding_json)
            else:
                art_vec = SemanticVectorEngine.compute_embedding(art.title, art.clean_text or art.raw_summary or "")
                art.embedding_json = json.dumps(art_vec)

            # Buscar mejor cluster coincidente
            best_cluster_id = None
            best_similarity = 0.0

            for cid, centroid in cluster_centroids.items():
                sim = SemanticVectorEngine.cosine_similarity(art_vec, centroid)
                if sim > best_similarity:
                    best_similarity = sim
                    best_cluster_id = cid

            if best_similarity >= threshold and best_cluster_id is not None:
                # Unir al cluster existente
                cluster = self.db.query(Cluster).filter(Cluster.id == best_cluster_id).first()
                cluster.article_count += 1
                if art.published_at > cluster.last_seen_at:
                    cluster.last_seen_at = art.published_at
                if art.published_at < cluster.first_seen_at:
                    cluster.first_seen_at = art.published_at

                # Actualizar centroide
                new_centroid = self._update_centroid(cluster_centroids[best_cluster_id], art_vec, cluster.article_count)
                cluster.centroid_json = json.dumps(new_centroid)
                cluster_centroids[best_cluster_id] = new_centroid

                # Relacionar
                link = ClusterArticle(
                    cluster_id=cluster.id,
                    article_id=art.id,
                    similarity_score=best_similarity,
                    added_at=datetime.utcnow()
                )
                self.db.add(link)
                art.status = "clustered"
                stats["articles_merged"] += 1
                affected_cluster_ids.add(cluster.id)

            else:
                # Crear nuevo cluster
                new_cluster = Cluster(
                    title=art.title,
                    description=art.raw_summary or art.clean_text[:400] if art.clean_text else "",
                    category=art.category or "General",
                    first_seen_at=art.published_at,
                    last_seen_at=art.published_at,
                    centroid_json=json.dumps(art_vec),
                    article_count=1,
                    status="active",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                self.db.add(new_cluster)
                self.db.flush() # Para obtener ID

                link = ClusterArticle(
                    cluster_id=new_cluster.id,
                    article_id=art.id,
                    similarity_score=1.0,
                    added_at=datetime.utcnow()
                )
                self.db.add(link)
                art.status = "clustered"
                cluster_centroids[new_cluster.id] = art_vec
                stats["clusters_created"] += 1
                affected_cluster_ids.add(new_cluster.id)

        self.db.commit()

        # 3. Recalcular métricas de Puntos Ciegos para los clusters afectados
        blindspot_engine = BlindspotEngine(self.db)
        for cid in affected_cluster_ids:
            blindspot_engine.calculate_cluster_metrics(cid)

        return stats
