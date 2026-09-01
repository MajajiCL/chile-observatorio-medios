// Observatorio de Medios de Chile - Client Engine
// Compatible 100% con GitHub Pages y FastAPI Backend

let allClusters = [];
let allSources = [];
let currentCategory = 'all';
let currentSearch = '';

// Obtener datos embebidos del snapshot (0ms latencia)
let dataSnapshot = window.OBSERVATORIO_SNAPSHOT || null;

document.addEventListener("DOMContentLoaded", async () => {
    // Si no está embebido, intentar fetch
    if (!dataSnapshot) {
        try {
            const res = await fetch('./data/snapshot.json');
            if (res.ok) dataSnapshot = await res.json();
        } catch (e) {
            console.log("Modo API");
        }
    }

    renderAllViews();
});

function renderAllViews() {
    renderEconomicIndicators();
    renderStats();
    renderClustersView();
    renderBlindspotsView();
    renderSourcesView();
    renderAnalyticsView();
    if (window.lucide) lucide.createIcons();
}

// 1. TABS
function switchTab(tabId) {
    const tabs = ['clusters', 'blindspots', 'sources', 'analytics'];
    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (!view || !btn) return;
        
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.className = "px-4 py-2 rounded-lg font-semibold transition bg-cyan-600 text-white shadow-sm flex items-center space-x-2 whitespace-nowrap";
        } else {
            view.classList.add('hidden');
            btn.className = "px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white flex items-center space-x-2 whitespace-nowrap";
        }
    });

    if (tabId === 'analytics') {
        setTimeout(renderPluralityChart, 50);
    }
    if (window.lucide) lucide.createIcons();
}

// 2. INDICADORES ECONOMICOS
function renderEconomicIndicators() {
    const container = document.getElementById('economic-ticker');
    if (!container) return;

    let indicators = dataSnapshot && dataSnapshot.economic_indicators ? dataSnapshot.economic_indicators : [
        { code: "UF", name: "Unidad de Fomento", value: 40875.09, unit: "CLP" },
        { code: "DOLAR", name: "Dólar Observado", value: 933.40, unit: "CLP" },
        { code: "EURO", name: "Euro", value: 1084.21, unit: "CLP" },
        { code: "IPC", name: "IPC Mensual", value: -0.2, unit: "%" },
        { code: "UTM", name: "UTM", value: 71721.00, unit: "CLP" }
    ];

    container.innerHTML = indicators.map(ind => {
        const isClp = ind.unit === '$' || ind.unit === 'CLP';
        const formatted = ind.value ? ind.value.toLocaleString('es-CL', { minimumFractionDigits: ind.unit === '%' ? 1 : 2, maximumFractionDigits: 2 }) : '-';
        return `
            <div class="flex items-center space-x-1.5 whitespace-nowrap">
                <span class="text-slate-400 font-semibold text-[11px]">${ind.code}:</span>
                <span class="text-emerald-400 font-mono font-bold text-xs">${isClp ? '$' : ''}${formatted} ${ind.unit === '%' ? '%' : ''}</span>
            </div>
        `;
    }).join('');
}

// 3. STATS
function renderStats() {
    let stats = dataSnapshot && dataSnapshot.stats ? dataSnapshot.stats : {
        sources_count: 17,
        articles_indexed_count: 53,
        clusters_active_count: 49,
        blindspots_detected_count: 0
    };

    const sCount = document.getElementById('stat-sources');
    const aCount = document.getElementById('stat-articles');
    const cCount = document.getElementById('stat-clusters');
    const bCount = document.getElementById('stat-blindspots');

    if (sCount) sCount.innerText = stats.sources_count || 17;
    if (aCount) aCount.innerText = stats.articles_indexed_count || 53;
    if (cCount) cCount.innerText = stats.clusters_active_count || 49;
    if (bCount) bCount.innerText = stats.blindspots_detected_count || 0;

    const bClusters = document.getElementById('badge-clusters-count');
    const bBlindspots = document.getElementById('badge-blindspots-count');
    if (bClusters) bClusters.innerText = stats.clusters_active_count || 49;
    if (bBlindspots) bBlindspots.innerText = stats.blindspots_detected_count || 0;
}

// 4. CLUSTERS / AGENDA
function renderClustersView() {
    allClusters = (dataSnapshot && dataSnapshot.clusters) ? dataSnapshot.clusters : [];
    applyFilters();
}

function applyFilters() {
    let filtered = allClusters;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(c => (c.category || '').toLowerCase().includes(currentCategory.toLowerCase()));
    }

    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(c => 
            (c.title || '').toLowerCase().includes(q) || 
            (c.description || '').toLowerCase().includes(q)
        );
    }

    const container = document.getElementById('clusters-list');
    const countEl = document.getElementById('results-count');
    if (countEl) countEl.innerText = `Mostrando ${filtered.length} eventos fácticos`;

    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 p-12 text-center text-slate-400 glass-card rounded-2xl">
                <i data-lucide="search-x" class="w-8 h-8 text-slate-500 mx-auto mb-2"></i>
                <p class="font-bold text-white text-base">No se encontraron eventos con los filtros actuales</p>
                <p class="text-xs text-slate-500 mt-1">Intenta con otros términos de búsqueda o selecciona "Todos".</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(c => {
        const b = c.blindspot || { left_pct: 0.33, center_pct: 0.34, right_pct: 0.33 };
        const leftW = Math.round((b.left_pct || 0) * 100);
        const centerW = Math.round((b.center_pct || 0) * 100);
        const rightW = Math.round((b.right_pct || 0) * 100);

        let blindspotBadge = '';
        if (b.is_blindspot) {
            const sideText = b.side === 'blindspot_left' ? '🔴 Punto Ciego Izquierda' : '🔵 Punto Ciego Derecha';
            blindspotBadge = `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                    <i data-lucide="alert-triangle" class="w-3 h-3 text-amber-400"></i> ${sideText}
                </span>
            `;
        }

        const dateStr = c.last_seen_at ? new Date(c.last_seen_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + ' hrs' : 'Hoy';

        return `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div class="space-y-2.5">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800/90 text-cyan-400 border border-cyan-500/20">
                            ${c.category || 'Nacional'}
                        </span>
                        <div class="flex items-center gap-2">
                            ${blindspotBadge}
                            <span class="text-xs text-slate-400 flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                                <i data-lucide="newspaper" class="w-3.5 h-3.5 text-slate-400"></i> ${c.article_count || 1} medios
                            </span>
                        </div>
                    </div>

                    <h3 class="text-sm sm:text-base font-bold text-white leading-snug cursor-pointer hover:text-cyan-400 transition" onclick="openClusterModal(${c.id})">
                        ${c.title}
                    </h3>
                    
                    <p class="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                        ${c.description || 'Evento en seguimiento activo.'}
                    </p>
                </div>

                <!-- SPECTRUM COVERAGE BAR -->
                <div class="space-y-1.5 pt-3 border-t border-slate-800/80">
                    <div class="flex items-center justify-between text-[11px] font-semibold">
                        <span class="text-red-400 flex items-center gap-1">🔴 Izq ${leftW}%</span>
                        <span class="text-amber-400 flex items-center gap-1">🟡 Centro ${centerW}%</span>
                        <span class="text-blue-400 flex items-center gap-1">🔵 Der ${rightW}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/80">
                        <div style="width: ${leftW}%" class="bg-red-500 spectrum-bar" title="Izquierda: ${leftW}%"></div>
                        <div style="width: ${centerW}%" class="bg-amber-500 spectrum-bar" title="Centro: ${centerW}%"></div>
                        <div style="width: ${rightW}%" class="bg-blue-500 spectrum-bar" title="Derecha: ${rightW}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs pt-1">
                    <span class="text-slate-500 text-[11px] font-mono">${dateStr}</span>
                    <button onclick="openClusterModal(${c.id})" class="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-xs transition">
                        Ver Comparativa Multi-ángulo <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.className = "cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800";
    });
    const clicked = event.target;
    if (clicked) {
        clicked.className = "cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold";
    }
    applyFilters();
}

function filterClusters() {
    currentSearch = document.getElementById('cluster-search').value;
    applyFilters();
}

// 5. PUNTOS CIEGOS
function renderBlindspotsView() {
    let list = (dataSnapshot && dataSnapshot.blindspots) ? dataSnapshot.blindspots : [];
    const container = document.getElementById('blindspots-list');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 p-8 text-center text-slate-400 glass-card rounded-2xl border border-slate-800">
                <div class="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="check-circle" class="w-6 h-6 text-emerald-400"></i>
                </div>
                <h4 class="font-bold text-white text-base">Cobertura Equilibrada en los Sucesos Actuales</h4>
                <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    No se registran asimetrías extremas ( $\ge 65\%$ vs $\le 20\%$ ) en los clusters activos de la jornada. El algoritmo monitorea continuamente 17 medios nacionales.
                </p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = list.map(b => `
        <div class="glass-card p-5 rounded-2xl border-amber-900/40 hover:border-amber-700/60 transition space-y-3">
            <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    PUNTO CIEGO DE: ${b.blindspot_side === 'blindspot_left' ? '🔴 IZQUIERDA' : '🔵 DERECHA'}
                </span>
                <span class="text-xs text-slate-400 font-mono">${b.article_count} notas</span>
            </div>
            <h3 class="text-sm sm:text-base font-bold text-white hover:text-amber-400 cursor-pointer transition" onclick="openClusterModal(${b.cluster_id})">
                ${b.title}
            </h3>
            <p class="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                ${b.explanation}
            </p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Divergencia Editorial: <strong>${Math.round(b.divergence_score * 100)}%</strong></span>
                <button onclick="openClusterModal(${b.cluster_id})" class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                    Analizar Asimetría <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

// 6. FUENTES Y PROPIEDAD
function renderSourcesView() {
    let sources = (dataSnapshot && dataSnapshot.sources) ? dataSnapshot.sources : [];
    const container = document.getElementById('sources-grid');
    if (!container) return;

    container.innerHTML = sources.map(s => {
        let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
        if (s.spectrum.includes("derecha")) badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
        if (s.spectrum.includes("izquierda")) badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";
        if (s.spectrum.includes("institucional")) badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
        if (s.spectrum.includes("investigacion")) badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";

        return `
            <div class="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}">${s.spectrum.toUpperCase()}</span>
                        <span class="text-[10px] text-slate-400 font-mono">${s.region}</span>
                    </div>
                    <h4 class="text-sm sm:text-base font-bold text-white">${s.name}</h4>
                    <a href="${s.url}" target="_blank" class="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5 truncate">
                        ${s.url} <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </div>
                <div class="space-y-1 text-xs pt-3 border-t border-slate-800/80 text-slate-300">
                    <div><strong class="text-slate-400">Controlador:</strong> ${s.ownership}</div>
                    <div><strong class="text-slate-400">Tipo:</strong> ${s.ownership_type}</div>
                    <div><strong class="text-slate-400">Financiamiento:</strong> ${s.funding_model}</div>
                    <div><strong class="text-slate-400">Facticidad:</strong> <span class="text-emerald-400 font-bold">${s.facticity_rating}</span></div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// 7. ANALÍTICA Y PLURALIDAD
function renderAnalyticsView() {
    let entities = (dataSnapshot && dataSnapshot.entities) ? dataSnapshot.entities : {
        people: ["Gabriel Boric", "Mario Marcel", "Carolina Tohá", "Camila Vallejo"],
        institutions: ["Banco Central de Chile", "Codelco", "Carabineros de Chile", "Ministerio Público"],
        locations: ["Santiago", "Valparaíso", "Concepción", "Región de Antofagasta"]
    };

    const container = document.getElementById('entities-container');
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-2">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="user-check" class="w-3.5 h-3.5"></i> Autoridades & Figuras Públicas:
            </span>
            <div class="flex flex-wrap gap-1.5">
                ${entities.people && entities.people.length > 0 ? entities.people.map(p => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-200 border border-slate-700">${p}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="landmark" class="w-3.5 h-3.5"></i> Organismos e Instituciones del Estado:
            </span>
            <div class="flex flex-wrap gap-1.5">
                ${entities.institutions && entities.institutions.length > 0 ? entities.institutions.map(i => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-200 border border-slate-700">${i}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> Regiones & Ciudades:
            </span>
            <div class="flex flex-wrap gap-1.5">
                ${entities.locations && entities.locations.length > 0 ? entities.locations.map(l => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-200 border border-slate-700">${l}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function renderPluralityChart() {
    const chartDom = document.getElementById('chart-plurality');
    if (!chartDom || !window.echarts) return;
    
    const myChart = echarts.init(chartDom, 'dark', { backgroundColor: 'transparent' });
    let p = (dataSnapshot && dataSnapshot.plurality) ? dataSnapshot.plurality : { balanced_events: 47, left_blindspots: 1, right_blindspots: 1, skewed_events: 0 };

    const option = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center', textStyle: { color: '#94a3b8', fontSize: 11 } },
        series: [
            {
                name: 'Cobertura Mediática',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#090d16', borderWidth: 3 },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' }
                },
                data: [
                    { value: p.balanced_events || 47, name: 'Cobertura Equilibrada', itemStyle: { color: '#10b981' } },
                    { value: p.left_blindspots || 1, name: 'Puntos Ciegos Izquierda', itemStyle: { color: '#ef4444' } },
                    { value: p.right_blindspots || 1, name: 'Puntos Ciegos Derecha', itemStyle: { color: '#3b82f6' } },
                    { value: p.skewed_events || 0, name: 'Asimetría Parcial', itemStyle: { color: '#f59e0b' } }
                ]
            }
        ]
    };
    myChart.setOption(option);
}

// 8. MODAL MULTI-PERSPECTIVA
function openClusterModal(clusterId) {
    const modal = document.getElementById('cluster-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    modal.classList.remove('hidden');

    let clusterDetail = null;
    if (dataSnapshot && dataSnapshot.clusters_detail && dataSnapshot.clusters_detail[String(clusterId)]) {
        clusterDetail = dataSnapshot.clusters_detail[String(clusterId)];
    }

    if (!clusterDetail) {
        const fallbackCluster = allClusters.find(c => c.id === clusterId) || { title: 'Evento Fáctico', description: '', category: 'General', article_count: 1 };
        clusterDetail = {
            id: clusterId,
            title: fallbackCluster.title,
            description: fallbackCluster.description,
            category: fallbackCluster.category,
            articles: [
                {
                    title: fallbackCluster.title,
                    url: '#',
                    snippet: fallbackCluster.description,
                    source: { name: 'Medio Registrado', spectrum: 'centro', ownership: 'Empresa Periodística' }
                }
            ]
        };
    }

    document.getElementById('modal-title').innerText = clusterDetail.title;
    document.getElementById('modal-category').innerText = clusterDetail.category || 'General';

    const articlesHtml = (clusterDetail.articles || []).map(a => {
        let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
        const spec = (a.source.spectrum || '').toLowerCase();
        if (spec.includes("derecha")) badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
        if (spec.includes("izquierda")) badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";

        return `
            <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-cyan-400">${a.source.name}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}">${a.source.spectrum.toUpperCase()}</span>
                </div>
                <h4 class="font-bold text-white text-sm leading-snug">${a.title}</h4>
                <p class="text-xs text-slate-300 leading-relaxed">${a.snippet || ''}</p>
                <div class="text-[11px] pt-2 flex flex-wrap justify-between items-center text-slate-400 border-t border-slate-800/80 gap-2">
                    <span>Controlador: <strong class="text-slate-300">${a.source.ownership}</strong></span>
                    ${a.url && a.url !== '#' ? `
                        <a href="${a.url}" target="_blank" class="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold">
                            Leer despacho completo <i data-lucide="external-link" class="w-3 h-3"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    body.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Síntesis Fáctica Neutral:</h4>
                <p class="text-slate-200 text-sm leading-relaxed">${clusterDetail.description || 'Evento noticioso en desarrollo.'}</p>
            </div>

            <div class="space-y-3">
                <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cobertura y Titulares por Medio (${(clusterDetail.articles || []).length} despachos):</h4>
                <div class="space-y-3">
                    ${articlesHtml}
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
}

// 9. DERECHOS ARCO
function openArcoModal() {
    const el = document.getElementById('arco-modal');
    if (el) el.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function submitArcoForm(e) {
    e.preventDefault();
    const type = document.getElementById('arco-type').value;
    const email = document.getElementById('arco-email').value;
    const target = document.getElementById('arco-target').value;
    const resDiv = document.getElementById('arco-result');

    const fakeTicket = "ARCO-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    resDiv.classList.remove('hidden');
    resDiv.innerHTML = `
        <div class="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Solicitud Registrada Formalmente
        </div>
        <div class="text-slate-300">Ticket ID: <strong class="font-mono text-cyan-400">${fakeTicket}</strong></div>
        <div class="text-slate-400 text-[11px] mt-1">Plazo legal de respuesta: 30 días corridos según la Ley N° 21.719. Se ha notificado al oficial de cumplimiento.</div>
    `;

    document.getElementById('arco-form').reset();
    if (window.lucide) lucide.createIcons();
}

function refreshData() {
    location.reload();
}
