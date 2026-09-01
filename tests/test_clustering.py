# -*- coding: utf-8 -*-
import pytest
from analytics.embeddings import SemanticVectorEngine

def test_semantic_vector_similarity():
    # Dos notas sobre el mismo suceso (Cobre / Codelco)
    title1 = "Codelco anuncia millonaria inversion en division El Teniente"
    text1 = "La cuprifera estatal Codelco confirmo un plan de expansion minera para elevar la produccion de cobre."
    
    title2 = "Inversion historica de Codelco en yacimiento El Teniente"
    text2 = "La empresa estatal de cobre expandira sus operaciones mineras en la region de OHiggins."
    
    # Una nota sobre un tema completamente distinto (Futbol)
    title3 = "Colo Colo clasifica a cuartos de final de Copa Libertadores"
    text3 = "El cuadro albo vencio por dos goles a uno en un vibrante encuentro disputado en el Estadio Monumental."
    
    v1 = SemanticVectorEngine.compute_embedding(title1, text1)
    v2 = SemanticVectorEngine.compute_embedding(title2, text2)
    v3 = SemanticVectorEngine.compute_embedding(title3, text3)
    
    sim_same_topic = SemanticVectorEngine.cosine_similarity(v1, v2)
    sim_diff_topic = SemanticVectorEngine.cosine_similarity(v1, v3)
    
    # La similitud entre notas del mismo tema debe ser superior al umbral y mucho mayor que temas distintos
    assert sim_same_topic >= 0.30
    assert sim_diff_topic <= 0.05
    assert sim_same_topic > (sim_diff_topic * 5)
