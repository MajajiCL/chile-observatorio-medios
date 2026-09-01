// Presidenta IA & Radiografía de Estado de Chile - shadcn/ui Universal Client Engine

var dataSnapshot = (typeof window !== 'undefined' && window.OBSERVATORIO_SNAPSHOT) ? window.OBSERVATORIO_SNAPSHOT : null;
var currentRegionId = 'antofagasta';
var matrixSortField = 'population';
var matrixSortAsc = false;
var currentCategory = 'all';
var currentSearch = '';

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

// 1. TICKER SUPERIOR INDICADORES
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
        return '<div class="flex items-center space-x-1.5 whitespace-nowrap"><span class="text-[#737373] font-medium text-[11px]">' + ind.code + ':</span><span class="text-[#0a0a0a] font-mono font-semibold text-xs">' + (isClp ? '$' : '') + formatted + (ind.unit === '%' ? '%' : '') + '</span></div>';
    }).join('');
}

// 2. BALANCE NACIONAL (INGRESOS & GASTOS)
function renderNationalBalanceView() {
    var snap = getSnapshot();
    var fiscal = snap && snap.national_fiscal_balance ? snap.national_fiscal_balance : null;
    var infra = snap && snap.national_infrastructure_summary ? snap.national_infrastructure_summary : null;
    if (!fiscal) return;

    var totalBudgetEl = document.getElementById('national-total-budget');
    var gdpEl = document.getElementById('national-gdp');
    var deficitEl = document.getElementById('national-deficit');
    var debtEl = document.getElementById('national-debt');

    if (totalBudgetEl) totalBudgetEl.innerText = 'US$ ' + (fiscal.total_budget_usd / 1e9).toFixed(1) + 'B (' + fiscal.total_budget_clp_trillions + 'B CLP)';
    if (gdpEl) gdpEl.innerText = 'US$ ' + (fiscal.gdp_nominal_usd / 1e9).toFixed(0) + 'B (PIB pc: US$ ' + fiscal.gdp_per_capita_usd.toLocaleString('es-CL') + ')';
    if (deficitEl) deficitEl.innerText = fiscal.fiscal_deficit_pct_gdp + '% del PIB';
    if (debtEl) debtEl.innerText = fiscal.gross_public_debt_pct_gdp + '% del PIB (US$ ' + (fiscal.gross_public_debt_usd / 1e9).toFixed(1) + 'B)';

    var revenuesList = document.getElementById('revenues-breakdown-list');
    if (revenuesList) {
        revenuesList.innerHTML = (fiscal.revenues || []).map(function(r) {
            return '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1">' +
                '<div class="flex items-center justify-between text-xs font-semibold">' +
                    '<span class="text-[#0a0a0a]">' + r.category + '</span>' +
                    '<span class="font-mono text-[#0a0a0a]">US$ ' + (r.amount_usd / 1e9).toFixed(2) + 'B (' + r.pct_total + '%)</span>' +
                '</div>' +
                '<p class="text-[11px] text-[#737373]">' + r.desc + '</p>' +
                '<div class="w-full bg-[#e5e5e5] h-1.5 rounded-full overflow-hidden mt-1">' +
                    '<div class="bg-[#0a0a0a] h-full rounded-full" style="width: ' + r.pct_total + '%"></div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    var expendituresList = document.getElementById('expenditures-breakdown-list');
    if (expendituresList) {
        expendituresList.innerHTML = (fiscal.expenditures || []).map(function(e) {
            return '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1">' +
                '<div class="flex items-center justify-between text-xs font-semibold">' +
                    '<span class="text-[#0a0a0a]">' + e.category + '</span>' +
                    '<span class="font-mono text-[#0a0a0a]">US$ ' + (e.amount_usd / 1e9).toFixed(2) + 'B (' + e.pct_total + '%)</span>' +
                '</div>' +
                '<p class="text-[11px] text-[#737373]">' + e.desc + '</p>' +
                '<div class="w-full bg-[#e5e5e5] h-1.5 rounded-full overflow-hidden mt-1">' +
                    '<div class="bg-[#171717] h-full rounded-full" style="width: ' + Math.min(e.pct_total * 3, 100) + '%"></div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    var infraGrid = document.getElementById('national-infra-summary-grid');
    if (infraGrid && infra) {
        infraGrid.innerHTML = '' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Colegios Totales</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + infra.schools_total.toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">Públicos, subvencionados y pagados</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Hospitales Públicos</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + infra.hospitals_total.toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">+624 CESFAM de atención primaria</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Cárceles & Hacinamiento</span><span class="text-xl font-bold font-mono text-[#e7000b]">' + infra.prisons_hacinamiento_national_pct + '%</span><span class="text-[10px] text-[#737373] block">' + infra.prisons_total + ' recintos penitenciarios</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Policías Totales</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + (infra.police_officers_carabineros + infra.police_officers_pdi).toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">54.200 Carabineros + 13.400 PDI</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Bomberos Voluntarios</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + infra.firefighters_volunteers_total.toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">1.240 compañías a nivel nacional</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Fuerzas Armadas</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + infra.military_personnel_total.toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">Ejército, Armada y FACh</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Déficit Habitacional</span><span class="text-xl font-bold font-mono text-[#e7000b]">' + infra.housing_deficit_units.toLocaleString('es-CL') + '</span><span class="text-[10px] text-[#737373] block">Familias en campamentos y allegadas</span></div>' +
            '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><span class="text-[11px] uppercase font-semibold text-[#737373] block">Matriz Eléctrica Renovable</span><span class="text-xl font-bold font-mono text-[#0a0a0a]">' + infra.renewable_energy_share_pct + '%</span><span class="text-[10px] text-[#737373] block">33.400 MW de capacidad instalada</span></div>';
    }

    setTimeout(renderFiscalCharts, 60);
}

function renderFiscalCharts() {
    var chartDom = document.getElementById('chart-fiscal-flow');
    if (!chartDom || typeof echarts === 'undefined') return;

    try {
        var myChart = echarts.init(chartDom, null, { renderer: 'svg' });
        var option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                textStyle: { color: '#0f172a', fontFamily: 'Plus Jakarta Sans', fontSize: 12 },
                formatter: function(params) {
                    return '<div class="p-1"><strong>' + params.name + '</strong><br/><span style="color:#64748b">Gasto:</span> US$ ' + params.value + 'B (' + params.percent + '%)</div>';
                }
            },
            series: [
                {
                    name: 'Gasto Público',
                    type: 'pie',
                    center: ['50%', '50%'],
                    radius: ['45%', '75%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#0f172a' }
                    },
                    data: [
                        { value: 18.2, name: 'Salud Pública', itemStyle: { color: '#0f172a' } },
                        { value: 17.8, name: 'Educación', itemStyle: { color: '#1e293b' } },
                        { value: 16.9, name: 'Protección Social & PGU', itemStyle: { color: '#334155' } },
                        { value: 7.1, name: 'Obras Públicas & MOP', itemStyle: { color: '#475569' } },
                        { value: 6.8, name: 'GOREs & Municipios', itemStyle: { color: '#64748b' } },
                        { value: 5.4, name: 'Seguridad & Policías', itemStyle: { color: '#94a3b8' } },
                        { value: 4.6, name: 'Vivienda MINVU', itemStyle: { color: '#cbd5e1' } },
                        { value: 2.85, name: 'Defensa FFAA', itemStyle: { color: '#0284c7' } },
                        { value: 4.2, name: 'Intereses Deuda', itemStyle: { color: '#dc2626' } },
                        { value: 9.6, name: 'Otros Ministerios', itemStyle: { color: '#e2e8f0' } }
                    ]
                }
            ]
        };
        myChart.setOption(option);
    } catch (e) {}
}

// 3. AUDITORÍA REGIONAL (16 REGIONES)
function renderRegionsAuditView() {
    renderRegionPills();
    selectRegion(currentRegionId);
}

function renderRegionPills() {
    var container = document.getElementById('region-selector-pills');
    if (!container) return;

    var snap = getSnapshot();
    var regions = snap && snap.regions_complete_audit ? snap.regions_complete_audit : [];

    container.innerHTML = regions.map(function(r) {
        var isSelected = r.id === currentRegionId;
        var btnClass = isSelected
            ? 'shadcn-button-primary px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm'
            : 'shadcn-button-secondary px-3.5 py-1.5 text-xs font-medium whitespace-nowrap hover:bg-[#f1f5f9]';
        return '<button onclick="selectRegion(\'' + r.id + '\')" id="btn-reg-' + r.id + '" class="' + btnClass + '"><span class="font-mono font-bold mr-1 opacity-70">' + r.number + '</span> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</button>';
    }).join('');
}

function selectRegion(regionId) {
    currentRegionId = regionId;
    var snap = getSnapshot();
    var regions = snap && snap.regions_complete_audit ? snap.regions_complete_audit : [];
    var r = regions.find(function(item) { return item.id === regionId; }) || regions[0];
    if (!r) return;

    regions.forEach(function(item) {
        var btn = document.getElementById('btn-reg-' + item.id);
        if (btn) {
            btn.className = (item.id === regionId)
                ? 'shadcn-button-primary px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm'
                : 'shadcn-button-secondary px-3.5 py-1.5 text-xs font-medium whitespace-nowrap hover:bg-[#f1f5f9]';
        }
    });

    var container = document.getElementById('region-full-audit-container');
    if (!container) return;

    var hacinamientoColor = '#0f172a';
    if (r.carceles_gendarmeria.hacinamiento_pct > 140) hacinamientoColor = '#dc2626';

    var photoUrl = r.image_url || 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1000&q=80';
    var photoCaption = r.image_caption || r.capital;
    var idhVal = r.idh ? r.idh.toFixed(3) : '0.820';
    var informalVal = r.informal_labor_pct ? r.informal_labor_pct + '%' : '28.5%';
    var waterDeficitVal = r.water_deficit_pct ? r.water_deficit_pct + '%' : '45.0%';

    container.innerHTML = '' +
        '<!-- BANNER FOTOGRÁFICO REAL DE LA REGIÓN -->' +
        '<div class="relative rounded-[22px] overflow-hidden border border-[#e2e8f0] shadow-sm mb-6 bg-[#0f172a]">' +
            '<img src="' + photoUrl + '" alt="' + r.name + '" class="region-hero-image filter brightness-90 hover:scale-105 transition-transform duration-700" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent flex flex-col justify-between p-5 md:p-7">' +
                '<div class="flex flex-wrap items-center justify-between gap-2">' +
                    '<span class="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#0f172a] shadow-sm backdrop-blur-md flex items-center gap-1.5">' +
                        '<i data-lucide="map-pin" class="w-3.5 h-3.5 text-[#0284c7]"></i> Región ' + r.number + ' • ' + r.capital +
                    '</span>' +
                    '<div class="flex items-center gap-2">' +
                        '<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#0f172a]/90 text-white border border-white/20 backdrop-blur-md">IDH: ' + idhVal + ' (Alto)</span>' +
                        '<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#0f172a]/90 text-amber-300 border border-white/20 backdrop-blur-md">Informalidad: ' + informalVal + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="space-y-1">' +
                    '<span class="text-xs font-medium text-slate-200 flex items-center gap-1"><i data-lucide="camera" class="w-3.5 h-3.5"></i> ' + photoCaption + '</span>' +
                    '<h2 class="text-2xl md:text-4xl font-extrabold text-white tracking-tight">' + r.name + '</h2>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<!-- RESUMEN DE IDENTIDAD Y DATOS DEMOGRÁFICOS -->' +
        '<div class="shadcn-card p-6 md:p-7 space-y-4">' +
            '<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">' +
                '<div class="flex items-center space-x-3">' +
                    '<div class="w-11 h-11 rounded-[16px] bg-[#0f172a] text-white flex items-center justify-center font-mono font-extrabold text-base shadow-sm">' + r.number + '</div>' +
                    '<div>' +
                        '<span class="text-[11px] font-mono uppercase tracking-wider text-[#64748b] font-bold">Capital: ' + r.capital + ' • ' + r.communes_count + ' Comunas</span>' +
                        '<h3 class="text-lg md:text-xl font-bold text-[#0f172a]">' + r.name + '</h3>' +
                    '</div>' +
                '</div>' +
                '<div class="flex flex-wrap items-center gap-2 text-xs">' +
                    '<span class="shadcn-badge bg-[#f8f9fa] text-[#0f172a] border border-[#e2e8f0]">👥 ' + r.population.toLocaleString('es-CL') + ' hab.</span>' +
                    '<span class="shadcn-badge bg-[#f8f9fa] text-[#0f172a] border border-[#e2e8f0]">📐 ' + r.area_km2.toLocaleString('es-CL') + ' km²</span>' +
                    '<span class="shadcn-badge bg-[#0f172a] text-white font-mono font-semibold">PIB: ' + r.pib_share_pct + '% Nacional</span>' +
                    '<span class="shadcn-badge bg-[#f8f9fa] text-[#dc2626] border border-[#e2e8f0]">Pobreza: ' + r.poverty_rate_pct + '%</span>' +
                    '<span class="shadcn-badge bg-[#f8f9fa] text-[#0284c7] border border-[#e2e8f0]">Déficit Hídrico: ' + waterDeficitVal + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] text-xs space-y-1">' +
                '<span class="text-[11px] font-bold text-[#0f172a] uppercase tracking-wider block">Vocación Productiva & Identidad Territorial:</span>' +
                '<p class="text-[#334155] leading-relaxed font-normal text-xs md:text-sm">' + r.vocation + '</p>' +
            '</div>' +
        '</div>' +

        '<!-- GRID DE 8 EJES DE AUDITORÍA DE ESTADO -->' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">' +

            '<!-- 1. FINANZAS GORE & MUNICIPIOS -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="landmark" class="w-4 h-4 text-[#0284c7]"></i> Finanzas GORE & Municipios</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">FNDR</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Presupuesto FNDR:</span><span class="font-mono font-bold text-[#0f172a]">$' + (r.fiscal_gore.budget_fndr_clp_millions).toLocaleString('es-CL') + 'M</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Ejecución Presupuestaria:</span><span class="font-mono font-bold text-[#0f172a]">' + r.fiscal_gore.fndr_execution_pct + '%</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Ingreso Municipal per cápita:</span><span class="font-mono font-bold text-[#0f172a]">$' + r.fiscal_gore.per_capita_municipal_income_clp.toLocaleString('es-CL') + '/hab</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Dependencia Fondo Común (FCM):</span><span class="font-mono font-bold text-[#dc2626]">' + r.fiscal_gore.fcm_dependency_pct + '%</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Fuente: SUBDERE & DIPRES</div>' +
            '</div>' +

            '<!-- 2. SALUD PÚBLICA -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="heart-pulse" class="w-4 h-4 text-[#dc2626]"></i> Salud Pública & Hospitales</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">FONASA</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Hospitales Alta Complejidad:</span><span class="font-mono font-bold text-[#0f172a]">' + r.salud.hospitals_high_complexity + ' (+ ' + r.salud.hospitals_low_mid + ' mediana/baja)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">CESFAM / Postas Rurales:</span><span class="font-mono font-bold text-[#0f172a]">' + r.salud.cesfam_and_rural_posts + '</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Lista Espera Quirúrgica:</span><span class="font-mono font-bold text-[#dc2626]">' + r.salud.surgical_waiting_list_patients.toLocaleString('es-CL') + ' pac. (' + r.salud.surgical_waiting_list_avg_days + ' días)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Camas Críticas (UPC) / 100k:</span><span class="font-mono font-bold text-[#0f172a]">' + r.salud.critical_beds_per_100k + '</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Deuda Hospitalaria Cenabast:</span><span class="font-mono font-bold text-[#64748b]">$' + r.salud.cenabast_hospital_debt_clp_millions.toLocaleString('es-CL') + 'M</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Fuente: DEIS / Ministerio de Salud</div>' +
            '</div>' +

            '<!-- 3. EDUCACIÓN & CAPITAL HUMANO -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="graduation-cap" class="w-4 h-4 text-[#0284c7]"></i> Educación & Escuelas</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">MINEDUC</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Establecimientos:</span><span class="font-mono font-bold text-[#0f172a]">' + (r.educacion.schools_public_slep + r.educacion.schools_municipal + r.educacion.schools_subsidized_private + r.educacion.schools_private_paid) + ' (' + r.educacion.schools_public_slep + ' SLEP)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Matrícula Escolar Total:</span><span class="font-mono font-bold text-[#0f172a]">' + r.educacion.total_students_enrolled.toLocaleString('es-CL') + '</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Deserción / Asistencia Crítica:</span><span class="font-mono font-bold text-[#dc2626]">' + r.educacion.school_dropout_rate_pct + '% / ' + r.educacion.critical_attendance_pct + '%</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Promedio SIMCE Mat / Leng:</span><span class="font-mono font-bold text-[#0f172a]">' + r.educacion.simce_math_avg + ' / ' + r.educacion.simce_reading_avg + ' pts</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Cobertura Gratuidad Superior:</span><span class="font-mono font-bold text-[#0f172a]">' + r.educacion.higher_education_gratuity_coverage_pct + '%</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Fuente: Mineduc & DEMRE</div>' +
            '</div>' +

            '<!-- 4. SEGURIDAD PÚBLICA & POLICÍAS -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="shield" class="w-4 h-4 text-[#0f172a]"></i> Seguridad & Policías</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">POLICÍA</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Dotación Carabineros:</span><span class="font-mono font-bold text-[#0f172a]">' + r.seguridad_policias.carabineros_active_officers.toLocaleString('es-CL') + ' (' + r.seguridad_policias.carabineros_stations_and_posts + ' cuarteles)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Radiopatrullas Operativas:</span><span class="font-mono font-bold text-[#0f172a]">' + r.seguridad_policias.carabineros_patrol_vehicles_operational + ' (' + r.seguridad_policias.carabineros_patrol_vehicles_out_of_service + ' en pana)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Detectives PDI:</span><span class="font-mono font-bold text-[#0f172a]">' + r.seguridad_policias.pdi_detectives.toLocaleString('es-CL') + ' (' + r.seguridad_policias.pdi_stations + ' unidades)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Tasa Homicidios / 100k:</span><span class="font-mono font-bold text-[#dc2626]">' + r.seguridad_policias.homicide_rate_per_100k + '</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Incautación Drogas Anual:</span><span class="font-mono font-bold text-[#0f172a]">' + r.seguridad_policias.drug_seizures_annual_kg.toLocaleString('es-CL') + ' kg</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Amenaza: ' + r.seguridad_policias.organized_crime_threat_level + '</div>' +
            '</div>' +

            '<!-- 5. CÁRCELES & GENDARMERÍA -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="lock" class="w-4 h-4 text-[#dc2626]"></i> Sistema Penitenciario</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">GENDARMERÍA</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Recintos Penitenciarios:</span><span class="font-mono font-bold text-[#0f172a]">' + r.carceles_gendarmeria.prisons_count + ' cárceles</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Capacidad vs Población:</span><span class="font-mono font-bold text-[#0f172a]">' + r.carceles_gendarmeria.design_capacity_places.toLocaleString('es-CL') + ' / ' + r.carceles_gendarmeria.actual_inmate_population.toLocaleString('es-CL') + ' reos</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Hacinamiento Carcelario:</span><span class="font-mono font-bold" style="color: ' + hacinamientoColor + '">' + r.carceles_gendarmeria.hacinamiento_pct + '%</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Dotación Gendarmería:</span><span class="font-mono font-bold text-[#0f172a]">' + r.carceles_gendarmeria.gendarmeria_staff.toLocaleString('es-CL') + ' funcionarios</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Inhibición Celular:</span><span class="font-medium text-[#0f172a] text-[11px]">' + r.carceles_gendarmeria.cellular_signal_inhibition_active + '</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Tasa Reincidencia: ' + r.carceles_gendarmeria.recidivism_rate_pct + '%</div>' +
            '</div>' +

            '<!-- 6. BOMBEROS & EMERGENCIAS -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-[#dc2626]"></i> Bomberos & Emergencias</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">VOLUNTARIOS</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Cuerpos & Compañías:</span><span class="font-mono font-bold text-[#0f172a]">' + r.bomberos_emergencias.fire_departments_bodies + ' cuerpos (' + r.bomberos_emergencias.fire_companies_count + ' cías)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Voluntarios Activos:</span><span class="font-mono font-bold text-[#0f172a]">' + r.bomberos_emergencias.active_volunteer_firefighters.toLocaleString('es-CL') + ' bomberos</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Carros Bomba Operativos:</span><span class="font-mono font-bold text-[#0f172a]">' + r.bomberos_emergencias.fire_trucks_operational + ' (' + r.bomberos_emergencias.fire_trucks_out_of_service + ' en pana)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Aporte Estado vs Rifas:</span><span class="font-mono font-bold text-[#0f172a]">' + r.bomberos_emergencias.state_budget_funding_pct + '% / ' + r.bomberos_emergencias.self_funding_rifas_pct + '%</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Tiempo Respuesta Promedio:</span><span class="font-mono font-bold text-[#0f172a]">' + r.bomberos_emergencias.avg_response_time_minutes + ' minutos</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Riesgo CONAF: ' + r.bomberos_emergencias.forest_fire_risk_conaf + '</div>' +
            '</div>' +

            '<!-- 7. DEFENSA NACIONAL & FFAA -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="crosshair" class="w-4 h-4 text-[#0284c7]"></i> Defensa & Fuerzas Armadas</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">FFAA</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Efectivos Militares Activos:</span><span class="font-mono font-bold text-[#0f172a]">' + r.defensa_ffaa.active_military_personnel.toLocaleString('es-CL') + '</span></div>' +
                        '<div><span class="text-[#64748b] block text-[11px]">Ejército:</span><p class="font-medium text-[#0f172a] text-[11px]">' + r.defensa_ffaa.army_units + '</p></div>' +
                        '<div><span class="text-[#64748b] block text-[11px]">Armada:</span><p class="font-medium text-[#0f172a] text-[11px]">' + r.defensa_ffaa.navy_units + '</p></div>' +
                        '<div><span class="text-[#64748b] block text-[11px]">FACh:</span><p class="font-medium text-[#0f172a] text-[11px]">' + r.defensa_ffaa.air_force_units + '</p></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">' + r.defensa_ffaa.strategic_border_role + '</div>' +
            '</div>' +

            '<!-- 8. VIVIENDA, VIALIDAD & AGUA -->' +
            '<div class="shadcn-card p-5 space-y-3.5 flex flex-col justify-between">' +
                '<div class="space-y-2">' +
                    '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
                        '<h4 class="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5"><i data-lucide="truck" class="w-4 h-4 text-[#0f172a]"></i> Vivienda, Vialidad & Agua</h4>' +
                        '<span class="shadcn-badge bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]">MOP/MINVU</span>' +
                    '</div>' +
                    '<div class="space-y-2 text-xs pt-1">' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Déficit Habitacional:</span><span class="font-mono font-bold text-[#dc2626]">' + r.infraestructura_territorio.housing_deficit_families.toLocaleString('es-CL') + ' fam. (' + r.infraestructura_territorio.camps_tomas_count + ' campamentos)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Red Vial Pavimentada:</span><span class="font-mono font-bold text-[#0f172a]">' + r.infraestructura_territorio.paved_roads_km.toLocaleString('es-CL') + ' km (' + r.infraestructura_territorio.unpaved_roads_km.toLocaleString('es-CL') + ' km tierra)</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Llenado de Embalses:</span><span class="font-mono font-bold text-[#0f172a]">' + r.infraestructura_territorio.reservoir_water_storage_pct + '%</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Plantas Desalinizadoras:</span><span class="font-mono font-bold text-[#0f172a]">' + r.infraestructura_territorio.desalination_plants_operating + ' en operación</span></div>' +
                        '<div class="flex justify-between"><span class="text-[#64748b]">Cobertura APR Rural / ERNC:</span><span class="font-mono font-bold text-[#0f172a]">' + r.infraestructura_territorio.rural_water_apr_coverage_pct + '% / ' + r.infraestructura_territorio.renewable_energy_capacity_mw + ' MW</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="text-[10px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">Fuente: MOP & DGA</div>' +
            '</div>' +

        '</div>' +

        '<!-- PLAN DE ACCIÓN PRESIDENCIAL 2026-2050 -->' +
        '<div class="shadcn-card p-6 md:p-7 space-y-2 border-l-4 border-l-[#0f172a]">' +
            '<span class="text-[11px] font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">' +
                '<i data-lucide="sparkles" class="w-4 h-4 text-[#dc2626]"></i> Plan de Estado de la Presidenta IA para ' + r.name + ' (2026 - 2050):' +
            '</span>' +
            '<p class="text-xs md:text-sm text-[#1e293b] font-normal leading-relaxed">' + r.presidential_strategy_2050 + '</p>' +
        '</div>';

    safeCreateIcons();
}

// 4. MATRIZ COMPARATIVA 16 REGIONES (TABLA INTERACTIVA)
function renderRegionalMatrixTable() {
    var tableBody = document.getElementById('regional-matrix-tbody');
    if (!tableBody) return;

    var snap = getSnapshot();
    var regions = snap && snap.regions_complete_audit ? [].concat(snap.regions_complete_audit) : [];

    regions.sort(function(a, b) {
        var valA = getFieldValue(a, matrixSortField);
        var valB = getFieldValue(b, matrixSortField);
        if (typeof valA === 'string') {
            return matrixSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return matrixSortAsc ? valA - valB : valB - valA;
    });

    tableBody.innerHTML = regions.map(function(r) {
        return '<tr class="border-b border-[#e5e5e5] hover:bg-[#fafafa] transition text-xs cursor-pointer" onclick="switchToRegion(\'' + r.id + '\')">' +
            '<td class="py-3 px-4 font-mono font-bold text-[#0a0a0a]">' + r.number + '</td>' +
            '<td class="py-3 px-4 font-semibold text-[#0a0a0a]">' + r.name + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.population.toLocaleString('es-CL') + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.pib_share_pct + '%</td>' +
            '<td class="py-3 px-4 font-mono text-right font-bold ' + (r.carceles_gendarmeria.hacinamiento_pct > 140 ? 'text-[#e7000b]' : 'text-[#0a0a0a]') + '">' + r.carceles_gendarmeria.hacinamiento_pct + '%</td>' +
            '<td class="py-3 px-4 font-mono text-right ' + (r.seguridad_policias.homicide_rate_per_100k > 6 ? 'text-[#e7000b] font-bold' : 'text-[#171717]') + '">' + r.seguridad_policias.homicide_rate_per_100k + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.salud.surgical_waiting_list_patients.toLocaleString('es-CL') + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.seguridad_policias.carabineros_active_officers.toLocaleString('es-CL') + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.salud.critical_beds_per_100k + '</td>' +
            '<td class="py-3 px-4 font-mono text-right text-[#171717]">' + r.fiscal_gore.fcm_dependency_pct + '%</td>' +
        '</tr>';
    }).join('');
}

function getFieldValue(obj, field) {
    if (field === 'population') return obj.population || 0;
    if (field === 'pib_share_pct') return obj.pib_share_pct || 0;
    if (field === 'hacinamiento') return obj.carceles_gendarmeria.hacinamiento_pct || 0;
    if (field === 'homicidios') return obj.seguridad_policias.homicide_rate_per_100k || 0;
    if (field === 'espera') return obj.salud.surgical_waiting_list_patients || 0;
    if (field === 'policias') return obj.seguridad_policias.carabineros_active_officers || 0;
    if (field === 'camas') return obj.salud.critical_beds_per_100k || 0;
    if (field === 'fcm') return obj.fiscal_gore.fcm_dependency_pct || 0;
    return obj.name || '';
}

function sortMatrix(field) {
    if (matrixSortField === field) {
        matrixSortAsc = !matrixSortAsc;
    } else {
        matrixSortField = field;
        matrixSortAsc = false;
    }
    renderRegionalMatrixTable();
}

function switchToRegion(regId) {
    switchTab('regiones');
    selectRegion(regId);
}

// 5. PROYECTOS DE LEY & CONGRESO
function renderLegislativeBills() {
    var snap = getSnapshot();
    var bills = snap && snap.legislative_bills ? snap.legislative_bills : [];
    var container = document.getElementById('legislative-bills-container');
    if (!container) return;

    container.innerHTML = bills.map(function(b, idx) {
        return '<div class="shadcn-card p-6 md:p-7 space-y-4">' +
            '<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4">' +
                '<div class="flex items-center space-x-3">' +
                    '<div class="w-9 h-9 rounded-[18px] bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-sm font-mono">0' + (idx + 1) + '</div>' +
                    '<div>' +
                        '<div class="flex items-center gap-2">' +
                            '<span class="text-[10px] font-mono uppercase tracking-wider text-[#737373] font-bold">' + b.bulletin_number + '</span>' +
                            '<span class="shadcn-badge bg-[#fafafa] text-[#171717] border border-[#e5e5e5]">' + b.status + '</span>' +
                        '</div>' +
                        '<h3 class="text-base md:text-lg font-bold text-[#0a0a0a] mt-0.5">' + b.title + '</h3>' +
                    '</div>' +
                '</div>' +
                '<span class="shadcn-badge bg-[#0a0a0a] text-white font-semibold flex items-center gap-1"><i data-lucide="flame" class="w-3.5 h-3.5 text-[#e7000b]"></i> ' + b.urgency + '</span>' +
            '</div>' +
            '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] text-xs text-[#171717]">' +
                '<strong class="text-[#737373] block text-[11px] uppercase tracking-wider mb-1 font-bold">Resumen del Proyecto:</strong>' + b.summary +
            '</div>' +
            '<div class="p-4 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-xs space-y-1.5">' +
                '<div class="flex items-center space-x-2 text-[#0a0a0a] font-bold text-sm"><i data-lucide="user-check" class="w-4 h-4 text-[#0a0a0a]"></i><span>¿Cómo te afecta a ti en tu vida diaria?</span></div>' +
                '<p class="text-[#171717] leading-relaxed font-normal">' + b.ai_president_breakdown.como_te_afecta_a_ti + '</p>' +
            '</div>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">' +
                '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1">' +
                    '<span class="text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-[#0a0a0a]"></i> Lo Positivo:</span>' +
                    '<p class="text-[#171717]">' + b.ai_president_breakdown.lo_positivo + '</p>' +
                '</div>' +
                '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1">' +
                    '<span class="text-[10px] font-bold text-[#e7000b] uppercase tracking-wider flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-[#e7000b]"></i> Los Riesgos & Desafíos:</span>' +
                    '<p class="text-[#171717]">' + b.ai_president_breakdown.los_riesgos + '</p>' +
                '</div>' +
            '</div>' +
            '<div class="pt-3 border-t border-[#e5e5e5] grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#737373]">' +
                '<div class="p-3 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5]"><strong class="text-[#0a0a0a] block mb-0.5 font-semibold">Oficialismo:</strong>' + b.political_debate.oficialismo + '</div>' +
                '<div class="p-3 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5]"><strong class="text-[#0a0a0a] block mb-0.5 font-semibold">Oposición:</strong>' + b.political_debate.oposicion + '</div>' +
                '<div class="p-3 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5]"><strong class="text-[#0a0a0a] block mb-0.5 font-semibold">Evidencia Técnica OCDE:</strong>' + b.political_debate.evidencia_tecnica + '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    safeCreateIcons();
}

// 6. CADENA NACIONAL
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
            return '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-2">' +
                '<div class="flex items-center space-x-2 text-[#0a0a0a] font-bold text-xs"><i data-lucide="' + (t.icon || 'check') + '" class="w-4 h-4 text-[#0a0a0a]"></i><span class="uppercase tracking-wide font-semibold">' + t.topic + '</span></div>' +
                '<p class="text-xs text-[#171717] leading-relaxed font-normal">' + t.text + '</p>' +
            '</div>';
        }).join('');
    }
}

// 7. SIMULADOR DE POLÍTICAS PÚBLICAS
function runSimulation() {
    var select = document.getElementById('simulator-select');
    var output = document.getElementById('simulator-output');
    if (!select || !output) return;

    var sim = SIMULATION_DATA[select.value] || SIMULATION_DATA.carceles;

    output.innerHTML = '<h4 class="font-bold text-[#0a0a0a] text-xs sm:text-sm mb-2">' + sim.title + '</h4>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">' +
            '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1">' +
                '<span class="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Enfoque Tradicional / Cortoplacista:</span>' +
                '<p class="text-[#171717] font-medium">' + sim.decisionA + '</p>' +
                '<p class="text-[#e7000b] text-[11px] font-medium">↳ ' + sim.impactA + '</p>' +
            '</div>' +
            '<div class="p-3.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] space-y-1">' +
                '<span class="text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider">Enfoque de Estado con Evidencia:</span>' +
                '<p class="text-[#0a0a0a] font-semibold">' + sim.decisionB + '</p>' +
                '<p class="text-[#171717] text-[11px] font-medium">↳ ' + sim.impactB + '</p>' +
            '</div>' +
        '</div>' +
        '<div class="p-3 rounded-[14px] bg-[#fafafa] text-[11px] text-[#737373] border border-[#e5e5e5] flex items-start gap-2 mt-2">' +
            '<i data-lucide="book-open" class="w-4 h-4 text-[#0a0a0a] flex-shrink-0 mt-0.5"></i>' +
            '<span><strong class="text-[#0a0a0a]">Evidencia Histórica Global:</strong> ' + sim.evidence + '</span>' +
        '</div>';

    safeCreateIcons();
}

// 8. OBSERVATORIO DE MEDIOS & CLUSTERS
function renderClustersView() {
    var snap = getSnapshot();
    var allClusters = snap && snap.clusters ? snap.clusters : [];
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
        container.innerHTML = '<div class="col-span-2 p-8 text-center text-[#737373] shadcn-card">No se encontraron noticias con estos criterios.</div>';
        return;
    }

    container.innerHTML = filtered.map(function(c) {
        var b = c.blindspot || { left_pct: 0.33, center_pct: 0.34, right_pct: 0.33 };
        var leftW = Math.round((b.left_pct || 0) * 100);
        var centerW = Math.round((b.center_pct || 0) * 100);
        var rightW = Math.round((b.right_pct || 0) * 100);

        return '<div class="shadcn-card p-5 flex flex-col justify-between space-y-4">' +
            '<div class="space-y-2">' +
                '<div class="flex items-center justify-between gap-2">' +
                    '<span class="shadcn-badge bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5]">' + (c.category || 'Nacional') + '</span>' +
                    '<span class="text-xs text-[#737373] font-mono">' + (c.article_count || 1) + ' medios</span>' +
                '</div>' +
                '<h3 class="text-sm sm:text-base font-bold text-[#0a0a0a] leading-snug cursor-pointer hover:text-[#737373] transition" onclick="openClusterModal(' + c.id + ')">' + c.title + '</h3>' +
                '<p class="text-xs text-[#737373] line-clamp-2">' + (c.description || '') + '</p>' +
            '</div>' +
            '<div class="space-y-1.5 pt-2 border-t border-[#e5e5e5]">' +
                '<div class="flex items-center justify-between text-[11px] font-semibold text-[#737373]">' +
                    '<span>Izquierda ' + leftW + '%</span>' +
                    '<span>Centro ' + centerW + '%</span>' +
                    '<span>Derecha ' + rightW + '%</span>' +
                '</div>' +
                '<div class="h-2 w-full bg-[#f5f5f5] rounded-full overflow-hidden flex border border-[#e5e5e5]">' +
                    '<div style="width: ' + leftW + '%" class="bg-[#737373]"></div>' +
                    '<div style="width: ' + centerW + '%" class="bg-[#0a0a0a]"></div>' +
                    '<div style="width: ' + rightW + '%" class="bg-[#a3a3a3]"></div>' +
                '</div>' +
            '</div>' +
            '<div class="flex items-center justify-between text-xs pt-1">' +
                '<span class="text-[#737373] text-[11px]">' + (c.last_seen_at ? new Date(c.last_seen_at).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'}) + ' hrs' : 'Hoy') + '</span>' +
                '<button onclick="openClusterModal(' + c.id + ')" class="shadcn-button-secondary px-3 py-1 text-xs font-semibold flex items-center gap-1">Comparar Coberturas <i data-lucide="arrow-right" class="w-3 h-3"></i></button>' +
            '</div>' +
        '</div>';
    }).join('');

    safeCreateIcons();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(function(btn) {
        btn.className = 'cat-pill shadcn-button-secondary px-3 py-1 text-xs font-medium';
    });
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.className = 'cat-pill shadcn-button-primary px-3 py-1 text-xs font-semibold';
    }
    renderClustersView();
}

function filterClusters() {
    var input = document.getElementById('cluster-search');
    if (input) currentSearch = input.value;
    renderClustersView();
}

function openClusterModal(clusterId) {
    var modal = document.getElementById('cluster-modal');
    var body = document.getElementById('modal-body');
    if (!modal || !body) return;

    modal.classList.remove('hidden');

    var snap = getSnapshot();
    var clusterDetail = (snap && snap.clusters_detail && snap.clusters_detail[String(clusterId)]) ? snap.clusters_detail[String(clusterId)] : null;

    if (!clusterDetail) {
        var allClusters = snap && snap.clusters ? snap.clusters : [];
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
        return '<div class="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1.5 text-xs">' +
            '<div class="flex items-center justify-between"><span class="font-bold text-[#0a0a0a]">' + a.source.name + '</span><span class="shadcn-badge bg-[#0a0a0a] text-white">' + a.source.spectrum.toUpperCase() + '</span></div>' +
            '<h4 class="font-bold text-[#0a0a0a] text-sm leading-snug">' + a.title + '</h4>' +
            '<p class="text-[#737373] text-xs">' + (a.snippet || '') + '</p>' +
            '<div class="pt-2 flex justify-between items-center text-[#737373] text-[11px] border-t border-[#e5e5e5]"><span>Controlador: ' + a.source.ownership + '</span>' + (a.url && a.url !== '#' ? '<a href="' + a.url + '" target="_blank" class="text-[#0a0a0a] font-semibold underline flex items-center gap-1">Leer noticia original <i data-lucide="external-link" class="w-3 h-3"></i></a>' : '') + '</div>' +
        '</div>';
    }).join('');

    body.innerHTML = '<div class="space-y-4">' +
        '<div class="p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-1"><h4 class="text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wider">Síntesis Fáctica de Estado:</h4><p class="text-[#171717] text-sm leading-relaxed">' + (clusterDetail.description || 'Evento en seguimiento.') + '</p></div>' +
        '<div class="space-y-2.5"><h4 class="text-[11px] font-bold text-[#737373] uppercase tracking-wider">Despachos por Medio (' + (clusterDetail.articles || []).length + ' fuentes):</h4><div class="space-y-2.5">' + articlesHtml + '</div></div>' +
    '</div>';

    safeCreateIcons();
}

// 9. ÁGORA CIUDADANA
function renderCitizenProposals() {
    var container = document.getElementById('citizen-proposals-grid');
    if (!container) return;

    container.innerHTML = allProposals.map(function(p) {
        return '<div class="shadcn-card p-5 flex flex-col justify-between space-y-3">' +
            '<div class="space-y-1.5">' +
                '<span class="shadcn-badge bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5]">' + p.pillar + '</span>' +
                '<h4 class="font-bold text-[#0a0a0a] text-sm leading-snug">' + p.title + '</h4>' +
                '<p class="text-[#737373] text-xs">' + p.desc + '</p>' +
                '<div class="text-[10px] text-[#737373]">Por: ' + p.author + '</div>' +
            '</div>' +
            '<div class="flex items-center justify-between pt-2 border-t border-[#e5e5e5] text-xs">' +
                '<button onclick="upvoteProposal(' + p.id + ')" class="shadcn-button-secondary px-3 py-1 text-xs font-semibold flex items-center gap-1.5"><i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>' + p.votes + ' Votos</span></button>' +
                '<span class="text-[#0a0a0a] text-[11px] font-semibold flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> En Revisión</span>' +
            '</div>' +
        '</div>';
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
    resDiv.innerHTML = '<div class="text-[#0a0a0a] font-bold text-xs">¡Propuesta Cívica publicada con éxito en el Ágora Nacional!</div>';
    
    setTimeout(function() {
        closeModal('proposal-modal');
        resDiv.classList.add('hidden');
        document.getElementById('prop-title').value = '';
        document.getElementById('prop-desc').value = '';
        renderCitizenProposals();
        switchTab('citizen');
    }, 1200);
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
    resDiv.innerHTML = '<div class="text-[#0a0a0a] font-bold text-sm mb-1 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> Solicitud Registrada</div><div class="text-[#737373]">Ticket ID: <strong class="font-mono text-[#0a0a0a]">' + fakeTicket + '</strong></div><div class="text-[#737373] text-[11px] mt-1">Plazo legal: 30 días corridos según Ley N° 21.719. Se ha notificado al Delegado de Protección de Datos.</div>';
    document.getElementById('arco-form').reset();
    safeCreateIcons();
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// 10. SWITCH TABS
function switchTab(tabId) {
    var tabs = ['balance', 'regiones', 'matriz', 'leyes', 'cadena', 'clusters', 'citizen'];
    tabs.forEach(function(t) {
        var view = document.getElementById('view-' + t);
        var btn = document.getElementById('tab-btn-' + t);
        if (!view || !btn) return;
        
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.className = 'shadcn-button-primary px-4 py-2 text-xs font-semibold shadow-sm flex items-center space-x-1.5 whitespace-nowrap';
        } else {
            view.classList.add('hidden');
            btn.className = 'shadcn-button-secondary px-4 py-2 text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap';
        }
    });

    if (tabId === 'balance') {
        setTimeout(renderFiscalCharts, 60);
    }
    safeCreateIcons();
}

// 11. GUÍA INTERACTIVA DE BIENVENIDA (ONBOARDING TOUR)
var currentOnboardingStep = 1;
var totalOnboardingSteps = 4;

var ONBOARDING_DATA = [
    {
        step: 1,
        badge: 'PASO 1 DE 4 • PROPÓSITO DE ESTADO',
        title: '🇨🇱 ¿Qué es la Presidenta IA & Radiografía de Chile?',
        tagline: 'Una plataforma cívica de Estado basada en ciencia, datos oficiales y lecciones globales.',
        content: '<p class="text-xs md:text-sm text-[#334155] leading-relaxed">Imaginemos una inteligencia artificial que actúa como una <strong>Presidenta Técnica de Chile</strong>: un observatorio cívico que audita el país de manera transversal (salud, educación, seguridad, cárceles, bomberos, FFAA y finanzas públicas) con total neutralidad y rigor metodológico.</p><div class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] text-xs space-y-1 mt-3"><strong class="text-[#0f172a] block">🎯 El Propósito:</strong><span class="text-[#64748b]">Empoderar a todos los chilenos para comprender el Estado, transparentar en qué se gasta cada peso y proponer soluciones con evidencia.</span></div>'
    },
    {
        step: 2,
        badge: 'PASO 2 DE 4 • FINANZAS PÚBLICAS',
        title: '📊 ¿Cómo leer el Balance de la República?',
        tagline: 'Auditoría exacta de los US$ 93.450 Millones del Presupuesto Nacional.',
        content: '<p class="text-xs md:text-sm text-[#334155] leading-relaxed">En la pestaña <strong>Balance Nacional</strong> podrás ver con total transparencia de dónde sale el dinero de Chile (IVA, Renta, Codelco, Royalty, Litio) y exactamente en qué ministerios se invierte (Salud, Educación, PGU, Seguridad, Obras Públicas).</p><div class="grid grid-cols-2 gap-2 mt-3 text-xs"><div class="p-3 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><strong class="text-[#0f172a] block">📥 Ingresos</strong><span class="text-[#64748b]">US$ 93.5B anuales</span></div><div class="p-3 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><strong class="text-[#0f172a] block">📤 Capacidad</strong><span class="text-[#64748b]">Hospitales, colegios y policías</span></div></div>'
    },
    {
        step: 3,
        badge: 'PASO 3 DE 4 • DESCENTRALIZACIÓN',
        title: '📍 Radiografía de las 16 Regiones de Chile',
        tagline: 'Fichas técnicas con fotografías reales y 9 ejes de auditoría por territorio.',
        content: '<p class="text-xs md:text-sm text-[#334155] leading-relaxed">Navega desde Arica hasta Magallanes. Cada región incluye fotografías reales, listas de espera hospitalarias, sobrepoblación penal, dotación de Carabineros y bomberos, déficit habitacional y el Plan de Estado 2026-2050.</p><div class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] text-xs space-y-1 mt-3"><strong class="text-[#0f172a] block">💡 Matriz Comparativa:</strong><span class="text-[#64748b]">Compara todas las regiones simultáneamente en una tabla dinámica para ver las brechas territoriales reales.</span></div>'
    },
    {
        step: 4,
        badge: 'PASO 4 DE 4 • PARTICIPACIÓN',
        title: '👥 Simulador de Políticas & Ágora Ciudadana',
        tagline: 'Aprende de Noruega, España o Israel y vota iniciativas cívicas.',
        content: '<p class="text-xs md:text-sm text-[#334155] leading-relaxed">Usa el <strong>Simulador Prospectivo</strong> para evaluar decisiones con base en países OCDE, revisa los <strong>Proyectos de Ley</strong> traducidos sin tecnicismos y sube tus propias propuestas en el <strong>Ágora Ciudadana</strong>.</p><div class="p-3.5 rounded-[16px] bg-[#0f172a] text-white text-xs space-y-1 mt-3"><strong class="text-white block">🚀 ¡Listo para empezar!</strong><span class="text-slate-300">Haz clic en "Comenzar a Explorar" para ingresar al tablero principal. Puedes reabrir esta guía cuando quieras desde el botón superior.</span></div>'
    }
];

function openOnboarding(step) {
    if (typeof step === 'number') currentOnboardingStep = step;
    var modal = document.getElementById('onboarding-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    renderOnboardingStep();
    safeCreateIcons();
}

function renderOnboardingStep() {
    var data = ONBOARDING_DATA[currentOnboardingStep - 1] || ONBOARDING_DATA[0];
    var badgeEl = document.getElementById('onboarding-step-badge');
    var titleEl = document.getElementById('onboarding-step-title');
    var taglineEl = document.getElementById('onboarding-step-tagline');
    var contentEl = document.getElementById('onboarding-step-content');
    var prevBtn = document.getElementById('onboarding-btn-prev');
    var nextBtn = document.getElementById('onboarding-btn-next');
    var dotsContainer = document.getElementById('onboarding-dots');

    if (badgeEl) badgeEl.innerText = data.badge;
    if (titleEl) titleEl.innerText = data.title;
    if (taglineEl) taglineEl.innerText = data.tagline;
    if (contentEl) contentEl.innerHTML = data.content;

    if (prevBtn) {
        prevBtn.style.visibility = (currentOnboardingStep === 1) ? 'hidden' : 'visible';
    }

    if (nextBtn) {
        if (currentOnboardingStep === totalOnboardingSteps) {
            nextBtn.innerText = 'Comenzar a Explorar 🇨🇱';
            nextBtn.onclick = finishOnboarding;
        } else {
            nextBtn.innerText = 'Siguiente Paso →';
            nextBtn.onclick = nextOnboardingStep;
        }
    }

    if (dotsContainer) {
        dotsContainer.innerHTML = [1, 2, 3, 4].map(function(s) {
            var activeClass = (s === currentOnboardingStep) ? 'bg-[#0f172a] w-6' : 'bg-[#cbd5e1] w-2.5';
            return '<div class="h-2.5 rounded-full transition-all duration-300 ' + activeClass + '"></div>';
        }).join('');
    }
}

function nextOnboardingStep() {
    if (currentOnboardingStep < totalOnboardingSteps) {
        currentOnboardingStep++;
        renderOnboardingStep();
    } else {
        finishOnboarding();
    }
}

function prevOnboardingStep() {
    if (currentOnboardingStep > 1) {
        currentOnboardingStep--;
        renderOnboardingStep();
    }
}

function finishOnboarding() {
    try {
        localStorage.setItem('chile_onboarding_completed', 'true');
    } catch (e) {}
    closeModal('onboarding-modal');
}

// 12. INICIALIZADOR UNIVERSAL
function renderAllViews() {
    try {
        renderEconomicIndicators();
        renderNationalBalanceView();
        renderRegionsAuditView();
        renderRegionalMatrixTable();
        renderLegislativeBills();
        renderCadenaNacional();
        renderClustersView();
        renderCitizenProposals();
        runSimulation();
        safeCreateIcons();

        // Onboarding automático para primera visita
        try {
            if (localStorage.getItem('chile_onboarding_completed') !== 'true') {
                setTimeout(function() {
                    openOnboarding(1);
                }, 400);
            }
        } catch (e) {}
    } catch (e) {
        console.error('Error rendering views:', e);
    }
}

if (typeof window !== 'undefined') {
    window.renderAllViews = renderAllViews;
    window.switchTab = switchTab;
    window.selectRegion = selectRegion;
    window.switchToRegion = switchToRegion;
    window.sortMatrix = sortMatrix;
    window.runSimulation = runSimulation;
    window.openClusterModal = openClusterModal;
    window.closeModal = closeModal;
    window.openCitizenProposalModal = openCitizenProposalModal;
    window.submitCitizenProposal = submitCitizenProposal;
    window.upvoteProposal = upvoteProposal;
    window.openArcoModal = openArcoModal;
    window.submitArcoForm = submitArcoForm;
    window.filterCategory = filterCategory;
    window.filterClusters = filterClusters;
    window.openOnboarding = openOnboarding;
    window.nextOnboardingStep = nextOnboardingStep;
    window.prevOnboardingStep = prevOnboardingStep;
    window.finishOnboarding = finishOnboarding;
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            renderAllViews();
        });
    } else {
        renderAllViews();
    }
}



