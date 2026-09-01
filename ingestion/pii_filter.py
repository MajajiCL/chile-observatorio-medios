# -*- coding: utf-8 -*-
import re
from typing import Tuple, List, Dict
from config.settings import settings

class PIIFilter:
    """
    Filtro y sanitizador preventivo de datos personales según la Ley N° 21.719
    (Protección de Datos Personales en Chile - Privacy by Design).
    
    Enmascara identificadores personales privados (RUTs, teléfonos particulares,
    correos electrónicos) mientras preserva la mención a autoridades e instituciones
    públicas en ejercicio de sus funciones.
    """
    
    # Expresión regular para RUT chileno (con o sin puntos, con guion y dígito verificador)
    RUT_REGEX = re.compile(r'\b(?:\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]|\d{7,8}-[\dkK])\b')
    
    # Expresión regular para teléfonos celulares y fijos de Chile
    PHONE_REGEX = re.compile(r'(?:\+?56\s?(?:9\s?\d{4}\s?\d{4}|2\s?\d{4}\s?\d{4}|\d{2}\s?\d{3}\s?\d{4}))\b')
    
    # Expresión regular para correos electrónicos
    EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

    @classmethod
    def sanitize_text(cls, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Sanitiza el texto aplicando los filtros de privacidad.
        Retorna el texto sanitizado y un resumen de las máscaras aplicadas para trazabilidad y auditoría.
        """
        if not text or not settings.PII_FILTER_ENABLED:
            return text or "", {"ruts": 0, "phones": 0, "emails": 0}

        counts = {"ruts": 0, "phones": 0, "emails": 0}
        
        # 1. Sanitizar RUTs
        if settings.MASK_RUTS:
            ruts_found = cls.RUT_REGEX.findall(text)
            if ruts_found:
                counts["ruts"] = len(ruts_found)
                text = cls.RUT_REGEX.sub("[RUT_PROTEGIDO_LEY_21719]", text)

        # 2. Sanitizar Correos
        if settings.MASK_EMAILS:
            emails_found = cls.EMAIL_REGEX.findall(text)
            if emails_found:
                counts["emails"] = len(emails_found)
                text = cls.EMAIL_REGEX.sub("[EMAIL_PROTEGIDO]", text)

        # 3. Sanitizar Teléfonos
        if settings.MASK_PHONES:
            phones_found = cls.PHONE_REGEX.findall(text)
            if phones_found:
                counts["phones"] = len(phones_found)
                text = cls.PHONE_REGEX.sub("[TELÉFONO_PROTEGIDO]", text)

        return text, counts
