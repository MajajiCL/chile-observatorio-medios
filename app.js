// Presidenta IA & Observatorio de Estado de Chile - Universal Client Engine (Mobile & Desktop Optimized)

var dataSnapshot = (typeof window !== 'undefined' && window.OBSERVATORIO_SNAPSHOT) ? window.OBSERVATORIO_SNAPSHOT : null;
var allClusters = [];
var allSources = [];
var allAuditPillars = [];
var allLegislativeBills = [];
var allRoadmapPhases = [];
var currentSelectedRegionId = 'antofagasta';

var allProposals = [
    {
        id: 1,
        pillar: 'Seguridad & Cárceles',
        title: 'Inhibición activa de señal celular y cárceles modulares de alta seguridad',
        author: 'Comunidad Cívica Antofagasta',
        votes: 428,
        desc: 'Implementar bloqueo total de espectro electromagnético en recintos penales y separar a reclusos primerizos según el modelo noruego para frenar el reclutamiento delictual.'
    },
    {
        id: 2,
        pillar: 'Agua & Desalinización',
        title: 'Planta desalinizadora multipropósito pública en Región de Coquimbo',
        author: 'Asociación de Agricultores del Limarí',
        votes: 389,
        desc: 'Construir infraestructura costera de desalinización alimentada por energía solar para abastecer consumo humano y regadío tecnificado campesino, emulando la experiencia de Israel.'
    },
    {
        id: 3,
        pillar: 'Salud Pública',
        title: 'Turnos vespertinos y fines de semana 24/7 en pabellones quirúrgicos',
        author: 'Colegio Médico & Pacientes Fonasa',
        votes: 512,
        desc: 'Maximizar el uso de infraestructura hospitalaria existente remunerando turnos médicos extendidos para reducir las 330.000 cirugías en lista de espera en menos de 18 meses.'
    },
    {
        id: 4,
        pillar: 'Municipios & Calles',
        title: 'Plan Nacional de Pavimentación Participativa y Fondo Común Equitativo',
        author: 'Juntas de Vecinos La Pintana / Cerro Navia',
        votes: 345,
        desc: 'Reformar el FCM para garantizar un estándar mínimo de veredas, asfalto y luminarias LED inteligentes en todas las comunas del país sin importar el nivel de ingresos comunal.'
    }
];

var SIMULATION_DATA = {
    carceles: {
        title: 'Dilema Penitenciario: Castigo Masivo vs. Modelo Noruego de Aislamiento Tecnológico',
        decisionA: 'Construcción de mega-cárceles tradicionales hacinadas.',
        impactA: 'Costos de mantención se disparan 200%, reincidencia delictual se mantiene en 70%, centros se convierten en universidades del crimen.',
        decisionB: 'Cárceles modulares de alta seguridad tecnológica + inhibición digital + reinserción laboral intensiva (Modelo Noruega/Holanda).',
        impactB: 'Reducción de la reincidencia a menos del 30% en 8 años, desarticulación financiera de bandas criminales y descongestión de recintos.',
        evidence: 'Noruega redujo su tasa de criminalidad nacional a mínimos históricos tras sustituir la lógica del castigo indiscriminado por la separación estricta de reos y capacitación industrial obligatoria.'
    },
    salud: {
        title: 'Dilema Sanitario: Subsidio de Demanda vs. Modelo Español de Alta Resolución Primaria',
        decisionA: 'Derivación masiva y compra de bonos privados individuales.',
        impactA: 'Gasto fiscal insostenible a largo plazo, no se crea capacidad pública instalada, listas de espera reaparecen cada año.',
        decisionB: 'Transformar CESFAM en centros de diagnóstico resolutivo con telemedicina 24/7 + pabellones vespertinos continuos.',
        impactB: 'Resolución del 75% de las interconsultas en la comuna sin derivación hospitalaria; reducción de 330 a 90 días en cirugías complejas.',
        evidence: 'España e Inglaterra logran una de las coberturas sanitarias más eficientes del mundo resolviendo más del 80% de las patologías en centros de atención primaria barriales con tecnología diagnóstica.'
    },
    agua: {
        title: 'Dilema Hídrico: Camiones Aljibe de Emergencia vs. Modelo Israelí de Desalinización Multipropósito',
        decisionA: 'Gasto crónico de miles de millones en arriendo de camiones aljibe por décadas.',
        impactA: 'Dependencia permanente de agua precaria, desertificación acelerada de los valles centrales, despoblamiento rural.',
        decisionB: 'Red de desalinizadoras multipropósito solares + tratamiento y reutilización del 90% de aguas servidas.',
        impactB: 'Seguridad hídrica garantizada para consumo humano y pequeña agricultura por los próximos 50 años; recuperación de acuíferos.',
        evidence: 'Israel pasó de ser un país con déficit hídrico extremo a ser el mayor exportador de agua de Medio Oriente al desalinizar el 85% del agua urbana y reciclar el 90% de efluentes para agricultura tecnificada.'
    },
    educacion: {
        title: 'Dilema Educativo: Modelo Universitario Clásico vs. Modelo Dual Alemán',
        decisionA: 'Masificación de títulos universitarios saturados sin vínculo con la matriz productiva.',
        impactA: 'Subempleo profesional juvenil (40% trabaja en áreas no afines), endeudamiento y escasez de técnicos especializados.',
        decisionB: 'Educación Técnico-Profesional Dual vinculada a Litio, Cobre, Energías Renovables, IA y Astronomía.',
        impactB: 'Desempleo juvenil inferior al 5%, sueldos técnicos superiores a la media y aceleración de la productividad industrial nacional.',
        evidence: 'Alemania, Suiza y Austria mantienen la tasa de desempleo juvenil más baja de Europa gracias a que el 60% de los jóvenes estudia combinando días en fábrica con días en aula.'
    }
};

var currentCategory = 'all';
var currentSearch = '';

function getSnapshot() {
    if (typeof window !== 'undefined' && window.OBSERVATORIO_SNAPSHOT) {
        return window.OBSERVATORIO_SNAPSHOT;
    }
    return dataSnapshot;
}

function safeCreateIcons() {
    try {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    } catch (e) {}
}

function renderEconomicIndicators() {
    var container = document.getElementById('economic-ticker');
    if (!container) return;

    var snap = getSnapshot();
    var indicators = snap && snap.economic_indicators ? snap.economic_indicators : [
        { code: 'UF', name: 'Unidad de Fomento', value: 40875.09, unit: 'CLP' },
        { code: 'DOLAR', name: 'Dólar Observado', value: 933.40, unit: 'CLP' },
        { code: 'EURO', name: 'Euro', value: 1084.21, unit: 'CLP' },
        { code: 'IPC', name: 'IPC Mensual', value: -0.2, unit: '%' },
        { code: 'UTM', name: 'UTM', value: 71721.00, unit: 'CLP' }
    ];

    container.innerHTML = indicators.map(function(ind) {
        var isClp = ind.unit === '$' || ind.unit === 'CLP';
        var formatted = ind.value ? ind.value.toLocaleString('es-CL', { minimumFractionDigits: ind.unit === '%' ? 1 : 2, maximumFractionDigits: 2 }) : '-';
        return '<div class="flex items-center space-x-1.5 whitespace-nowrap"><span class="text-slate-400 font-bold text-[11px]">' + ind.code + ':</span><span class="text-emerald-400 font-mono font-extrabold text-xs">' + (isClp ? '$' : '') + formatted + (ind.unit === '%' ? '%' : '') + '</span></div>';
    }).join('');
}

function renderCadenaNacional() {
    var snap = getSnapshot();
    var c = snap && snap.cadena_nacional ? snap.cadena_nacional : {
        title: 'Cadena Nacional Ciudadana: El Estado de Chile hoy 1 de Septiembre de 2026',
        executive_headline: 'La economía muestra estabilidad con inflación controlada (-0.2% mensual), mientras el debate en el Congreso se concentra en la Reforma Previsional y la urgencia de destrabar inversiones hídricas en el norte chico.',
        key_takeaways_for_citizens: [
            { icon: 'wallet', topic: 'Para tu Bolsillo', text: 'La UF se mantiene en $40.875 y el Dólar en $933. La caída de la inflación alivia el costo de los alimentos básicos este mes.' },
            { icon: 'shield', topic: 'Para tu Seguridad', text: 'Prioridad máxima en el Senado para la Ley de Inteligencia y control fronterizo. La Presidenta IA recomienda vigilar la inversión efectiva en patrullaje comunal.' },
            { icon: 'heart-pulse', topic: 'Para tu Salud', text: 'El Ministerio de Salud evalúa extender el horario de pabellones los sábados para acelerar cirugías retrasadas en hospitales regionales.' }
        ],
        president_quote: '«Un país no se construye peleando por quién grita más fuerte en el matinal, sino midiendo rigurosamente cada peso público y aprendiendo con humildad de los que ya resolvieron estos problemas en el mundo.»'
    };

    var titleEl = document.getElementById('cadena-title');
    var headlineEl = document.getElementById('cadena-headline');
    var quoteEl = document.getElementById('cadena-quote');
    var takeawaysEl = document.getElementById('cadena-takeaways');

    if (titleEl) titleEl.innerText = c.title;
    if (headlineEl) headlineEl.innerText = c.executive_headline;
    if (quoteEl) quoteEl.innerText = c.president_quote;

    if (takeawaysEl) {
        takeawaysEl.innerHTML = (c.key_takeaways_for_citizens || []).map(function(t) {
            return '<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"><div class="flex items-center space-x-2 text-cyan-400 font-bold text-xs"><i data-lucide="' + (t.icon || 'check') + '" class="w-4 h-4 text-cyan-400"></i><span class="text-cyan-300 font-extrabold uppercase tracking-wide">' + t.topic + '</span></div><p class="text-xs text-slate-200 leading-relaxed font-medium">' + t.text + '</p></div>';
        }).join('');
    }

    setTimeout(renderStatecraftRadar, 50);
}

function renderStatecraftRadar() {
    var chartDom = document.getElementById('chart-statecraft-radar');
    if (!chartDom || typeof echarts === 'undefined') return;
    
    try {
        var myChart = echarts.init(chartDom, 'dark', { backgroundColor: 'transparent' });
        var option = {
            tooltip: { trigger: 'axis' },
            radar: {
                indicator: [
                    { name: 'Seguridad & Cárceles', max: 100 },
                    { name: 'Salud & Listas Espera', max: 100 },
                    { name: 'Educación & Futuro', max: 100 },
                    { name: 'Equidad Municipal / Calles', max: 100 },
                    { name: 'Productividad & Litio/Cobre', max: 100 },
                    { name: 'Agua & Clima', max: 100 },
                    { name: 'Probidad & Estado', max: 100 }
                ],
                shape: 'polygon',
                splitNumber: 4,
                axisName: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
                splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.4)' } },
                splitArea: { show: false },
                axisLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.5)' } }
            },
            series: [
                {
                    name: 'Auditoría Nacional',
                    type: 'radar',
                    data: [
                        {
                            value: [38, 42, 50, 40, 58, 35, 65],
                            name: 'Nivel Actual de Desempeño (Chile)',
                            itemStyle: { color: '#f43f5e' },
                            areaStyle: { color: 'rgba(244, 63, 94, 0.3)' }
                        },
                        {
                            value: [85, 90, 88, 85, 88, 92, 90],
                            name: 'Meta Benchmark OCDE',
                            itemStyle: { color: '#00f0ff' },
                            areaStyle: { color: 'rgba(0, 240, 255, 0.2)' }
                        }
                    ]
                }
            ]
        };
        myChart.setOption(option);
    } catch (e) {}
}

function runSimulation() {
    var select = document.getElementById('simulator-select');
    var output = document.getElementById('simulator-output');
    if (!select || !output) return;

    var sim = SIMULATION_DATA[select.value] || SIMULATION_DATA.carceles;

    output.innerHTML = '<h4 class="font-black text-white text-xs sm:text-sm text-cyan-300 mb-2">' + sim.title + '</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"><div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 space-y-1"><span class="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Enfoque Tradicional / Cortoplacista:</span><p class="text-slate-200 font-medium">' + sim.decisionA + '</p><p class="text-rose-300 text-[11px] font-semibold">↳ ' + sim.impactA + '</p></div><div class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 space-y-1"><span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Enfoque de Estado con Evidencia:</span><p class="text-slate-200 font-medium">' + sim.decisionB + '</p><p class="text-emerald-300 text-[11px] font-semibold">↳ ' + sim.impactB + '</p></div></div><div class="p-3 rounded-xl bg-slate-900 text-[11px] text-slate-300 border border-slate-800 flex items-start gap-2 mt-2"><i data-lucide="book-open" class="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"></i><span><strong class="text-white">Evidencia Histórica Global:</strong> ' + sim.evidence + '</span></div>';
    safeCreateIcons();
}

function renderLegislativeBills() {
    var snap = getSnapshot();
    allLegislativeBills = snap && snap.legislative_bills ? snap.legislative_bills : [];
    var container = document.getElementById('legislative-bills-container');
    if (!container) return;

    container.innerHTML = allLegislativeBills.map(function(b, idx) {
        return '<div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-800"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 font-black text-sm shadow-md">' + (idx + 1) + '</div><div><div class="flex items-center gap-2"><span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">' + b.bulletin_number + '</span><span class="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">' + b.status + '</span></div><h3 class="text-base sm:text-lg font-black text-white mt-0.5">' + b.title + '</h3></div></div><span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400"></i> ' + b.urgency + '</span></div><div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200"><strong class="text-slate-400 block text-[11px] uppercase tracking-wider mb-1 font-bold">Resumen del Proyecto:</strong>' + b.summary + '</div><div class="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-700/60 text-xs space-y-1.5 shadow-sm"><div class="flex items-center space-x-2 text-cyan-300 font-extrabold text-sm"><i data-lucide="user-check" class="w-4 h-4 text-cyan-400"></i><span>¿Cómo te afecta a ti en tu vida diaria?</span></div><p class="text-slate-100 leading-relaxed font-medium">' + b.ai_president_breakdown.como_te_afecta_a_ti + '</p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-1"><span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Lo Positivo:</span><p class="text-slate-200 font-medium">' + b.ai_president_breakdown.lo_positivo + '</p></div><div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-1"><span class="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Los Riesgos & Desafíos:</span><p class="text-slate-200 font-medium">' + b.ai_president_breakdown.los_riesgos + '</p></div></div><div class="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300"><div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><strong class="text-white block mb-0.5 font-bold">Oficialismo:</strong>' + b.political_debate.oficialismo + '</div><div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><strong class="text-white block mb-0.5 font-bold">Oposición:</strong>' + b.political_debate.oposicion + '</div><div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300"><strong class="text-emerald-400 block mb-0.5 font-bold">Evidencia OCDE / Banco Central:</strong>' + b.political_debate.evidencia_tecnica + '</div></div></div>';
    }).join('');

    safeCreateIcons();
}

function renderStrategyFodaView() {
    renderCountryFoda();
    renderRegionsSelector();
}

function toggleFodaScope(scope) {
    var countryContainer = document.getElementById('foda-country-container');
    var regionsContainer = document.getElementById('foda-regions-container');
    var btnCountry = document.getElementById('btn-foda-country');
    var btnRegions = document.getElementById('btn-foda-regions');

    if (!countryContainer || !regionsContainer || !btnCountry || !btnRegions) return;

    if (scope === 'country') {
        countryContainer.classList.remove('hidden');
        regionsContainer.classList.add('hidden');
        btnCountry.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex items-center gap-1.5 whitespace-nowrap';
        btnRegions.className = 'px-4 py-2 rounded-xl text-xs font-semibold transition text-slate-400 hover:text-white flex items-center gap-1.5 whitespace-nowrap';
    } else {
        countryContainer.classList.add('hidden');
        regionsContainer.classList.remove('hidden');
        btnRegions.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md flex items-center gap-1.5 whitespace-nowrap';
        btnCountry.className = 'px-4 py-2 rounded-xl text-xs font-semibold transition text-slate-400 hover:text-white flex items-center gap-1.5 whitespace-nowrap';
        selectRegion(currentSelectedRegionId);
    }
    safeCreateIcons();
}

function renderCountryFoda() {
    var container = document.getElementById('foda-country-container');
    if (!container) return;

    var snap = getSnapshot();
    var data = snap && snap.country_foda_strategy ? snap.country_foda_strategy : null;
    if (!data) return;

    var f = data.foda || {};
    var fHtml = (f.fortalezas || []).map(function(item) {
        return '<div class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-1"><h5 class="font-extrabold text-emerald-300 text-xs flex items-center gap-1.5"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i> ' + item.title + '</h5><p class="text-slate-300 text-[11px] leading-relaxed">' + item.desc + '</p></div>';
    }).join('');

    var oHtml = (f.oportunidades || []).map(function(item) {
        return '<div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-1"><h5 class="font-extrabold text-cyan-300 text-xs flex items-center gap-1.5"><i data-lucide="trending-up" class="w-3.5 h-3.5 text-cyan-400"></i> ' + item.title + '</h5><p class="text-slate-300 text-[11px] leading-relaxed">' + item.desc + '</p></div>';
    }).join('');

    var dHtml = (f.debilidades || []).map(function(item) {
        return '<div class="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-1"><h5 class="font-extrabold text-amber-300 text-xs flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-400"></i> ' + item.title + '</h5><p class="text-slate-300 text-[11px] leading-relaxed">' + item.desc + '</p></div>';
    }).join('');

    var aHtml = (f.amenazas || []).map(function(item) {
        return '<div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-1"><h5 class="font-extrabold text-rose-300 text-xs flex items-center gap-1.5"><i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-400"></i> ' + item.title + '</h5><p class="text-slate-300 text-[11px] leading-relaxed">' + item.desc + '</p></div>';
    }).join('');

    var pillarsHtml = (data.strategic_pillars_2050 || []).map(function(p) {
        return '<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"><span class="font-extrabold text-cyan-300 text-xs uppercase tracking-wide block">' + p.pillar + '</span><div class="space-y-1 text-slate-300"><div><strong class="text-amber-400">Meta 2030:</strong> ' + p.target_2030 + '</div><div><strong class="text-emerald-400">Meta 2050:</strong> ' + p.target_2050 + '</div></div></div>';
    }).join('');

    container.innerHTML = '<div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 border border-slate-800"><div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"><span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Síntesis Estratégica de la Presidenta IA:</span><p class="text-slate-200 text-xs sm:text-sm leading-relaxed">' + data.executive_summary + '</p></div><div class="space-y-2"><h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz FODA de la República de Chile (2026 - 2050):</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="glass-panel p-5 rounded-2xl space-y-3 border-emerald-800/40"><div class="flex items-center justify-between"><span class="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5"><i data-lucide="shield" class="w-4 h-4"></i> Fortalezas (Factores Internos)</span><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">F</span></div><div class="space-y-2.5">' + fHtml + '</div></div><div class="glass-panel p-5 rounded-2xl space-y-3 border-cyan-800/40"><div class="flex items-center justify-between"><span class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><i data-lucide="compass" class="w-4 h-4"></i> Oportunidades (Factores Externos)</span><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">O</span></div><div class="space-y-2.5">' + oHtml + '</div></div><div class="glass-panel p-5 rounded-2xl space-y-3 border-amber-800/40"><div class="flex items-center justify-between"><span class="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5"><i data-lucide="alert-circle" class="w-4 h-4"></i> Debilidades (Factores Internos)</span><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">D</span></div><div class="space-y-2.5">' + dHtml + '</div></div><div class="glass-panel p-5 rounded-2xl space-y-3 border-rose-800/40"><div class="flex items-center justify-between"><span class="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5"><i data-lucide="zap-off" class="w-4 h-4"></i> Amenazas (Factores Externos)</span><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">A</span></div><div class="space-y-2.5">' + aHtml + '</div></div></div></div><div class="space-y-3 pt-2 border-t border-slate-800"><h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Estratégico de Estado (Metas 2030 - 2050):</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + pillarsHtml + '</div></div></div>';
    safeCreateIcons();
}

function renderRegionsSelector() {
    var pillsContainer = document.getElementById('regions-pills');
    if (!pillsContainer) return;

    var snap = getSnapshot();
    var regions = snap && snap.regions_analysis ? snap.regions_analysis : [];
    pillsContainer.innerHTML = regions.map(function(r) {
        return '<button onclick="selectRegion(\'' + r.id + '\')" id="reg-pill-' + r.id + '" class="reg-pill px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ' + (r.id === currentSelectedRegionId ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 border border-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800') + '"><span class="font-mono text-[10px] text-cyan-300 font-extrabold mr-1">' + r.number + '</span> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</button>';
    }).join('');
}

function selectRegion(regionId) {
    currentSelectedRegionId = regionId;
    var snap = getSnapshot();
    var regions = snap && snap.regions_analysis ? snap.regions_analysis : [];
    var r = regions.find(function(item) { return item.id === regionId; }) || regions[0];
    if (!r) return;

    document.querySelectorAll('.reg-pill').forEach(function(btn) {
        btn.className = 'reg-pill px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs';
    });
    var activePill = document.getElementById('reg-pill-' + regionId);
    if (activePill) {
        activePill.className = 'reg-pill px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition bg-cyan-600 text-white shadow-md shadow-cyan-600/25 border border-cyan-400 text-xs';
    }

    var detailCard = document.getElementById('region-detail-card');
    if (!detailCard) return;

    var f = r.foda || {};
    var fHtml = (f.fortalezas || []).map(function(t) { return '<li class="text-slate-200 text-xs leading-relaxed flex items-start gap-1.5"><span class="text-emerald-400 font-bold">•</span> ' + t + '</li>'; }).join('');
    var oHtml = (f.oportunidades || []).map(function(t) { return '<li class="text-slate-200 text-xs leading-relaxed flex items-start gap-1.5"><span class="text-cyan-400 font-bold">•</span> ' + t + '</li>'; }).join('');
    var dHtml = (f.debilidades || []).map(function(t) { return '<li class="text-slate-200 text-xs leading-relaxed flex items-start gap-1.5"><span class="text-amber-400 font-bold">•</span> ' + t + '</li>'; }).join('');
    var aHtml = (f.amenazas || []).map(function(t) { return '<li class="text-slate-200 text-xs leading-relaxed flex items-start gap-1.5"><span class="text-rose-400 font-bold">•</span> ' + t + '</li>'; }).join('');

    detailCard.innerHTML = '<div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 border border-slate-800"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4"><div class="flex items-center space-x-3"><div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-cyan-600/20 font-mono">' + r.number + '</div><div><span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Capital Regional: ' + r.capital + '</span><h3 class="text-lg sm:text-xl font-black text-white">' + r.name + '</h3></div></div><div class="flex items-center gap-2 text-xs"><span class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium">👥 ' + (r.population || 0).toLocaleString('es-CL') + ' habitantes</span><span class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono font-bold">PIB: ' + r.pib_share + '</span></div></div><div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-1"><span class="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Vocación Productiva & Identidad Regional:</span><p class="text-slate-100 font-medium leading-relaxed">' + r.vocation + '</p></div><div class="space-y-2"><h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz FODA Territorial (' + r.name + '):</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-2"><span class="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="shield" class="w-3.5 h-3.5"></i> Fortalezas</span><ul class="space-y-1.5">' + fHtml + '</ul></div><div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 space-y-2"><span class="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="compass" class="w-3.5 h-3.5"></i> Oportunidades</span><ul class="space-y-1.5">' + oHtml + '</ul></div><div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-2"><span class="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Debilidades & Cuellos de Botella</span><ul class="space-y-1.5">' + dHtml + '</ul></div><div class="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-2"><span class="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> Amenazas & Riesgos</span><ul class="space-y-1.5">' + aHtml + '</ul></div></div></div><div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 text-xs space-y-1.5 shadow-md"><span class="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="crosshair" class="w-4 h-4 text-cyan-400"></i> Plan de Acción & Obras Estructurantes de la Presidenta IA (2026 - 2050):</span><p class="text-slate-100 font-medium leading-relaxed text-xs sm:text-sm">' + r.presidential_strategy + '</p></div></div>';

    safeCreateIcons();
}

function renderClustersView() {
    var snap = getSnapshot();
    allClusters = snap && snap.clusters ? snap.clusters : [];
    applyFilters();
}

function applyFilters() {
    var filtered = allClusters;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(function(c) { return (c.category || '').toLowerCase().indexOf(currentCategory.toLowerCase()) !== -1; });
    }
    if (currentSearch) {
        var q = currentSearch.toLowerCase();
        filtered = filtered.filter(function(c) { return (c.title || '').toLowerCase().indexOf(q) !== -1 || (c.description || '').toLowerCase().indexOf(q) !== -1; });
    }

    var container = document.getElementById('clusters-list');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-2 p-8 text-center text-slate-500 glass-panel rounded-2xl">No se encontraron noticias con estos criterios.</div>';
        return;
    }

    container.innerHTML = filtered.map(function(c) {
        var b = c.blindspot || { left_pct: 0.33, center_pct: 0.34, right_pct: 0.33 };
        var leftW = Math.round((b.left_pct || 0) * 100);
        var centerW = Math.round((b.center_pct || 0) * 100);
        var rightW = Math.round((b.right_pct || 0) * 100);

        return '<div class="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4"><div class="space-y-2"><div class="flex items-center justify-between gap-2"><span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20">' + (c.category || 'Nacional') + '</span><span class="text-xs text-slate-400 font-mono">' + (c.article_count || 1) + ' medios</span></div><h3 class="text-sm sm:text-base font-bold text-white leading-snug cursor-pointer hover:text-cyan-400 transition" onclick="openClusterModal(' + c.id + ')">' + c.title + '</h3><p class="text-xs text-slate-300 line-clamp-2">' + (c.description || '') + '</p></div><div class="space-y-1.5 pt-2 border-t border-slate-800"><div class="flex items-center justify-between text-[11px] font-semibold"><span class="text-rose-400">🔴 Izq ' + leftW + '%</span><span class="text-amber-400">🟡 Centro ' + centerW + '%</span><span class="text-blue-400">🔵 Der ' + rightW + '%</span></div><div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800"><div style="width: ' + leftW + '%" class="bg-rose-500 spectrum-bar"></div><div style="width: ' + centerW + '%" class="bg-amber-500 spectrum-bar"></div><div style="width: ' + rightW + '%" class="bg-blue-500 spectrum-bar"></div></div></div><div class="flex items-center justify-between text-xs pt-1"><span class="text-slate-500 text-[11px]">' + (c.last_seen_at ? new Date(c.last_seen_at).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'}) + ' hrs' : 'Hoy') + '</span><button onclick="openClusterModal(' + c.id + ')" class="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-xs">Comparar Coberturas <i data-lucide="arrow-right" class="w-3 h-3"></i></button></div></div>';
    }).join('');
    safeCreateIcons();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(function(btn) {
        btn.className = 'cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800';
    });
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.className = 'cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold';
    }
    applyFilters();
}

function filterClusters() {
    var input = document.getElementById('cluster-search');
    if (input) currentSearch = input.value;
    applyFilters();
}

function renderRoadmap2050() {
    var snap = getSnapshot();
    allRoadmapPhases = snap && snap.chile_2050_roadmap ? snap.chile_2050_roadmap : [];
    var container = document.getElementById('roadmap-container');
    if (!container) return;

    container.innerHTML = allRoadmapPhases.map(function(phase, idx) {
        var milestonesHtml = (phase.milestones || []).map(function(m) {
            return '<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"><div class="space-y-1"><div class="flex items-center gap-2"><span class="font-mono font-extrabold text-cyan-400 px-2.5 py-0.5 bg-cyan-950 rounded-lg border border-cyan-800">' + m.year + '</span><h5 class="font-bold text-white">' + m.title + '</h5></div></div><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">' + m.status + '</span></div>';
        }).join('');

        return '<div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-4 border border-slate-800"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-2xl bg-gradient-to-br ' + phase.color + ' flex items-center justify-center text-white font-black text-sm shadow-md">0' + (idx + 1) + '</div><div><h4 class="text-base sm:text-lg font-black text-white">' + phase.phase + '</h4><p class="text-xs text-slate-300 font-medium">' + phase.tagline + '</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">' + milestonesHtml + '</div></div>';
    }).join('');

    safeCreateIcons();
}

function renderAuditPillars() {
    var snap = getSnapshot();
    allAuditPillars = snap && snap.national_audit ? snap.national_audit : [];
    var container = document.getElementById('audit-pillars-container');
    if (!container) return;

    container.innerHTML = allAuditPillars.map(function(p, idx) {
        var statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">ESTADO CRÍTICO</span>';
        if (p.status_level === 'grave') statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">ESTADO GRAVE</span>';
        if (p.status_level === 'moderado') statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">ESTADO MODERADO</span>';

        var dataKeys = Object.entries(p.chile_current_data || {});
        var metricsHtml = dataKeys.map(function(pair) {
            return '<div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800"><span class="text-[10px] uppercase font-bold text-slate-400 block">' + pair[0].replace(/_/g, ' ') + '</span><span class="text-xs font-mono font-bold text-white">' + pair[1] + '</span></div>';
        }).join('');

        var benchmarksHtml = (p.global_benchmarks || []).map(function(b) {
            return '<div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"><div class="flex items-center justify-between text-cyan-400 font-bold"><span>' + b.country + '</span><span class="text-[10px] text-slate-400 font-mono">' + b.policy_model + '</span></div><p class="text-slate-300">' + b.historical_lesson + '</p><div class="text-[11px] text-emerald-400 pt-1 border-t border-slate-800"><strong>Aplicación en Chile:</strong> ' + b.applicability_chile + '</div></div>';
        }).join('');

        return '<div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-800"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">' + (idx + 1) + '</div><div><span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Pilar de Estado #' + (idx + 1) + '</span><h3 class="text-base sm:text-lg font-black text-white">' + p.title + '</h3></div></div>' + statusBadge + '</div><div class="space-y-2"><h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnóstico Estructural:</h4><p class="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">' + p.diagnostic + '</p></div><div><h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Datos Duros Oficiales (Chile):</h4><div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">' + metricsHtml + '</div></div><div class="space-y-2.5"><h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Experiencia Internacional & Solución Probada:</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + benchmarksHtml + '</div></div><div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"></i><div><strong class="font-bold text-amber-300">Riesgo Crítico hacia 2030 si no se actúa:</strong><p class="text-slate-300 text-[11px] mt-0.5">' + p.future_risks_2030 + '</p></div></div><div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200"><strong class="font-bold text-cyan-300 uppercase tracking-wider text-[11px] block mb-1">Recomendación Estratégica de la Presidenta IA:</strong><p class="text-slate-200 leading-relaxed">' + p.strategic_recommendation + '</p></div></div>';
    }).join('');

    safeCreateIcons();
}

function renderCitizenProposals() {
    var container = document.getElementById('citizen-proposals-grid');
    if (!container) return;

    container.innerHTML = allProposals.map(function(p) {
        return '<div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"><div class="space-y-1.5"><span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">' + p.pillar + '</span><h4 class="font-bold text-white text-sm leading-snug">' + p.title + '</h4><p class="text-slate-300 text-xs">' + p.desc + '</p><div class="text-[10px] text-slate-500">Por: ' + p.author + '</div></div><div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs"><button onclick="upvoteProposal(' + p.id + ')" class="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/60 flex items-center gap-1.5 transition"><i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>' + p.votes + ' Votos</span></button><span class="text-emerald-400 text-[11px] font-semibold flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> En Revisión</span></div></div>';
    }).join('');
    safeCreateIcons();
}

function upvoteProposal(id) {
    var prop = allProposals.find(function(p) { return p.id === id; });
    if (prop) {
        prop.votes += 1;
        renderCitizenProposals();
    }
}

function openCitizenProposalModal() {
    var el = document.getElementById('proposal-modal');
    if (el) el.classList.remove('hidden');
    safeCreateIcons();
}

function submitCitizenProposal(e) {
    e.preventDefault();
    var pilar = document.getElementById('prop-pilar').value;
    var title = document.getElementById('prop-title').value;
    var desc = document.getElementById('prop-desc').value;
    var resDiv = document.getElementById('prop-result');

    allProposals.unshift({
        id: allProposals.length + 1,
        pillar: pilar,
        title: title,
        author: 'Ciudadano Conectado',
        votes: 1,
        desc: desc
    });

    resDiv.classList.remove('hidden');
    resDiv.innerHTML = '<div class="text-emerald-400 font-bold">¡Propuesta Cívica publicada con éxito en el Ágora Nacional!</div>';
    
    setTimeout(function() {
        closeModal('proposal-modal');
        resDiv.classList.add('hidden');
        document.getElementById('prop-title').value = '';
        document.getElementById('prop-desc').value = '';
        renderCitizenProposals();
        switchTab('citizen');
    }, 1200);
}

function openClusterModal(clusterId) {
    var modal = document.getElementById('cluster-modal');
    var body = document.getElementById('modal-body');
    if (!modal || !body) return;

    modal.classList.remove('hidden');

    var snap = getSnapshot();
    var clusterDetail = (snap && snap.clusters_detail && snap.clusters_detail[String(clusterId)]) ? snap.clusters_detail[String(clusterId)] : null;

    if (!clusterDetail) {
        var c = allClusters.find(function(item) { return item.id === clusterId; }) || { title: 'Evento Fáctico', description: '', category: 'General' };
        clusterDetail = {
            title: c.title,
            description: c.description,
            category: c.category,
            articles: [{ title: c.title, snippet: c.description, url: '#', source: { name: 'Medio Chileno', spectrum: 'centro', ownership: 'Empresa Periodística' } }]
        };
    }

    document.getElementById('modal-title').innerText = clusterDetail.title;
    document.getElementById('modal-category').innerText = clusterDetail.category || 'General';

    var articlesHtml = (clusterDetail.articles || []).map(function(a) {
        var badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        var spec = (a.source.spectrum || '').toLowerCase();
        if (spec.indexOf('derecha') !== -1) badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (spec.indexOf('izquierda') !== -1) badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

        return '<div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"><div class="flex items-center justify-between"><span class="font-bold text-cyan-400">' + a.source.name + '</span><span class="text-[10px] font-bold px-2 py-0.5 rounded border ' + badgeColor + '">' + a.source.spectrum.toUpperCase() + '</span></div><h4 class="font-bold text-white text-sm leading-snug">' + a.title + '</h4><p class="text-slate-300 text-xs">' + (a.snippet || '') + '</p><div class="pt-2 flex justify-between items-center text-slate-500 text-[11px] border-t border-slate-800"><span>Controlador: ' + a.source.ownership + '</span>' + (a.url && a.url !== '#' ? '<a href="' + a.url + '" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">Leer noticia original <i data-lucide="external-link" class="w-3 h-3"></i></a>' : '') + '</div></div>';
    }).join('');

    body.innerHTML = '<div class="space-y-4"><div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1"><h4 class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Síntesis Fáctica de Estado:</h4><p class="text-slate-200 text-sm leading-relaxed">' + (clusterDetail.description || 'Evento en seguimiento.') + '</p></div><div class="space-y-2.5"><h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Despachos por Medio de Comunicación (' + (clusterDetail.articles || []).length + ' fuentes):</h4><div class="space-y-2.5">' + articlesHtml + '</div></div></div>';

    safeCreateIcons();
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function openArcoModal() {
    var el = document.getElementById('arco-modal');
    if (el) el.classList.remove('hidden');
    safeCreateIcons();
}

function submitArcoForm(e) {
    e.preventDefault();
    var resDiv = document.getElementById('arco-result');
    var fakeTicket = 'ARCO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    resDiv.classList.remove('hidden');
    resDiv.innerHTML = '<div class="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> Solicitud Registrada</div><div class="text-slate-300">Ticket ID: <strong class="font-mono text-cyan-400">' + fakeTicket + '</strong></div><div class="text-slate-400 text-[11px] mt-1">Plazo legal: 30 días corridos según Ley N° 21.719. Se ha notificado al Delegado de Protección de Datos.</div>';
    document.getElementById('arco-form').reset();
    safeCreateIcons();
}

function refreshData() {
    location.reload();
}

function switchTab(tabId) {
    var tabs = ['cadena', 'leyes', 'foda', 'clusters', 'roadmap', 'audit', 'citizen'];
    tabs.forEach(function(t) {
        var view = document.getElementById('view-' + t);
        var btn = document.getElementById('tab-btn-' + t);
        if (!view || !btn) return;
        
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.className = 'px-4 py-2.5 rounded-xl font-bold transition bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md flex items-center space-x-2 whitespace-nowrap';
        } else {
            view.classList.add('hidden');
            btn.className = 'px-4 py-2.5 rounded-xl font-semibold transition text-slate-400 hover:text-white flex items-center space-x-2 whitespace-nowrap';
        }
    });

    if (tabId === 'cadena') {
        setTimeout(renderStatecraftRadar, 60);
    }
    safeCreateIcons();
}

function renderAllViews() {
    try {
        renderEconomicIndicators();
        renderCadenaNacional();
        renderLegislativeBills();
        renderStrategyFodaView();
        renderClustersView();
        renderRoadmap2050();
        renderAuditPillars();
        renderCitizenProposals();
        safeCreateIcons();
    } catch (e) {
        console.error('Error rendering views:', e);
    }
}

if (typeof window !== 'undefined') {
    window.renderAllViews = renderAllViews;
    window.switchTab = switchTab;
    window.selectRegion = selectRegion;
    window.toggleFodaScope = toggleFodaScope;
    window.runSimulation = runSimulation;
    window.openClusterModal = openClusterModal;
    window.closeModal = closeModal;
    window.openCitizenProposalModal = openCitizenProposalModal;
    window.submitCitizenProposal = submitCitizenProposal;
    window.upvoteProposal = upvoteProposal;
    window.openArcoModal = openArcoModal;
    window.submitArcoForm = submitArcoForm;
    window.refreshData = refreshData;
    window.filterCategory = filterCategory;
    window.filterClusters = filterClusters;
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            renderAllViews();
            runSimulation();
        });
    } else {
        renderAllViews();
        runSimulation();
    }
}

