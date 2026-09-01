# -*- coding: utf-8 -*-
"""
Motor de Auditoría Nacional y Benchmarks Históricos Comparados
Analiza la realidad transversal de Chile en 7 pilares estratégicos,
cruzando la situación actual con lecciones históricas de desarrollo internacional.
"""

NATIONAL_AUDIT_PILLARS = [
    {
        "id": "seguridad_penitenciario",
        "title": "Seguridad Pública & Sistema Penitenciario",
        "icon": "shield-alert",
        "status_level": "critico",
        "diagnostic": "Hacinamiento carcelario promedio nacional de 135% en recintos cerrados, penetración de crimen organizado transnacional y baja tasa de reinserción efectiva (<30%), lo que alimenta la reincidencia delictual.",
        "chile_current_data": {
            "poblacion_penal": "56.000+ personas privadas de libertad",
            "hacinamiento_critico": "135% promedio (supera 200% en cárceles del norte)",
            "gasto_seguridad": "1.8% del PIB",
            "tasa_homicidios": "6.7 por cada 100.000 hab. (alza sostenida desde 2018)"
        },
        "global_benchmarks": [
            {
                "country": "Noruega / Países Bajos",
                "policy_model": "Modelo de Normalización Penitenciaria y Arquitectura Modular Progresiva",
                "historical_lesson": "En los años 90, Noruega transformó sus cárceles de centros de castigo hacinados a unidades de reentrenamiento laboral y salud mental. Redujo la reincidencia del 70% al 20%, cerrando recintos por falta de reos.",
                "applicability_chile": "Separación estricta de primerizos de líderes de crimen organizado, cárceles de máxima seguridad tecnológica para líderes delictuales y programas intensivos de capacitación técnico-industrial para delitos no violentos."
            },
            {
                "country": "Singapur",
                "policy_model": "Cero Tolerancia a Corrupción Policial y Control Digital de Fronteras",
                "historical_lesson": "Profesionalización salarial de policías, trazabilidad biométrica de fronteras y tolerancia cero al microtráfico organizado.",
                "applicability_chile": "Modernización de pasos fronterizos en el Norte Grande (Colchane, Chacalluta) mediante radares térmicos, drones autónomos y auditorías patrimoniales continuas a funcionarios de control aduanero y carcelario."
            }
        ],
        "future_risks_2030": "Saturación total del sistema penitenciario con pérdida de control interno en recintos hacia 2028 si no se construyen 15.000 plazas de alta seguridad y se frena el reclutamiento carcelario.",
        "strategic_recommendation": "1) Ley de infraestructura penitenciaria de emergencia con licitación modular. 2) Bloqueo total de señal celular con inhibición activa. 3) Bloque de inteligencia financiera (UAF) para asfixiar el patrimonio del crimen organizado."
    },
    {
        "id": "salud_publica",
        "title": "Salud Pública, Listas de Espera & Hospitales",
        "icon": "activity",
        "status_level": "grave",
        "diagnostic": "Más de 2.6 millones de atenciones en lista de espera (GES y no GES), colapso de servicios de urgencia, fuga de especialistas al sector privado y crisis de financiamiento del sistema mixto FONASA/ISAPRE.",
        "chile_current_data": {
            "listas_espera_no_ges": "2.3 millones de consultas de especialidad y 330.000 cirugías",
            "tiempo_espera_promedio": "330 días para intervenciones quirúrgicas",
            "gasto_salud_pib": "9.1% del PIB (4.8% público, 4.3% gasto de bolsillo)",
            "deficit_camas_criticas": "1.9 camas por 1.000 hab. (promedio OCDE es 4.3)"
        },
        "global_benchmarks": [
            {
                "country": "Reino Unido (NHS) / España",
                "policy_model": "Atención Primaria Resolutiva y Hospital Digital con Telemedicina Especializada",
                "historical_lesson": "España descentralizó el 80% de los diagnósticos hacia la Atención Primaria (Centros de Salud Familiar), dotándolos de ecógrafos, laboratorios rápidos y especialistas rotativos, descongestionando los hospitales base.",
                "applicability_chile": "Transformar los CESFAM en centros de alta resolución diagnóstica con telemedicina sincrónica enlazada a hospitales universitarios para resolver el 75% de las interconsultas sin derivación física."
            },
            {
                "country": "Estonia",
                "policy_model": "Ficha Clínica Única Electrónica y Receta Nacional Centralizada",
                "historical_lesson": "Estonia integró en un único registro nacional seguro todos los historiales médicos públicos y privados, eliminando duplicidades y tiempos muertos en un 40%.",
                "applicability_chile": "Ficha médica universal obligatoria interoperable entre prestadores públicos y privados, terminando con la pérdida de exámenes y optimizando los pabellones quirúrgicos en turnos 24/7."
            }
        ],
        "future_risks_2030": "Acelerado envejecimiento poblacional en Chile (más del 20% tendrá más de 65 años hacia 2035), quintuplicando la demanda por enfermedades crónicas complejas y cuidados paliativos.",
        "strategic_recommendation": "1) Uso intensivo de pabellones en horario vespertino y fines de semana. 2) Formación acelerada de médicos especialistas con retención obligatoria en el servicio público. 3) Fondo único de medicamentos esenciales con compra centralizada (CENABAST ampliado)."
    },
    {
        "id": "educacion_capital_humano",
        "title": "Educación Pública & Formación del Futuro",
        "icon": "graduation-cap",
        "status_level": "grave",
        "diagnostic": "Brecha de aprendizaje pospandemia, deserción escolar de 50.000+ jóvenes al año, crisis de gobernanza en la transición a los Servicios Locales de Educación Pública (SLEP) y desconexión entre la matriz técnica y las industrias del futuro (Litio, Hidrógeno Verde, IA).",
        "chile_current_data": {
            "desercion_escolar": "50.000+ estudiantes fuera del sistema escolar",
            "brecha_lectora_simce": "Más del 55% de estudiantes de 4° básico no comprende lo que lee",
            "gasto_educacion_pib": "6.6% del PIB",
            "cobertura_educacion_tecnica": "43% de la matrícula de educación superior"
        },
        "global_benchmarks": [
            {
                "country": "Finlandia / Irlanda",
                "policy_model": "Revalorización Docente y Foco Absoluto en Lectoescritura Temprana y Ciencias",
                "historical_lesson": "Irlanda transformó su economía agraria en una potencia tecnológica global en 25 años invirtiendo en formación técnica bilingüe y vinculación directa universidad-industria.",
                "applicability_chile": "Plan nacional de alfabetización matemática y digital desde 1° básico, autonomía pedagógica en colegios y becas de especialización docente con remuneraciones de primer nivel para zonas vulnerables."
            },
            {
                "country": "Alemania (Modelo Dual)",
                "policy_model": "Educación Técnico-Profesional Dual con Empresas Estratégicas",
                "historical_lesson": "El 60% de los jóvenes alemanes combina 3 días de trabajo remunerado en plantas industriales con 2 días de teoría escolar, logrando casi 0% de desempleo juvenil.",
                "applicability_chile": "Alianzas vinculantes entre liceos técnico-profesionales y los polos mineros, astronómicos, energéticos y portuarios del país (Antofagasta, Biobío, Magallanes)."
            }
        ],
        "future_risks_2030": "Obsolescencia del 40% del empleo tradicional chileno debido a la automatización si la educación no gira hacia pensamiento crítico, programación, robótica y gestión energética.",
        "strategic_recommendation": "1) Tutorías personalizadas intensivas de lectoescritura con IA. 2) Rediseño de los SLEP con auditoría de gestión presupuestaria. 3) Gratuidad universitaria condicionada a carreras prioritarias para el desarrollo estratégico nacional."
    },
    {
        "id": "municipios_territorio",
        "title": "Desarrollo Municipal, Calles & Equidad Territorial",
        "icon": "map-pin",
        "status_level": "critico",
        "diagnostic": "Extrema asimetría de recursos entre municipios (Las Condes/Vitacura vs. La Pintana/Cerro Navia/Alto Hospicio), deterioro grave del pavimento y luminarias en periferias, y falta de fiscalización sobre corporaciones municipales.",
        "chile_current_data": {
            "desigualdad_ingresos_municipales": "Brecha de hasta 8x en presupuesto per cápita entre comunas del país",
            "dependencia_fcm": "Más de 200 comunas dependen en más del 65% del Fondo Común Municipal",
            "deficit_vial_urbano": "35% de las calles y veredas en zonas vulnerables presentan deterioro severo",
            "deficit_habitacional": "650.000+ viviendas requeridas a nivel nacional"
        },
        "global_benchmarks": [
            {
                "country": "Francia / España",
                "policy_model": "Fondos de Solidaridad Territorial con Estándar Mínimo Urbano Garantizado",
                "historical_lesson": "Francia instauró un mecanismo donde ningún municipio puede tener un gasto per cápita en seguridad, aseo y áreas verdes inferior al 75% de la media nacional, financiado con redistribución automática.",
                "applicability_chile": "Reforma al Fondo Común Municipal (FCM) para garantizar un presupuesto mínimo estándar por habitante en seguridad municipal, pavimentación y luminarias LED inteligentes en todo Chile."
            },
            {
                "country": "Japón",
                "policy_model": "Planificación Urbana Antirriesgo y Mantenimiento Predictivo Comunal",
                "historical_lesson": "Japón audita cada 3 años el 100% de la infraestructura vial y alcantarillados comunales mediante sensores móviles e imágenes satelitales.",
                "applicability_chile": "Catastro satelital continuo de baches, luminarias y áreas verdes con alertas automatizadas de reparación para gobiernos regionales y municipalidades."
            }
        ],
        "future_risks_2030": "Guetización urbana y fractura social extrema, facilitando el control territorial de barrios completos por bandas delictuales en comunas desprovistas de inversión pública.",
        "strategic_recommendation": "1) Auditoría externa vinculante de la Contraloría a todas las corporaciones municipales. 2) Banco de proyectos de pavimentación rápida de veredas y calles secundarias. 3) Plan de regeneración urbana de blocks y viviendas sociales."
    },
    {
        "id": "economia_productividad",
        "title": "Economía, Cobre, Litio & Crecimiento Potencial",
        "icon": "trending-up",
        "status_level": "moderado",
        "diagnostic": "Estancamiento de la productividad total de factores durante más de 12 años, permisología excesiva que frena inversiones estratégicas (hasta 500 días para proyectos mineros/energéticos) y lenta agregación de valor al cobre y litio.",
        "chile_current_data": {
            "crecimiento_potencial": "2.0% - 2.3% anual (insuficiente para alcanzar el desarrollo pleno)",
            "deuda_publica": "39.5% del PIB (dentro de márgenes prudentes pero con espacio fiscal acotado)",
            "inversion_i_mas_d": "0.34% del PIB (promedio OCDE es 2.7%)",
            "exportaciones_concentradas": "El 55% de los envíos corresponde a minerales sin refinar"
        },
        "global_benchmarks": [
            {
                "country": "Australia / Canadá",
                "policy_model": "Ventanilla Única Minera con Estándares Ambientales Transparentes y Clúster de Proveedores de Alta Tecnología (METS)",
                "historical_lesson": "Australia no solo exporta hierro y litio, sino que desarrolló una industria de software minero y maquinaria de 90.000 millones de dólares que exporta al mundo entero.",
                "applicability_chile": "Creación de la Agencia de Inversiones Estratégicas con plazos máximos perentorios para evaluación ambiental y fomento a un clúster local de tecnología minera e hidrógeno."
            },
            {
                "country": "Corea del Sur",
                "policy_model": "Inversión Estatal Estratégica en I+D y Baterías de Litio de Próxima Generación",
                "historical_lesson": "Corea invierte el 4.8% del PIB en I+D coordinando a universidades con conglomerados privados para liderar la manufactura avanzada.",
                "applicability_chile": "Exigencia contractual a productores de litio (Salar de Atacama/Maricunga) de destinar el 5% de las ventas a centros chilenos de investigación en celdas de cátodos y desalinización solar."
            }
        ],
        "future_risks_2030": "Riesgo de sustitución tecnológica de materias primas si Chile no consolida su liderazgo en litio y cobre verde con baja huella de carbono antes del fin de la década.",
        "strategic_recommendation": "1) Ley de simplificación de permisos sectoriales (fin a la permisología redundante). 2) Meta de duplicar la inversión en I+D a 1.0% del PIB hacia 2030. 3) Plan de atracción de centros de datos globales con energía 100% renovable."
    },
    {
        "id": "agua_cambio_climatico",
        "title": "Crisis Hídrica, Agua & Transición Ecológica",
        "icon": "droplets",
        "status_level": "critico",
        "diagnostic": "Megasequía de más de 14 años que afecta desde la Región de Coquimbo hasta el Maule, sobreotorgamiento histórico de derechos de agua, pérdidas en redes de distribución y falta de infraestructura de desalinización multipropósito.",
        "chile_current_data": {
            "deficit_pluviometrico": "30% a 60% en la zona central y norte chico",
            "comunas_decreto_escasez": "Más de 100 comunas bajo decretos de escasez hídrica",
            "camiones_aljibe": "Más de 400.000 personas abastecidas por camiones aljibe en zonas rurales",
            "perdida_redes_urbanas": "30% del agua potable se pierde en fugas de tuberías"
        },
        "global_benchmarks": [
            {
                "country": "Israel",
                "policy_model": "Reutilización del 90% de Aguas Grises y Desalinización como Política de Estado",
                "historical_lesson": "Siendo un país desértico, Israel pasó de la escasez extrema a ser exportador de agua mediante 5 mega-plantas desalinizadoras, micro-riego computarizado y reciclaje del 90% de efluentes urbanos para agricultura.",
                "applicability_chile": "Red de desalinizadoras multipropósito estatales/público-privadas para consumo humano y pequeña agricultura en Coquimbo, Valparaíso y Atacama, con tratamiento terciario de aguas servidas en ciudades costeras."
            },
            {
                "country": "Países Bajos",
                "policy_model": "Gobernanza Integrada de Cuencas y Retención Natural",
                "historical_lesson": "Las juntas de cuenca holandesas gestionan en tiempo real cada gota con modelos matemáticos predictivos y financiamiento compartido.",
                "applicability_chile": "Creación de los Consejos de Cuenca vinculantes en Chile para monitoreo telemétrico de extracciones y recarga artificial de acuíferos subterráneos."
            }
        ],
        "future_risks_2030": "Racionamiento programado de agua potable en ciudades del centro-norte si no se inyecta agua desalinizada a las redes urbanas antes de 2028.",
        "strategic_recommendation": "1) Estrategia Nacional de Desalinización Multipropósito. 2) Reutilización obligatoria de aguas tratadas para riego industrial y minero. 3) Subsidio masivo a la tecnificación del riego agrícola campesino."
    },
    {
        "id": "probidad_estado",
        "title": "Estado de Derecho, Probidad & Modernización del Estado",
        "icon": "scale",
        "status_level": "moderado",
        "diagnostic": "Pérdida de confianza ciudadana por escándalos de transferencias a fundaciones, corrupción en corporaciones municipales y lentitud de los procesos judiciales civiles y administrativos.",
        "chile_current_data": {
            "confianza_instituciones": "Menos del 25% de confianza ciudadana en partidos y Congreso",
            "compras_publicas": "Mercado Público mueve más de US$ 15.000 millones al año",
            "digitalizacion_tramites": "85% de trámites del Estado digitalizados, pero con baja interoperabilidad",
            "casos_fraude_municipal": "Decenas de municipalidades investigadas por malversación o sobreprecios"
        },
        "global_benchmarks": [
            {
                "country": "Estonia / Dinamarca",
                "policy_model": "Gobernanza Digital Transparente 100% en Tiempo Real (X-Road)",
                "historical_lesson": "Cada peso del presupuesto nacional es auditable en un portal público en tiempo real mediante registros inmutables. Ningún ciudadano entrega dos veces un mismo documento al Estado.",
                "applicability_chile": "Trazabilidad completa de compras públicas y transferencias del Estado con algoritmos de detección temprana de patrones de sobreprecios y vínculos familiares en licitaciones."
            },
            {
                "country": "Nueva Zelanda",
                "policy_model": "Servicio Civil Basado Exclusivamente en Alta Dirección Meritocrática",
                "historical_lesson": "Reducción al mínimo de los cargos de confianza política; los directores de servicios son evaluados por metas cuantitativas de servicio al ciudadano con contratos revocables.",
                "applicability_chile": "Ampliación del Sistema de Alta Dirección Pública (SADP) a todos los cargos directivos municipales y de corporaciones públicas, eliminando el clientelismo político."
            }
        ],
        "future_risks_2030": "Deslegitimación democrática severa y ascenso de populismos desestabilizadores si la administración pública no entrega resultados rápidos y transparentes.",
        "strategic_recommendation": "1) Fin a los tratos directos no justificados en municipios y gobiernos regionales. 2) Portal de gasto público en tiempo real hasta el último proveedor. 3) Carrera funcionaria ligada a métricas de satisfacción usuaria."
    }
]

import json, os

base_dir = r"C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios"

# Cargar snapshot existente
with open(os.path.join(base_dir, "data", "snapshot.json"), "r", encoding="utf-8") as f:
    snapshot = json.load(f)

# Agregar auditoría nacional transversal y benchmarks
snapshot["national_audit"] = NATIONAL_AUDIT_PILLARS

# Generar Briefing Presidencial IA
snapshot["presidential_briefing"] = {
    "title": "Mensaje de Estado: Auditoría Integral y Diagnóstico Prospectivo de Chile (2026-2035)",
    "date": "1 de Septiembre, 2026",
    "core_principles": [
        "1. Desconexión de la trifulca coyuntural: El progreso no se mide en cuñas televisivas, sino en indicadores de vida verificables.",
        "2. Evidencia y ciencia como único árbitro: Las políticas públicas deben fundamentarse en datos del Banco Central, INE, OCDE y ciencia aplicada.",
        "3. Aprendizaje histórico internacional: Ningún problema chileno es inédito; las soluciones probadas en Noruega, Singapur, Países Bajos y Estonia marcan el camino."
    ],
    "strategic_summary": "Chile posee una posición macroeconómica e institucional privilegiada en América Latina, pero enfrenta cuellos de botella críticos en seguridad penitenciaria, listas de espera en salud, estancamiento de la productividad y estrés hídrico. Resolverlos exige abandonar el cortoplacismo electoral y ejecutar reformas estructurales con métricas de 10 a 20 años.",
    "urgent_priorities": [
        "Reforma Penitenciaria y Aislamiento de Crimen Organizado",
        "Uso 24/7 de Pabellones Quirúrgicos y Telemedicina en CESFAM",
        "Estrategia Nacional de Desalinización Multipropósito",
        "Ley Anti-Permisología y Foco en I+D de Cobre y Litio",
        "Redistribución Efectiva del Fondo Común Municipal para Calles y Seguridad"
    ]
}

# Guardar snapshot enriquecido
with open(os.path.join(base_dir, "data", "snapshot.json"), "w", encoding="utf-8") as f:
    json.dump(snapshot, f, indent=2, ensure_ascii=False)

# Regenerar data.js embebido
js_content = "window.OBSERVATORIO_SNAPSHOT = " + json.dumps(snapshot, ensure_ascii=False, indent=2) + ";\n"
with open(os.path.join(base_dir, "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)
with open(os.path.join(base_dir, "static", "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)

print("Snapshot con Auditoría Nacional y Benchmarks generado con éxito.")
