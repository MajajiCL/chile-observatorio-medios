# -*- coding: utf-8 -*-
"""
Enriquecedor de Datos: Proyectos de Ley en el Congreso + Hoja de Ruta Chile 2026-2050 + Cadena Nacional Ciudadana
"""

LEGISLATIVE_BILLS = [
    {
        "id": "reforma_pensiones",
        "title": "Reforma Integral al Sistema de Pensiones y Aumento de PGU",
        "bulletin_number": "Boletín N° 15.480-13",
        "status": "Segundo Trámite Constitucional (Senado)",
        "urgency": "Suma Urgencia",
        "summary": "Modifica el sistema previsional aumentando la PGU a $250.000, crea un Administrador Previsional Autónomo y distribuye el 6% de cotización adicional del empleador entre capitalización individual y seguro social solidario.",
        "ai_president_breakdown": {
            "lo_positivo": "Aumento inmediato de ingresos para jubilados actuales más vulnerables vía PGU y mayor competencia para reducir comisiones de las AFP.",
            "los_riesgos": "Riesgo de sostenibilidad fiscal a 20 años si la PGU no cuenta con ingresos permanentes del pacto fiscal, y debate sobre la rentabilidad del componente solidario.",
            "como_te_afecta_a_ti": "Si estás jubilado: Posible alza de tu pensión en $40.000-$60.000 mensuales. Si estás trabajando: Tu empleador aportará gradualmente un 6% extra a tu fondo y seguro solidario."
        },
        "political_debate": {
            "oficialismo": "Prioriza el componente solidario (3% o más) para corregir la brecha de género y mejorar pensiones de inmediato.",
            "oposicion": "Exige que el 6% completo vaya a la cuenta individual heredable del trabajador sin reparto estatal.",
            "evidencia_tecnica": "OCDE y Banco Central recomiendan aumentar la tasa de ahorro total y postergar gradualmente la edad de jubilación acorde a la expectativa de vida."
        },
        "impact_2050_score": 92
    },
    {
        "id": "ley_inteligencia_seguridad",
        "title": "Nueva Ley del Sistema de Inteligencia del Estado y Crimen Organizado",
        "bulletin_number": "Boletín N° 12.234-02",
        "status": "Comisión Mixta",
        "urgency": "Discusión Inmediata",
        "summary": "Reemplaza la antigua ANI por la Agencia Nacional de Inteligencia con facultades operativas, intervención de comunicaciones con autorización judicial rápida y trazabilidad de patrimonio ilícito coordinado con la UAF.",
        "ai_president_breakdown": {
            "lo_positivo": "Permite anticipar atentados y penetración de bandas criminales transnacionales (Tren de Aragua, cárteles) antes de que controlen barrios.",
            "los_riesgos": "Exige controles judiciales estrictos para evitar abusos o espionaje político a ciudadanos y opositores.",
            "como_te_afecta_a_ti": "Mayor presencia de inteligencia encubierta para desbaratar bandas de narcotráfico, extorsión y secuestros que afectan la seguridad de tu barrio."
        },
        "political_debate": {
            "oficialismo": "Enfasis en control civil y respeto irrestricto a los derechos fundamentales.",
            "oposicion": "Exige mayores atribuciones de inteligencia militar y agilidad en interceptaciones telefónicas.",
            "evidencia_tecnica": "Experiencia del FBI y Mossad demuestra que sin inteligencia financiera (seguir el dinero) no es posible desmantelar redes criminales."
        },
        "impact_2050_score": 95
    },
    {
        "id": "ley_permisologia_inversiones",
        "title": "Ley Marco de Autorizaciones Sectoriales (Anti-Permisología)",
        "bulletin_number": "Boletín N° 16.566-03",
        "status": "Primer Trámite Constitucional (Cámara)",
        "urgency": "Suma Urgencia",
        "summary": "Crea una ventanilla única digital del Estado con plazos fatales y silencio administrativo positivo para proyectos que cumplan estándares ambientales y sanitarios, reduciendo tiempos de tramitación de 500 a 180 días.",
        "ai_president_breakdown": {
            "lo_positivo": "Destraba inversiones por más de US$ 15.000 millones en minería verde, plantas solares, desalinizadoras y vivienda social.",
            "los_riesgos": "Evitar que la celeridad debilite la protección a ecosistemas frágiles, glaciares y sitios arqueológicos.",
            "como_te_afecta_a_ti": "Más empleo local calificado, reactivación del comercio comunal y llegada más rápida de obras públicas (hospitales, escuelas, agua potable)."
        },
        "political_debate": {
            "oficialismo": "Protección estricta de normas ambientales manteniendo el principio precautorio.",
            "oposicion": "Exige mayor rapidez, simplificación de trámites del Consejo de Monumentos Nacionales y certezas jurídicas para inversionistas.",
            "evidencia_tecnica": "La Comisión Nacional de Productividad calcula que reducir los permisos en un 30% puede elevar el crecimiento potencial de Chile en 0.5% anual."
        },
        "impact_2050_score": 88
    },
    {
        "id": "ley_desalinizacion_agua",
        "title": "Estrategia Nacional de Desalinización y Uso de Agua de Mar",
        "bulletin_number": "Boletín N° 14.175-09",
        "status": "Comisión de Recursos Hídricos",
        "urgency": "Simple Urgencia",
        "summary": "Establece el marco regulatorio para plantas desalinizadoras multipropósito (públicas y concesionadas) con prioridad de consumo humano y pequeña agricultura campesina en zonas de emergencia climática.",
        "ai_president_breakdown": {
            "lo_positivo": "Fin definitivo al suministro por camiones aljibe en comunas del norte chico y zona central; reactivación de valles agrícolas.",
            "los_riesgos": "Gestión adecuada de la salmuera para no dañar la biodiversidad marina costera.",
            "como_te_afecta_a_ti": "Garantía de agua potable de calidad en tu hogar sin riesgo de racionamiento durante los próximos 30 años."
        },
        "political_debate": {
            "oficialismo": "Prioriza gobernanza pública de plantas desalinizadoras y protección de cuencas.",
            "oposicion": "Impulsa concesiones privadas de gran escala con venta de agua en bloque a mineras y sanitarias.",
            "evidencia_tecnica": "Modelo israelí demuestra que la combinación de desalinización por ósmosis inversa con energía solar abarata el metro cúbico a menos de US$ 0.60."
        },
        "impact_2050_score": 90
    },
    {
        "id": "ley_ficha_limpia_municipal",
        "title": "Ley de Probidad y Ficha Limpia en Municipios y Gobiernos Regionales",
        "bulletin_number": "Boletín N° 16.220-07",
        "status": "Segundo Trámite (Cámara de Diputadas y Diputados)",
        "urgency": "Suma Urgencia",
        "summary": "Prohíbe la postulación a cargos de elección popular a personas condenadas por fraude al fisco, obliga a auditar todas las corporaciones municipales por Contraloría y elimina los tratos directos reiterados.",
        "ai_president_breakdown": {
            "lo_positivo": "Cierra las puertas al desvío de fondos públicos de los vecinos hacia campañas políticas o enriquecimiento ilícito de alcaldes y operadores.",
            "los_riesgos": "Requiere dotar a la Contraloría de mayores recursos tecnológicos y peritos contables para fiscalizar 345 municipios a la vez.",
            "como_te_afecta_a_ti": "Los recursos de tu comuna realmente se invertirán en reparar tus calles, mejorar el consultorio y poner luminarias en tu pasaje."
        },
        "political_debate": {
            "oficialismo": "Transparencia total y fin al secreto bancario en investigaciones de corrupción pública.",
            "oposicion": "A favor de la probidad pero exigiendo mantener la presunción de inocencia hasta sentencia firme.",
            "evidencia_tecnica": "Estudios de Transparencia Internacional confirman que los países nórdicos eliminaron la corrupción municipal con registros de gasto 100% públicos en tiempo real."
        },
        "impact_2050_score": 89
    }
]

CHILE_2050_ROADMAP = [
    {
        "phase": "Fase 1 (2026 - 2030): Urgencias & Estabilización",
        "tagline": "Frenar la hemorragia: Seguridad, Salud Hídrica y Reducción de Listas de Espera",
        "color": "from-cyan-500 to-blue-600",
        "milestones": [
            {"year": "2026", "title": "Inhibición Celular Total en Cárceles y Control Fronterizo Digital", "status": "En Ejecución"},
            {"year": "2027", "title": "Pabellones Quirúrgicos 24/7: Reducción de listas de espera de 330 a 90 días", "status": "Planificado"},
            {"year": "2028", "title": "Primera Red Pública de Desalinizadoras en Coquimbo y Valparaíso", "status": "Diseño"},
            {"year": "2030", "title": "Crecimiento Potencial de Chile recuperado al 3.5% anual vía Litio y Cobre Verde", "status": "Meta"}
        ]
    },
    {
        "phase": "Fase 2 (2030 - 2040): Transformación Estructural",
        "tagline": "El salto al desarrollo: Educación Dual, Industrialización Verde y Equidad Territorial",
        "color": "from-blue-600 to-indigo-600",
        "milestones": [
            {"year": "2032", "title": "60% de matrícula técnica en Modelo Dual (Empresa + Aula)", "status": "Proyección"},
            {"year": "2035", "title": "Fondo Común Municipal Equitativo: 0% brecha de luminarias y pavimentos", "status": "Proyección"},
            {"year": "2038", "title": "Chile 100% autosuficiente en agua potable y matriz energética limpia", "status": "Proyección"},
            {"year": "2040", "title": "PIB per cápita de US$ 38.000 (Nivel España / Italia)", "status": "Meta"}
        ]
    },
    {
        "phase": "Fase 3 (2040 - 2050): Consolidación Desarrollada",
        "tagline": "Chile Potencia Global: Inteligencia Artificial, Astronomía y Calidad de Vida Plena",
        "color": "from-indigo-600 to-purple-600",
        "milestones": [
            {"year": "2043", "title": "Polo global de computación cuántica y centro de datos limpios del hemisferio sur", "status": "Horizonte"},
            {"year": "2046", "title": "Sistema de salud preventivo genómico con 0 listas de espera crónicas", "status": "Horizonte"},
            {"year": "2050", "title": "Chile en el Top 15 del Índice de Desarrollo Humano (IDH) Mundial", "status": "Visión 2050"}
        ]
    }
]

CADENA_NACIONAL_TODAY = {
    "title": "Cadena Nacional Ciudadana: El Estado de Chile hoy 1 de Septiembre de 2026",
    "reading_time": "3 minutos de lectura",
    "executive_headline": "La economía muestra estabilidad con inflación controlada (-0.2% mensual), mientras el debate en el Congreso se concentra en la Reforma Previsional y la urgencia de destrabar inversiones hídricas en el norte chico.",
    "key_takeaways_for_citizens": [
        {
            "icon": "wallet",
            "topic": "Para tu Bolsillo",
            "text": "La UF se mantiene en $40.875 y el Dólar en $933. La caída de la inflación alivia el costo de los alimentos básicos este mes."
        },
        {
            "icon": "shield",
            "topic": "Para tu Seguridad",
            "text": "Prioridad máxima en el Senado para la Ley de Inteligencia y control fronterizo. La Presidenta IA recomienda vigilar la inversión efectiva en patrullaje comunal."
        },
        {
            "icon": "heart-pulse",
            "topic": "Para tu Salud",
            "text": "El Ministerio de Salud evalúa extender el horario de pabellones los sábados para acelerar cirugías retrasadas en hospitales regionales."
        }
    ],
    "president_quote": "«Un país no se construye peleando por quién grita más fuerte en el matinal, sino midiendo rigurosamente cada peso público y aprendiendo con humildad de los que ya resolvieron estos problemas en el mundo.»"
}

import json, os

base_dir = r"C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios"

with open(os.path.join(base_dir, "data", "snapshot.json"), "r", encoding="utf-8") as f:
    snapshot = json.load(f)

snapshot["legislative_bills"] = LEGISLATIVE_BILLS
snapshot["chile_2050_roadmap"] = CHILE_2050_ROADMAP
snapshot["cadena_nacional"] = CADENA_NACIONAL_TODAY

with open(os.path.join(base_dir, "data", "snapshot.json"), "w", encoding="utf-8") as f:
    json.dump(snapshot, f, indent=2, ensure_ascii=False)

# Reconstruir data.js
js_content = "window.OBSERVATORIO_SNAPSHOT = " + json.dumps(snapshot, ensure_ascii=False, indent=2) + ";\n"
with open(os.path.join(base_dir, "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)
with open(os.path.join(base_dir, "static", "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)

print("Datos legislativos, Cadena Nacional y Hoja de Ruta 2050 generados con éxito.")
