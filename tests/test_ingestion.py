# -*- coding: utf-8 -*-
import pytest
from ingestion.pii_filter import PIIFilter
from ingestion.extractor import ArticleExtractor

def test_pii_filter_chilean_rut():
    sample_text = "El ciudadano Juan Perez, RUT 12.345.678-9 y su socio con RUT 9876543-K asistieron a la reunión."
    sanitized, counts = PIIFilter.sanitize_text(sample_text)
    
    assert counts["ruts"] == 2
    assert "12.345.678-9" not in sanitized
    assert "9876543-K" not in sanitized
    assert "[RUT_PROTEGIDO_LEY_21719]" in sanitized

def test_pii_filter_phone_and_email():
    sample_text = "Para consultas contactar a contacto@empresa.cl o al fono +56 9 8765 4321."
    sanitized, counts = PIIFilter.sanitize_text(sample_text)
    
    assert counts["emails"] == 1
    assert counts["phones"] == 1
    assert "contacto@empresa.cl" not in sanitized
    assert "+56 9 8765 4321" not in sanitized
    assert "[EMAIL_PROTEGIDO]" in sanitized
    assert "[TELÉFONO_PROTEGIDO]" in sanitized

def test_article_extractor_clean_html():
    html = """
    <html>
        <head><title>Titulo de Noticia</title></head>
        <body>
            <nav>Menu de navegacion no deseado</nav>
            <div class="ad-banner">Publicidad molesta</div>
            <article>
                <h1>Presidente de la Republica promulga nueva ley</h1>
                <p>En una ceremonia oficial en el Palacio de La Moneda, se promulgo la normativa que beneficia a miles de familias.</p>
                <p>La ministra del Trabajo destaco los amplios acuerdos alcanzados en el Congreso Nacional durante la tramitacion.</p>
            </article>
            <footer>Pie de pagina con copyright</footer>
        </body>
    </html>
    """
    clean_text = ArticleExtractor.clean_html_content(html)
    
    assert "Menu de navegacion" not in clean_text
    assert "Publicidad molesta" not in clean_text
    assert "Palacio de La Moneda" in clean_text
    assert "Congreso Nacional" in clean_text
