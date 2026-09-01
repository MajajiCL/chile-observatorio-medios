# -*- coding: utf-8 -*-
from typing import Dict, List, Any
import re

class FramingAnalyzer:
    """
    Analizador de encuadre léxico y contraste editorial.
    Compara los titulares y adjetivaciones empleados por los distintos sectores políticos
    al cubrir un mismo hecho noticioso.
    """

    CRITICAL_LEXICON = {
        "conflicto_crisis": ["crisis", "colapso", "escándalo", "fracaso", "tensión", "quiebre", "polémica", "furia", "duro golpe", "desplome"],
        "institucional_acuerdo": ["acuerdo", "avance", "histórico", "consenso", "promulgación", "despacho", "aprobación", "diálogo", "estabilidad"],
        "seguridad_orden": ["crimen", "inseguridad", "violencia", "delincuencia", "narcotráfico", "atentado", "detención", "homicidio", "amenaza"],
        "economico_impacto": ["inversión", "crecimiento", "empleo", "inflación", "desaceleración", "déficit", "utilidades", "costo de la vida"]
    }

    @classmethod
    def analyze_cluster_framing(cls, articles_with_sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analiza cómo titulan los distintos bloques sobre el mismo suceso.
        """
        blocks = {
            "izquierda": [],
            "centro": [],
            "derecha": [],
            "otros": []
        }

        for item in articles_with_sources:
            spectrum = item.get("spectrum", "centro")
            title = item.get("title", "")
            source_name = item.get("source_name", "")

            target_block = "centro"
            if spectrum in ["izquierda", "centro-izquierda"]:
                target_block = "izquierda"
            elif spectrum in ["derecha", "centro-derecha"]:
                target_block = "derecha"
            elif spectrum in ["institucional-oficial", "investigacion-no-alineada"]:
                target_block = "otros"

            # Detectar categorías léxicas presentes en el titular
            frames_detected = []
            for category, terms in cls.CRITICAL_LEXICON.items():
                for term in terms:
                    if re.search(r'\b' + re.escape(term) + r'\b', title, re.IGNORECASE):
                        frames_detected.append(category)
                        break

            blocks[target_block].append({
                "title": title,
                "source": source_name,
                "frames": frames_detected
            })

        # Resumen comparativo de encuadre
        comparison = {
            "left_headlines_sample": [b["title"] for b in blocks["izquierda"][:3]],
            "right_headlines_sample": [b["title"] for b in blocks["derecha"][:3]],
            "center_headlines_sample": [b["title"] for b in blocks["centro"][:3]],
            "frame_distribution": {
                "izquierda_count": len(blocks["izquierda"]),
                "derecha_count": len(blocks["derecha"]),
                "centro_count": len(blocks["centro"]),
            }
        }

        return comparison
