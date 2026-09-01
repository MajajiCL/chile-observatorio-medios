# -*- coding: utf-8 -*-
from bs4 import BeautifulSoup
import re
from typing import Dict, Any, Optional
from datetime import datetime

class ArticleExtractor:
    """
    Extractor y normalizador de contenido de noticias.
    Elimina elementos publicitarios, scripts, menús y estilos, extrayendo el cuerpo central
    y metadatos estructurados.
    """

    UNWANTED_TAGS = ["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "form"]
    UNWANTED_CLASSES = [
        "banner", "ad", "ads", "advertising", "social-share", "share-buttons",
        "comments", "comment-box", "sidebar", "related-posts", "paywall-banner",
        "newsletter-signup", "cookie-notice", "popup"
    ]

    @classmethod
    def clean_html_content(cls, html_content: str) -> str:
        """Extrae texto limpio y legible del cuerpo HTML."""
        if not html_content:
            return ""

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Eliminar etiquetas no informativas
        for tag in soup(cls.UNWANTED_TAGS):
            tag.decompose()

        # 2. Eliminar elementos por clase de publicidad/navegación
        for class_pattern in cls.UNWANTED_CLASSES:
            for element in soup.find_all(attrs={"class": re.compile(class_pattern, re.IGNORECASE)}):
                element.decompose()

        # 3. Extraer párrafos con longitud significativa
        paragraphs = soup.find_all(["p", "h1", "h2", "h3", "h4", "blockquote"])
        extracted_text = []
        for p in paragraphs:
            text = p.get_text(separator=" ", strip=True)
            if len(text) > 20: # Ignorar fragmentos irrelevantes o botones
                extracted_text.append(text)

        if not extracted_text:
            # Fallback a texto plano del body o raiz
            body_text = soup.get_text(separator=" ", strip=True)
            return re.sub(r'\s+', ' ', body_text).strip()

        return "\n\n".join(extracted_text)

    @classmethod
    def extract_metadata_from_html(cls, html_content: str) -> Dict[str, Any]:
        """Extrae metadatos OpenGraph y tags canónicos."""
        if not html_content:
            return {}

        soup = BeautifulSoup(html_content, "html.parser")
        meta = {}

        # Título
        og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "twitter:title"})
        if og_title and og_title.get("content"):
            meta["title"] = og_title["content"].strip()
        elif soup.title and soup.title.string:
            meta["title"] = soup.title.string.strip()

        # Descripción
        og_desc = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
        if og_desc and og_desc.get("content"):
            meta["description"] = og_desc["content"].strip()

        # Imagen
        og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
        if og_img and og_img.get("content"):
            meta["image_url"] = og_img["content"].strip()

        # Autor
        author = soup.find("meta", attrs={"name": "author"}) or soup.find("meta", property="article:author")
        if author and author.get("content"):
            meta["author"] = author["content"].strip()

        # URL Canónica
        canonical = soup.find("link", rel="canonical")
        if canonical and canonical.get("href"):
            meta["canonical_url"] = canonical["href"].strip()

        return meta
