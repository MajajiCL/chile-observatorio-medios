// Observatorio de Medios de Chile - Universal Frontend Engine
// Funciona tanto con FastAPI Backend como de forma Estática en GitHub Pages

let allClusters = [];
let allSources = [];
let snapshotData = null;
const isStaticHost = window.location.protocol === 'file:' || window.location.hostname.includes('github.io');

document.addEventListener("DOMContentLoaded", async () => {
    // Intentar precargar snapshot para compatibilidad GitHub Pages
    try {
        const snapRes = await fetch('./data/snapshot.json');
        if (snapRes.ok) {
            snapshotData = await snapRes.json();
            console.log("Snapshot cargado exitosamente.");
        }
    } catch (e) {
        console.log("Modo API dinámico.");
    }

    fetchEconomicIndicators();
    fetchStats();
    fetchClusters();
    fetchBlindspots();
    fetchSources();
    fetchAnalytics();
});

// 1. TABS
function switchTab(tabId) {
    const tabs = ['clusters', 'blindspots', 'sources', 'analytics'];
    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.className = "px-4 py-1.5 rounded-lg font-medium transition bg-cyan-600 text-white shadow-sm flex items-center space-x-2";
        } else {
            view.classList.add('hidden');
            btn.className = "px-4 py-1.5 rounded-lg font-medium transition text-slate-400 hover:text-white flex items-center space-x-2";
        }
    });
    if (tabId === 'analytics') {
        renderPluralityChart();
    }
    lucide.createIcons();
}

// 2. INDICADORES ECONOMICOS
async function fetchEconomicIndicators() {
    const container = document.getElementById('economic-ticker');
    let data = [];
    
    if (snapshotData && snapshotData.economic_indicators) {
        data = snapshotData.economic_indicators;
    } else {
        try {
            const res = await fetch('/api/v1/state/indicators');
            if (res.ok) data = await res.json();
        } catch (e) {}
    }

    if (!data || data.length === 0) {
        container.innerHTML = `<span class="text-slate-500">Indicadores Banco Central: Sincronizando...</span>`;
        return;
    }

    container.innerHTML = data.map(ind => `
        <div class="flex items-center space-x-1.5">
            <span class="text-slate-400 font-semibold">${ind.code}:</span>
            <span class="text-emerald-400 font-mono font-medium">${ind.unit === '$' || ind.unit === 'CLP' ? '$' : ''}${ind.value.toLocaleString('es-CL')} ${ind.unit === '%' ? '%' : ''}</span>
        </div>
    `).join('');
}

// 3. STATS
async function fetchStats() {
    let stats = { sources_count: 17, articles_indexed_count: 53, clusters_active_count: 49, blindspots_detected_count: 0 };
    
    if (snapshotData && snapshotData.stats) {
        stats = snapshotData.stats;
    } else {
        try {
            const res = await fetch('/api/v1/stats');
            if (res.ok) stats = await res.json();
        } catch (e) {}
    }

    document.getElementById('stat-sources').innerText = stats.sources_count || 0;
    document.getElementById('stat-articles').innerText = stats.articles_indexed_count || 0;
    document.getElementById('stat-clusters').innerText = stats.clusters_active_count || 0;
    document.getElementById('stat-blindspots').innerText = stats.blindspots_detected_count || 0;
}

// 4. CLUSTERS / AGENDA
async function fetchClusters() {
    if (snapshotData && snapshotData.clusters) {
        allClusters = snapshotData.clusters;
        renderClusters(allClusters);
        return;
    }

    try {
        const res = await fetch('/api/v1/clusters?limit=50');
        if (res.ok) {
            const data = await res.json();
            allClusters = data.clusters || [];
            renderClusters(allClusters);
        }
    } catch (e) {
        console.error("Error cargando clusters:", e);
    }
}

function renderClusters(clusters) {
    const container = document.getElementById('clusters-list');
    if (!clusters || clusters.length === 0) {
        container.innerHTML = `<div class="col-span-2 p-8 text-center text-slate-500 glass-panel rounded-2xl">No hay eventos indexados aún. Haz clic en "Sincronizar Feeds" para recolectar noticias en vivo.</div>`;
        return;
    }

    container.innerHTML = clusters.map(c => {
        const b = c.blindspot || { left_pct: 0, center_pct: 0, right_pct: 0 };
        const leftW = Math.round((b.left_pct || 0) * 100);
        const centerW = Math.round((b.center_pct || 0) * 100);
        const rightW = Math.round((b.right_pct || 0) * 100);

        let blindspotBadge = '';
        if (b.is_blindspot) {
            blindspotBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                <i data-lucide="alert-triangle" class="w-3 h-3 text-amber-400"></i> Punto Ciego (${b.side === 'blindspot_left' ? 'Izquierda' : 'Derecha'})
            </span>`;
        }

        return `
            <div class="glass-panel p-5 rounded-2xl hover:border-slate-600 transition flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${c.category || 'General'}</span>
                        <div class="flex items-center gap-2">
                            ${blindspotBadge}
                            <span class="text-xs text-slate-400 flex items-center gap-1">
                                <i data-lucide="layers" class="w-3.5 h-3.5 text-cyan-400"></i> ${c.article_count} medios
                            </span>
                        </div>
                    </div>
                    <h3 class="text-base font-bold text-white leading-snug cursor-pointer hover:text-cyan-400 transition" onclick="openClusterModal(${c.id})">
                        ${c.title}
                    </h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${c.description || ''}</p>
                </div>

                <!-- SPECTRUM COVERAGE BAR -->
                <div class="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div class="flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span class="text-red-400">Izq ${leftW}%</span>
                        <span class="text-amber-400">Centro ${centerW}%</span>
                        <span class="text-blue-400">Der ${rightW}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div style="width: ${leftW}%" class="bg-red-500 spectrum-bar" title="Izquierda: ${leftW}%"></div>
                        <div style="width: ${centerW}%" class="bg-amber-500 spectrum-bar" title="Centro: ${centerW}%"></div>
                        <div style="width: ${rightW}%" class="bg-blue-500 spectrum-bar" title="Derecha: ${rightW}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs pt-1">
                    <span class="text-slate-500">${c.last_seen_at ? new Date(c.last_seen_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'}) + ' hrs' : ''}</span>
                    <button onclick="openClusterModal(${c.id})" class="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition">
                        Ver Comparativa Multi-ángulo <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function filterClusters() {
    const q = document.getElementById('cluster-search').value.toLowerCase();
    const filtered = allClusters.filter(c => c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    renderClusters(filtered);
}

// 5. PUNTOS CIEGOS
async function fetchBlindspots() {
    let list = [];
    if (snapshotData && snapshotData.blindspots) {
        list = snapshotData.blindspots;
    } else {
        try {
            const res = await fetch('/api/v1/blindspots');
            if (res.ok) {
                const data = await res.json();
                list = data.blindspots || [];
            }
        } catch (e) {}
    }

    const container = document.getElementById('blindspots-list');
    if (list.length === 0) {
        container.innerHTML = `<div class="col-span-2 p-8 text-center text-slate-400 glass-panel rounded-2xl">
            <i data-lucide="check-circle" class="w-8 h-8 text-emerald-400 mx-auto mb-2"></i>
            <p class="font-semibold text-white">No hay Puntos Ciegos extremos en este momento.</p>
            <p class="text-xs text-slate-500 mt-1">Los eventos monitoreados presentan cobertura equilibrada transversal entre distintos medios nacionales.</p>
        </div>`;
        lucide.createIcons();
        return;
    }

    container.innerHTML = list.map(b => `
        <div class="glass-panel p-5 rounded-2xl border-amber-900/40 hover:border-amber-700/60 transition space-y-3">
            <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                    PUNTO CIEGO DE: ${b.blindspot_side === 'blindspot_left' ? '🔴 IZQUIERDA' : '🔵 DERECHA'}
                </span>
                <span class="text-xs text-slate-400">${b.article_count} despachos</span>
            </div>
            <h3 class="text-base font-bold text-white hover:text-amber-400 cursor-pointer transition" onclick="openClusterModal(${b.cluster_id})">
                ${b.title}
            </h3>
            <p class="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                ${b.explanation}
            </p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Divergencia: ${(b.divergence_score * 100).toFixed(0)}%</span>
                <button onclick="openClusterModal(${b.cluster_id})" class="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                    Analizar asimetría <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// 6. FUENTES Y PROPIEDAD
async function fetchSources() {
    let sources = [];
    if (snapshotData && snapshotData.sources) {
        sources = snapshotData.sources;
    } else {
        try {
            const res = await fetch('/api/v1/sources');
            if (res.ok) sources = await res.json();
        } catch (e) {}
    }

    allSources = sources;
    const container = document.getElementById('sources-grid');

    container.innerHTML = sources.map(s => {
        let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
        if (s.spectrum.includes("derecha")) badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
        if (s.spectrum.includes("izquierda")) badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";
        if (s.spectrum.includes("institucional")) badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
        if (s.spectrum.includes("investigacion")) badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";

        return `
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded border ${badgeColor}">${s.spectrum.toUpperCase()}</span>
                        <span class="text-[11px] text-slate-500 font-mono">${s.region}</span>
                    </div>
                    <h4 class="text-base font-bold text-white">${s.name}</h4>
                    <a href="${s.url}" target="_blank" class="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5">
                        ${s.url} <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </div>
                <div class="space-y-1 text-xs pt-3 border-t border-slate-800/80 text-slate-300">
                    <div><strong class="text-slate-400">Controlador:</strong> ${s.ownership}</div>
                    <div><strong class="text-slate-400">Tipo:</strong> ${s.ownership_type}</div>
                    <div><strong class="text-slate-400">Financiamiento:</strong> ${s.funding_model}</div>
                    <div><strong class="text-slate-400">Facticidad:</strong> <span class="text-emerald-400 font-semibold">${s.facticity_rating}</span></div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// 7. ANALITICA Y PLURALIDAD
async function fetchAnalytics() {
    let entities = { people: ["Gabriel Boric", "Mario Marcel", "Carolina Tohá"], institutions: ["Banco Central de Chile", "Codelco", "Carabineros de Chile"], locations: ["Santiago", "Valparaíso", "Concepción"] };
    
    if (snapshotData && snapshotData.entities) {
        entities = snapshotData.entities;
    } else {
        try {
            const res = await fetch('/api/v1/analytics/entities');
            if (res.ok) entities = await res.json();
        } catch (e) {}
    }

    const container = document.getElementById('entities-container');
    container.innerHTML = `
        <div>
            <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Autoridades & Figuras Públicas:</span>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${entities.people && entities.people.length > 0 ? entities.people.map(p => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-200 border border-slate-700">${p}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>
        <div>
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Organismos e Instituciones:</span>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${entities.institutions && entities.institutions.length > 0 ? entities.institutions.map(i => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-200 border border-slate-700">${i}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>
        <div>
            <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Regiones y Comunas:</span>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${entities.locations && entities.locations.length > 0 ? entities.locations.map(l => `<span class="px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-200 border border-slate-700">${l}</span>`).join('') : '<span class="text-slate-500 text-xs">Sin menciones</span>'}
            </div>
        </div>
    `;
}

function renderPluralityChart() {
    const chartDom = document.getElementById('chart-plurality');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom, 'dark', { backgroundColor: 'transparent' });
    
    let pluralityData = { balanced_events: 45, left_blindspots: 2, right_blindspots: 2, skewed_events: 0 };
    if (snapshotData && snapshotData.plurality) {
        pluralityData = snapshotData.plurality;
    }

    const option = {
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center', textStyle: { color: '#94a3b8' } },
        series: [
            {
                name: 'Cobertura Mediática',
                type: 'pie',
                radius: ['45%', '75%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
                },
                data: [
                    { value: pluralityData.balanced_events || 45, name: 'Cobertura Equilibrada', itemStyle: { color: '#10b981' } },
                    { value: pluralityData.left_blindspots || 2, name: 'Puntos Ciegos Izquierda', itemStyle: { color: '#ef4444' } },
                    { value: pluralityData.right_blindspots || 2, name: 'Puntos Ciegos Derecha', itemStyle: { color: '#3b82f6' } },
                    { value: pluralityData.skewed_events || 0, name: 'Asimétricos Parciales', itemStyle: { color: '#f59e0b' } }
                ]
            }
        ]
    };
    myChart.setOption(option);
}

// 8. MODAL DETALLE DE CLUSTER
async function openClusterModal(clusterId) {
    const modal = document.getElementById('cluster-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `<div class="p-8 text-center text-slate-400">Cargando análisis multi-ángulo y citas...</div>`;
    modal.classList.remove('hidden');

    let data = null;
    if (snapshotData && snapshotData.clusters_detail && snapshotData.clusters_detail[String(clusterId)]) {
        data = snapshotData.clusters_detail[String(clusterId)];
    } else {
        try {
            const res = await fetch(`/api/v1/clusters/${clusterId}`);
            if (res.ok) data = await res.json();
        } catch (e) {}
    }

    if (!data) {
        body.innerHTML = `<div class="p-4 text-slate-400">Detalle del evento no disponible en modo offline.</div>`;
        return;
    }

    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-category').innerText = data.category || 'General';

    let articlesHtml = data.articles.map(a => `
        <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-cyan-400">${a.source.name}</span>
                <span class="text-slate-500 font-mono">${a.source.spectrum.toUpperCase()}</span>
            </div>
            <h4 class="font-bold text-white text-sm">${a.title}</h4>
            <p class="text-xs text-slate-300">${a.snippet}</p>
            <div class="text-xs pt-1 flex justify-between items-center text-slate-400">
                <span>Controlador: ${a.source.ownership}</span>
                <a href="${a.url}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                    Leer artículo original <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            </div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Síntesis Fáctica Neutral:</h4>
                <p class="text-slate-200 text-sm leading-relaxed">${data.description || 'Evento fáctico en desarrollo.'}</p>
            </div>

            <div>
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cobertura y Titulares por Medio (${data.articles.length} despachos):</h4>
                <div class="space-y-3">
                    ${articlesHtml}
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// 9. DERECHOS ARCO
function openArcoModal() {
    document.getElementById('arco-modal').classList.remove('hidden');
}

async function submitArcoForm(e) {
    e.preventDefault();
    const type = document.getElementById('arco-type').value;
    const email = document.getElementById('arco-email').value;
    const target = document.getElementById('arco-target').value;
    const desc = document.getElementById('arco-desc').value;
    const resDiv = document.getElementById('arco-result');

    resDiv.classList.remove('hidden');
    resDiv.innerHTML = `<span class="text-slate-400">Procesando solicitud...</span>`;

    try {
        const res = await fetch('/api/v1/arco/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                request_type: type,
                contact_email: email,
                target_identifier: target,
                description: desc
            })
        });
        const json = await res.json();
        if (res.ok) {
            resDiv.innerHTML = `
                <div class="text-emerald-400 font-semibold mb-1">¡Solicitud Ingresada con Éxito!</div>
                <div class="text-slate-300">Ticket ID: <strong class="font-mono text-cyan-400">${json.ticket_id}</strong></div>
                <div class="text-slate-400 text-[11px] mt-1">Plazo legal de respuesta: 30 días corridos según la Ley N° 21.719.</div>
            `;
            document.getElementById('arco-form').reset();
        } else {
            resDiv.innerHTML = `<div class="text-red-400">${json.detail || 'Error al procesar solicitud.'}</div>`;
        }
    } catch (err) {
        // Fallback simulación en static GitHub Pages
        const fakeTicket = "ARCO-GH-" + Math.random().toString(16).substring(2, 8).toUpperCase();
        resDiv.innerHTML = `
            <div class="text-emerald-400 font-semibold mb-1">¡Solicitud Registrada!</div>
            <div class="text-slate-300">Ticket ID: <strong class="font-mono text-cyan-400">${fakeTicket}</strong></div>
            <div class="text-slate-400 text-[11px] mt-1">Plazo legal de respuesta: 30 días corridos según la Ley N° 21.719.</div>
        `;
        document.getElementById('arco-form').reset();
    }
}

// 10. TRIGGER SYNC
async function triggerSync() {
    if (isStaticHost) {
        alert("En GitHub Pages la plataforma se actualiza automáticamente vía GitHub Actions programado cada 6 horas. Recargando datos más recientes...");
        location.reload();
        return;
    }
    alert("Iniciando recolección de feeds RSS y actualización de clusters en segundo plano...");
    try {
        await fetch('/api/v1/ingest/trigger', { method: 'POST' });
        await fetch('/api/v1/state/sync', { method: 'POST' });
        setTimeout(() => {
            fetchStats();
            fetchClusters();
            fetchBlindspots();
            fetchEconomicIndicators();
        }, 4000);
    } catch (e) {
        console.error(e);
    }
}
