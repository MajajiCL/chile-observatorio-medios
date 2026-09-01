# -*- coding: utf-8 -*-
import re
from typing import Dict, List, Set, Any

class ChileNER:
    """
    Reconocedor y extractor de entidades nombradas contextualizado para Chile.
    Identifica:
    1. Autoridades y figuras públicas de relevancia política y social.
    2. Organismos del Estado e instituciones nacionales.
    3. Comunas y regiones político-administrativas de Chile.
    """

    CHILEAN_REGIONS = [
        "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
        "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
        "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
    ]

    CHILEAN_KEY_CITIES_COMUNAS = [
        "Santiago", "Valparaíso", "Viña del Mar", "Concepción", "La Serena", "Coquimbo",
        "Temuco", "Antofagasta", "Iquique", "Rancagua", "Talca", "Chillán", "Puerto Montt",
        "Valdivia", "Arica", "Punta Arenas", "Copiapó", "Calama", "Quillota", "San Antonio",
        "Las Condes", "Providencia", "Ñuñoa", "Maipú", "Puente Alto", "La Florida", "Recoleta",
        "Santiago Centro", "Vitacura", "Lo Barnechea", "Estación Central", "San Miguel"
    ]

    CHILEAN_INSTITUTIONS = {
        "Gobierno de Chile": [r"\bGobierno\b", r"\bLa Moneda\b", r"\bPresidencia\b", r"\bEjecutivo\b"],
        "Congreso Nacional": [r"\bCongreso\b", r"\bSenado\b", r"\bCámara de Diputadas y Diputados\b", r"\bCámara de Diputados\b"],
        "Poder Judicial": [r"\bCorte Suprema\b", r"\bCorte de Apelaciones\b", r"\bPoder Judicial\b", r"\bTribunal Constitucional\b"],
        "Ministerio Público": [r"\bFiscalía\b", r"\bMinisterio Público\b", r"\bFiscal Nacional\b"],
        "Carabineros de Chile": [r"\bCarabineros\b", r"\bPolicía de Carabineros\b"],
        "Policía de Investigaciones (PDI)": [r"\bPDI\b", r"\bPolicía de Investigaciones\b"],
        "Banco Central de Chile": [r"\bBanco Central\b"],
        "Codelco": [r"\bCodelco\b", r"\bCorporación Nacional del Cobre\b"],
        "Contraloría General": [r"\bContraloría\b", r"\bCGR\b"],
        "Servicio de Impuestos Internos (SII)": [r"\bSII\b", r"\bServicio de Impuestos Internos\b"],
        "Comisión para el Mercado Financiero (CMF)": [r"\bCMF\b", r"\bComisión para el Mercado Financiero\b"],
        "Servel": [r"\bServel\b", r"\bServicio Electoral\b"]
    }

    CHILEAN_PUBLIC_FIGURES = {
        "Gabriel Boric": [r"\bGabriel Boric\b", r"\bPresidente Boric\b", r"\bMandatario\b"],
        "Mario Marcel": [r"\bMario Marcel\b", r"\bministro Marcel\b", r"\btitular de Hacienda\b"],
        "Carolina Tohá": [r"\bCarolina Tohá\b", r"\bministra Tohá\b", r"\btitular de Interior\b"],
        "Camila Vallejo": [r"\bCamila Vallejo\b", r"\bministra Vallejo\b", r"\bvocera de Gobierno\b"],
        "Ángel Valencia": [r"\bÁngel Valencia\b", r"\bFiscal Nacional Valencia\b"],
        "Evelyn Matthei": [r"\bEvelyn Matthei\b", r"\balcaldesa Matthei\b"],
        "José Antonio Kast": [r"\bJosé Antonio Kast\b", r"\bKast\b"],
        "Dorothy Pérez": [r"\bDorothy Pérez\b", r"\bcontralora\b"]
    }

    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, List[str]]:
        """Extrae personas públicas, instituciones y geolocalizaciones del texto."""
        if not text:
            return {"people": [], "institutions": [], "locations": []}

        found_people: Set[str] = set()
        found_institutions: Set[str] = set()
        found_locations: Set[str] = set()

        # 1. Personas públicas
        for person_name, patterns in cls.CHILEAN_PUBLIC_FIGURES.items():
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    found_people.add(person_name)
                    break

        # 2. Instituciones
        for inst_name, patterns in cls.CHILEAN_INSTITUTIONS.items():
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    found_institutions.add(inst_name)
                    break

        # 3. Ubicaciones
        for region in cls.CHILEAN_REGIONS:
            if re.search(r'\b' + re.escape(region) + r'\b', text, re.IGNORECASE):
                found_locations.add(f"Región de {region}")

        for comuna in cls.CHILEAN_KEY_CITIES_COMUNAS:
            if re.search(r'\b' + re.escape(comuna) + r'\b', text, re.IGNORECASE):
                found_locations.add(comuna)

        return {
            "people": sorted(list(found_people)),
            "institutions": sorted(list(found_institutions)),
            "locations": sorted(list(found_locations))
        }
