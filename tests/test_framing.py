# -*- coding: utf-8 -*-
import pytest
from analytics.framing_analyzer import FramingAnalyzer

def test_framing_analysis():
    sample_articles = [
        {"title": "Escándalo y colapso institucional tras polémico proyecto", "spectrum": "derecha", "source_name": "Medio A"},
        {"title": "Histórico acuerdo y avance en el Congreso Nacional", "spectrum": "izquierda", "source_name": "Medio B"},
        {"title": "Detalles del proyecto de ley despachado por el Senado", "spectrum": "centro", "source_name": "Medio C"}
    ]
    
    analysis = FramingAnalyzer.analyze_cluster_framing(sample_articles)
    
    assert len(analysis["left_headlines_sample"]) == 1
    assert len(analysis["right_headlines_sample"]) == 1
    assert len(analysis["center_headlines_sample"]) == 1
    assert analysis["frame_distribution"]["izquierda_count"] == 1
    assert analysis["frame_distribution"]["derecha_count"] == 1
