# -*- coding: utf-8 -*-
import json, os

COUNTRY_FODA_STRATEGY = {
    'title': 'Estrategia Nacional & Matriz FODA de la República de Chile',
    'executive_summary': 'Chile posee ventajas comparativas geopolíticas y geológicas únicas en el siglo XXI (litio, cobre, radiación solar, borde costero y cielos astronómicos), pero enfrenta riesgos críticos de cohesión social, crimen organizado transnacional, crisis hídrica y estancamiento de la productividad. La estrategia de Estado exige pasar del modelo puramente extractivo a la economía del conocimiento y la industrialización verde con equidad territorial.',
    'foda': {
        'fortalezas': [
            {'title': 'Institucionalidad Macroeconómica', 'desc': 'Banco Central autónomo, regla de balance estructural fiscal y clasificación de riesgo crediticio líder en América Latina (A/A2).'},
            {'title': 'Liderazgo en Recursos Estratégicos', 'desc': 'Mayor reserva mundial de litio en salmuera (Salar de Atacama) y 28% de la producción global de cobre.'},
            {'title': 'Potencial Energético Inigualable', 'desc': 'Mayor radiación solar del planeta en el Desierto de Atacama y vientos de clase mundial en Magallanes para Hidrógeno Verde.'},
            {'title': 'Capital Científico y Astronómico', 'desc': 'Más del 70% de la capacidad de observación astronómica terrestre mundial y red de tratados de libre comercio con el 88% del PIB global.'}
        ],
        'oportunidades': [
            {'title': 'Demanda Global de Descarbonización', 'desc': 'El mundo triplicará el consumo de cobre y litio para electromovilidad y almacenamiento de energía hacia 2040.'},
            {'title': 'Polo de Hidrógeno Verde & Combustibles Sintéticos', 'desc': 'Posibilidad de convertir a Magallanes y Antofagasta en exportadores netos de energía limpia hacia Asia y Europa.'},
            {'title': 'Corredor Bioceánico Capricornio', 'desc': 'Integración logística con Brasil, Argentina y Paraguay a través de los puertos del norte chileno hacia el Asia-Pacífico.'},
            {'title': 'Hub Digital del Cono Sur', 'desc': 'Cable submarino transpacífico Humboldt y centros de datos de hiperescala alimentados 100% con energías renovables.'}
        ],
        'debilidades': [
            {'title': 'Productividad Estancada', 'desc': '12 años sin crecimiento significativo de la Productividad Total de Factores (PTF) y baja inversión en I+D (0.34% del PIB).'},
            {'title': 'Hipercentralismo Territorial', 'desc': 'Más del 40% de la población y el 45% del PIB concentrados en la Región Metropolitana, asfixiando el desarrollo de regiones.'},
            {'title': 'Colapso del Sistema Penitenciario', 'desc': '135% de hacinamiento carcelario y falta de inhibición celular activa que permite la operación de bandas desde el encierro.'},
            {'title': 'Listas de Espera en Salud Pública', 'desc': '2.6 millones de atenciones en espera y 330 días promedio de demora para cirugías electivas de alta complejidad.'}
        ],
        'amenazas': [
            {'title': 'Infiltración de Crimen Organizado Transnacional', 'desc': 'Bandas internacionales (Tren de Aragua, cárteles) que amenazan el Estado de derecho, puertos y pasos fronterizos no habilitados.'},
            {'title': 'Megasequía & Cambio Climático', 'desc': '14 años consecutivos de déficit hídrico en la zona central y norte chico, con 400.000 personas dependientes de camiones aljibe.'},
            {'title': 'Envejecimiento Poblacional Acelerado', 'desc': 'Caída de la tasa de fecundidad a 1.1 hijos por mujer, lo que generará una crisis de sostenibilidad previsional y fuerza laboral a 2040.'},
            {'title': 'Permisología Excesiva e Inseguridad Jurídica', 'desc': 'Plazos de hasta 500 días para permisos ambientales que frenan más de US$ 15.000 millones en inversiones clave.'}
        ]
    },
    'strategic_pillars_2050': [
        {'pillar': 'Soberanía Energética y Minería Verde', 'target_2030': '100% de operaciones de cobre con agua desalada y energía solar/eólica.', 'target_2050': 'Polo exportador de Hidrógeno Verde y cátodos de litio elaborados.'},
        {'pillar': 'Revolución de Seguridad & Control Fronterizo', 'target_2030': 'Inhibición total en 100% de cárceles y frontera norte blindada con radares y drones térmicos.', 'target_2050': 'Tasa de homicidios < 2.0 por 100k hab. (estándar europeo).'},
        {'pillar': 'Infraestructura Hídrica Nacional', 'target_2030': 'Red pública de desalinizadoras multipropósito en Coquimbo, Valparaíso y Atacama.', 'target_2050': '100% de seguridad hídrica urbana y agrícola en todo Chile.'},
        {'pillar': 'Educación Dual & Capital Humano IA', 'target_2030': '60% de institutos técnicos integrados con empresas en modelo dual alemán.', 'target_2050': 'Chile en el Top 15 del Índice de Desarrollo Humano (IDH) mundial.'}
    ]
}
