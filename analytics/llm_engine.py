# -*- coding: utf-8 -*-
import json
import logging
from typing import Dict, List, Any, Optional
import httpx

from config.settings import settings
from analytics.ner_chile import ChileNER
from analytics.framing_analyzer import FramingAnalyzer

logger = logging.getLogger("analytics.llm_engine")

class LLMSynthesizer:
    """
    Motor de síntesis neutral y objetiva de eventos noticiosos.
    Genera resúmenes fácticos sin adjetivos valorativos y contrasta los enfoques de cobertura.
    """

    @classmethod
    def synthesize_cluster(cls, cluster_title: str, articles_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera la síntesis objetiva fáctica y análisis de encuadre.
        """
        if not articles_data:
            return {}

        all_text = " ".join([a.get("title", "") + ". " + a.get("snippet", "") for a in articles_data])
        
        # 1. Extracción de Entidades Chilenas (NER)
        entities = ChileNER.extract_entities(all_text)
        
        # 2. Análisis de Encuadre de Titulares
        framing = FramingAnalyzer.analyze_cluster_framing(articles_data)

        # 3. Construcción del resumen fáctico estructurado
        hechos_puntos = []
        for a in articles_data[:3]:
            title = a.get("title", "").strip()
            source = a.get("source_name", "")
            hechos_puntos.append(f"• Según informó {source}: {title}")

        summary = {
            "title": cluster_title,
            "core_facts": hechos_puntos,
            "entities": entities,
            "framing_comparison": framing,
            "total_perspectives": len(articles_data),
            "methodology_note": "Resumen factual sintetizado objetivamente a partir de la correlación de despachos públicos, preservando el derecho de cita y atribución según la Ley N° 17.336."
        }

        return summary
