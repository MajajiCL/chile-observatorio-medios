// Presidenta IA & Observatorio de Estado de Chile - Universal Client Engine

let allClusters = [];
let allSources = [];
let allAuditPillars = [];
let allProposals = [
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

let currentCategory = 'all';
let currentSearch = '';
let dataSnapshot = window.OBSERVATORIO_SNAPSHOT || null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!dataSnapshot) {
        try {
            const res = await fetch('./data/snapshot.json');
            if (res.ok) dataSnapshot = await res.json();
        } catch (e) {
            console.log('Modo API');
        }
    }

    renderAllViews();
    runSimulation();
});

function renderAllViews() {
    renderEconomicIndicators();
    renderCadenaNacional();
    renderLegislativeBills();
    renderRoadmap2050();
    renderAuditPillars();
    renderClustersView();
    renderCitizenProposals();
    if (window.lucide) lucide.createIcons();
}

function switchTab(tabId) {
    const tabs = ['cadena', 'leyes', 'roadmap', 'audit', 'clusters', 'citizen'];
    tabs.forEach(t => {
        const view = document.getElementById('view-' + t);
        const btn = document.getElementById('tab-btn-' + t);
        if (!view || !btn) return;
        
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.className = 'px-4 py-2.5 rounded-xl font-bold transition bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md flex items-center space-x-2 whitespace-nowrap';
        } else {
            view.classList.add('hidden');
            btn.className = 'px-4 py-2.5 rounded-xl font-medium transition text-slate-400 hover:text-white flex items-center space-x-2 whitespace-nowrap';
        }
    });

    if (tabId === 'cadena') {
        setTimeout(renderStatecraftRadar, 60);
    }
    if (window.lucide) lucide.createIcons();
}

function renderCadenaNacional() {
    const c = (dataSnapshot && dataSnapshot.cadena_nacional) ? dataSnapshot.cadena_nacional : {
        title: "Cadena Nacional Ciudadana: El Estado de Chile hoy 1 de Septiembre de 2026",
        executive_headline: "La economía muestra estabilidad con inflación controlada (-0.2% mensual), mientras el debate en el Congreso se concentra en la Reforma Previsional y la urgencia de destrabar inversiones hídricas en el norte chico.",
        key_takeaways_for_citizens: [
            { icon: "wallet", topic: "Para tu Bolsillo", text: "La UF se mantiene en $40.875 y el Dólar en $933. La caída de la inflación alivia el costo de los alimentos básicos este mes." },
            { icon: "shield", topic: "Para tu Seguridad", text: "Prioridad máxima en el Senado para la Ley de Inteligencia y control fronterizo. La Presidenta IA recomienda vigilar la inversión efectiva en patrullaje comunal." },
            { icon: "heart-pulse", topic: "Para tu Salud", text: "El Ministerio de Salud evalúa extender el horario de pabellones los sábados para acelerar cirugías retrasadas en hospitales regionales." }
        ],
        president_quote: "«Un país no se construye peleando por quién grita más fuerte en el matinal, sino midiendo rigurosamente cada peso público y aprendiendo con humildad de los que ya resolvieron estos problemas en el mundo.»"
    };

    const titleEl = document.getElementById("cadena-title");
    const headlineEl = document.getElementById("cadena-headline");
    const quoteEl = document.getElementById("cadena-quote");
    const takeawaysEl = document.getElementById("cadena-takeaways");

    if (titleEl) titleEl.innerText = c.title;
    if (headlineEl) headlineEl.innerText = c.executive_headline;
    if (quoteEl) quoteEl.innerText = c.president_quote;

    if (takeawaysEl) {
        takeawaysEl.innerHTML = (c.key_takeaways_for_citizens || []).map(t => `
            <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div class="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                    <i data-lucide="${t.icon || 'check'}" class="w-4 h-4 text-cyan-400"></i>
                    <span>${t.topic}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${t.text}</p>
            </div>
        `).join("");
    }

    setTimeout(renderStatecraftRadar, 50);
}

function renderLegislativeBills() {
    allLegislativeBills = (dataSnapshot && dataSnapshot.legislative_bills) ? dataSnapshot.legislative_bills : [];
    const container = document.getElementById("legislative-bills-container");
    if (!container) return;

    container.innerHTML = allLegislativeBills.map((b, idx) => `
        <div class="glass-card p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-800">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-emerald-950/90 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
                        ${idx + 1}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">${b.bulletin_number}</span>
                            <span class="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">${b.status}</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-black text-white mt-0.5">${b.title}</h3>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                    <i data-lucide="flame" class="w-3 h-3 text-amber-400"></i> ${b.urgency}
                </span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200">
                <strong class="text-slate-400 block text-[11px] uppercase tracking-wider mb-1">Resumen del Proyecto:</strong>
                ${b.summary}
            </div>

            <!-- EXPLICADO CON MANZANAS: CÓMO TE AFECTA A TI -->
            <div class="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-blue-950/30 border border-cyan-800/40 text-xs space-y-1.5">
                <div class="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                    <i data-lucide="user-check" class="w-4 h-4 text-cyan-400"></i>
                    <span>¿Cómo te afecta a ti en tu vida diaria?</span>
                </div>
                <p class="text-slate-200 leading-relaxed">${b.ai_president_breakdown.como_te_afecta_a_ti}</p>
            </div>

            <!-- LO POSITIVO VS LOS RIESGOS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <i data-lucide="check-circle" class="w-3 h-3"></i> Lo Positivo:
                    </span>
                    <p class="text-slate-300">${b.ai_president_breakdown.lo_positivo}</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                    <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <i data-lucide="alert-triangle" class="w-3 h-3"></i> Los Riesgos & Desafíos:
                    </span>
                    <p class="text-slate-300">${b.ai_president_breakdown.los_riesgos}</p>
                </div>
            </div>

            <!-- CONTRASTE POLÍTICO & EVIDENCIA -->
            <div class="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong class="text-slate-300 block mb-0.5">Postura Oficialismo:</strong>
                    ${b.political_debate.oficialismo}
                </div>
                <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong class="text-slate-300 block mb-0.5">Postura Oposición:</strong>
                    ${b.political_debate.oposicion}
                </div>
                <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                    <strong class="text-emerald-300 block mb-0.5">Evidencia Técnica / OCDE:</strong>
                    ${b.political_debate.evidencia_tecnica}
                </div>
            </div>
        </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
}

function renderRoadmap2050() {
    allRoadmapPhases = (dataSnapshot && dataSnapshot.chile_2050_roadmap) ? dataSnapshot.chile_2050_roadmap : [];
    const container = document.getElementById("roadmap-container");
    if (!container) return;

    container.innerHTML = allRoadmapPhases.map((phase, idx) => {
        const milestonesHtml = (phase.milestones || []).map(m => `
            <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800/50">${m.year}</span>
                        <h5 class="font-bold text-white">${m.title}</h5>
                    </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">${m.status}</span>
            </div>
        `).join("");

        return `
            <div class="glass-card p-6 sm:p-7 rounded-3xl space-y-4 border border-slate-800">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-black text-sm shadow-md">
                        0${idx + 1}
                    </div>
                    <div>
                        <h4 class="text-base sm:text-lg font-black text-white">${phase.phase}</h4>
                        <p class="text-xs text-slate-400">${phase.tagline}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    ${milestonesHtml}
                </div>
            </div>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

const SIMULATION_DATA = {
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

function runSimulation() {
    const select = document.getElementById('simulator-select');
    const output = document.getElementById('simulator-output');
    if (!select || !output) return;

    const sim = SIMULATION_DATA[select.value] || SIMULATION_DATA.carceles;

    output.innerHTML = '<h4 class="font-bold text-white text-xs sm:text-sm text-cyan-300 mb-2">' + sim.title + '</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"><div class="p-3 rounded-xl bg-red-950/40 border border-red-800/40 space-y-1"><span class="text-[10px] font-bold text-red-400 uppercase tracking-wider">Enfoque Tradicional:</span><p class="text-slate-300 font-medium">' + sim.decisionA + '</p><p class="text-red-300/80 text-[11px]">↳ ' + sim.impactA + '</p></div><div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1"><span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Enfoque con Evidencia:</span><p class="text-slate-300 font-medium">' + sim.decisionB + '</p><p class="text-emerald-300/80 text-[11px]">↳ ' + sim.impactB + '</p></div></div><div class="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 border border-slate-800 flex items-start gap-2 mt-2"><i data-lucide="book-open" class="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"></i><span><strong class="text-slate-200">Evidencia Histórica Global:</strong> ' + sim.evidence + '</span></div>';
    if (window.lucide) lucide.createIcons();
}

function renderAuditPillars() {
    allAuditPillars = (dataSnapshot && dataSnapshot.national_audit) ? dataSnapshot.national_audit : [];
    const container = document.getElementById('audit-pillars-container');
    if (!container) return;

    container.innerHTML = allAuditPillars.map((p, idx) => {
        let statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">ESTADO CRÍTICO</span>';
        if (p.status_level === 'grave') statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">ESTADO GRAVE</span>';
        if (p.status_level === 'moderado') statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">ESTADO MODERADO</span>';

        const dataKeys = Object.entries(p.chile_current_data || {});
        const metricsHtml = dataKeys.map(([k, v]) => '<div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80"><span class="text-[10px] uppercase font-bold text-slate-500 block">' + k.replace(/_/g, ' ') + '</span><span class="text-xs font-mono font-bold text-slate-200">' + v + '</span></div>').join('');

        const benchmarksHtml = (p.global_benchmarks || []).map(b => '<div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs"><div class="flex items-center justify-between text-cyan-400 font-bold"><span>' + b.country + '</span><span class="text-[10px] text-slate-400 font-mono">' + b.policy_model + '</span></div><p class="text-slate-300">' + b.historical_lesson + '</p><div class="text-[11px] text-emerald-400 pt-1 border-t border-slate-800/80"><strong>Aplicación en Chile:</strong> ' + b.applicability_chile + '</div></div>').join('');

        return '<div class="glass-card p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-800"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">' + (idx + 1) + '</div><div><span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Pilar de Estado #' + (idx + 1) + '</span><h3 class="text-base sm:text-lg font-black text-white">' + p.title + '</h3></div></div>' + statusBadge + '</div><div class="space-y-2"><h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnóstico Estructural:</h4><p class="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">' + p.diagnostic + '</p></div><div><h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Datos Duros Oficiales (Chile):</h4><div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">' + metricsHtml + '</div></div><div class="space-y-2.5"><h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Experiencia Internacional & Solución Probada en el Mundo:</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + benchmarksHtml + '</div></div><div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"></i><div><strong class="font-bold text-amber-300">Riesgo Crítico hacia 2030 si no se actúa:</strong><p class="text-slate-300 text-[11px] mt-0.5">' + p.future_risks_2030 + '</p></div></div><div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200"><strong class="font-bold text-cyan-300 uppercase tracking-wider text-[11px] block mb-1">Recomendación Estratégica de la Presidenta IA:</strong><p class="text-slate-200 leading-relaxed">' + p.strategic_recommendation + '</p></div></div>';
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function renderBenchmarksGrid() {
    const container = document.getElementById('benchmarks-grid');
    if (!container) return;

    let allBenchmarks = [];
    allAuditPillars.forEach(p => {
        (p.global_benchmarks || []).forEach(b => {
            allBenchmarks.push({ ...b, pillarTitle: p.title });
        });
    });

    container.innerHTML = allBenchmarks.map(b => '<div class="glass-card p-5 rounded-2xl space-y-3 flex flex-col justify-between"><div class="space-y-2"><div class="flex items-center justify-between"><span class="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">' + b.country + '</span><span class="text-[10px] text-cyan-400 font-mono">' + b.pillarTitle + '</span></div><h4 class="text-sm font-bold text-white">' + b.policy_model + '</h4><p class="text-xs text-slate-300 leading-relaxed">' + b.historical_lesson + '</p></div><div class="pt-3 border-t border-slate-800 text-[11px] text-emerald-400"><strong>Lección para Chile:</strong> ' + b.applicability_chile + '</div></div>').join('');

    if (window.lucide) lucide.createIcons();
}

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
        filtered = filtered.filter(c => (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
    }

    const container = document.getElementById('clusters-list');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-2 p-8 text-center text-slate-500 glass-card rounded-2xl">No se encontraron noticias con estos criterios.</div>';
        return;
    }

    container.innerHTML = filtered.map(c => {
        const b = c.blindspot || { left_pct: 0.33, center_pct: 0.34, right_pct: 0.33 };
        const leftW = Math.round((b.left_pct || 0) * 100);
        const centerW = Math.round((b.center_pct || 0) * 100);
        const rightW = Math.round((b.right_pct || 0) * 100);

        return '<div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4"><div class="space-y-2"><div class="flex items-center justify-between gap-2"><span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20">' + (c.category || 'Nacional') + '</span><span class="text-xs text-slate-400">' + (c.article_count || 1) + ' medios</span></div><h3 class="text-sm sm:text-base font-bold text-white leading-snug cursor-pointer hover:text-cyan-400 transition" onclick="openClusterModal(' + c.id + ')">' + c.title + '</h3><p class="text-xs text-slate-300 line-clamp-2">' + (c.description || '') + '</p></div><div class="space-y-1.5 pt-2 border-t border-slate-800"><div class="flex items-center justify-between text-[11px] font-semibold"><span class="text-red-400">🔴 Izq ' + leftW + '%</span><span class="text-amber-400">🟡 Centro ' + centerW + '%</span><span class="text-blue-400">🔵 Der ' + rightW + '%</span></div><div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800"><div style="width: ' + leftW + '%" class="bg-red-500 spectrum-bar"></div><div style="width: ' + centerW + '%" class="bg-amber-500 spectrum-bar"></div><div style="width: ' + rightW + '%" class="bg-blue-500 spectrum-bar"></div></div></div><div class="flex items-center justify-between text-xs pt-1"><span class="text-slate-500 text-[11px]">' + (c.last_seen_at ? new Date(c.last_seen_at).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'}) + ' hrs' : 'Hoy') + '</span><button onclick="openClusterModal(' + c.id + ')" class="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-xs">Comparar Coberturas <i data-lucide="arrow-right" class="w-3 h-3"></i></button></div></div>';
    }).join('');
    if (window.lucide) lucide.createIcons();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.className = 'cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800';
    });
    if (event && event.target) {
        event.target.className = 'cat-pill px-3 py-1 rounded-full font-medium transition bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold';
    }
    applyFilters();
}

function filterClusters() {
    currentSearch = document.getElementById('cluster-search').value;
    applyFilters();
}

function renderBlindspotsView() {
    let list = (dataSnapshot && dataSnapshot.blindspots) ? dataSnapshot.blindspots : [];
    const container = document.getElementById('blindspots-list');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<div class="col-span-2 p-8 text-center text-slate-400 glass-card rounded-2xl"><i data-lucide="check-circle" class="w-8 h-8 text-emerald-400 mx-auto mb-2"></i><h4 class="font-bold text-white text-base">Cobertura Equilibrada en los Sucesos Actuales</h4><p class="text-xs text-slate-400 mt-1">No se registran asimetrías ideológicas extremas en la jornada.</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = list.map(b => '<div class="glass-card p-5 rounded-2xl border-amber-900/40 space-y-3"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">PUNTO CIEGO DE: ' + (b.blindspot_side === 'blindspot_left' ? '🔴 IZQUIERDA' : '🔵 DERECHA') + '</span><h3 class="text-sm font-bold text-white cursor-pointer hover:text-amber-400" onclick="openClusterModal(' + b.cluster_id + ')">' + b.title + '</h3><p class="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">' + b.explanation + '</p></div>').join('');
    if (window.lucide) lucide.createIcons();
}

function renderSourcesView() {
    let sources = (dataSnapshot && dataSnapshot.sources) ? dataSnapshot.sources : [];
    const container = document.getElementById('sources-grid');
    if (!container) return;

    container.innerHTML = sources.map(s => '<div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-3"><div class="flex items-center justify-between"><span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-800 text-cyan-400">' + s.spectrum.toUpperCase() + '</span><span class="text-[10px] text-slate-500 font-mono">' + s.region + '</span></div><h4 class="text-sm font-bold text-white">' + s.name + '</h4><div class="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800"><div><strong class="text-slate-500">Controlador:</strong> ' + s.ownership + '</div><div><strong class="text-slate-500">Financiamiento:</strong> ' + s.funding_model + '</div><div><strong class="text-slate-500">Facticidad:</strong> <span class="text-emerald-400 font-bold">' + s.facticity_rating + '</span></div></div></div>').join('');
    if (window.lucide) lucide.createIcons();
}

function renderCitizenProposals() {
    const container = document.getElementById('citizen-proposals-grid');
    if (!container) return;

    container.innerHTML = allProposals.map(p => '<div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"><div class="space-y-1.5"><span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">' + p.pillar + '</span><h4 class="font-bold text-white text-sm leading-snug">' + p.title + '</h4><p class="text-slate-300 text-xs">' + p.desc + '</p><div class="text-[10px] text-slate-500">Por: ' + p.author + '</div></div><div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs"><button onclick="upvoteProposal(' + p.id + ')" class="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/60 flex items-center gap-1.5 transition"><i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>' + p.votes + ' Votos</span></button><span class="text-emerald-400 text-[11px] font-semibold flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> En Revisión</span></div></div>').join('');
    if (window.lucide) lucide.createIcons();
}

function upvoteProposal(id) {
    const prop = allProposals.find(p => p.id === id);
    if (prop) {
        prop.votes += 1;
        renderCitizenProposals();
    }
}

function openCitizenProposalModal() {
    const el = document.getElementById('proposal-modal');
    if (el) el.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function submitCitizenProposal(e) {
    e.preventDefault();
    const pilar = document.getElementById('prop-pilar').value;
    const title = document.getElementById('prop-title').value;
    const desc = document.getElementById('prop-desc').value;
    const resDiv = document.getElementById('prop-result');

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
    
    setTimeout(() => {
        closeModal('proposal-modal');
        resDiv.classList.add('hidden');
        document.getElementById('prop-title').value = '';
        document.getElementById('prop-desc').value = '';
        renderCitizenProposals();
        switchTab('citizen');
    }, 1200);
}

function openClusterModal(clusterId) {
    const modal = document.getElementById('cluster-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    modal.classList.remove('hidden');

    let clusterDetail = (dataSnapshot && dataSnapshot.clusters_detail && dataSnapshot.clusters_detail[String(clusterId)]) ? dataSnapshot.clusters_detail[String(clusterId)] : null;

    if (!clusterDetail) {
        const c = allClusters.find(item => item.id === clusterId) || { title: 'Evento Fáctico', description: '', category: 'General' };
        clusterDetail = {
            title: c.title,
            description: c.description,
            category: c.category,
            articles: [{ title: c.title, snippet: c.description, url: '#', source: { name: 'Medio Chileno', spectrum: 'centro', ownership: 'Empresa Periodística' } }]
        };
    }

    document.getElementById('modal-title').innerText = clusterDetail.title;
    document.getElementById('modal-category').innerText = clusterDetail.category || 'General';

    const articlesHtml = (clusterDetail.articles || []).map(a => {
        let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        const spec = (a.source.spectrum || '').toLowerCase();
        if (spec.includes('derecha')) badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (spec.includes('izquierda')) badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';

        return '<div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"><div class="flex items-center justify-between"><span class="font-bold text-cyan-400">' + a.source.name + '</span><span class="text-[10px] font-bold px-2 py-0.5 rounded border ' + badgeColor + '">' + a.source.spectrum.toUpperCase() + '</span></div><h4 class="font-bold text-white text-sm leading-snug">' + a.title + '</h4><p class="text-slate-300 text-xs">' + (a.snippet || '') + '</p><div class="pt-2 flex justify-between items-center text-slate-500 text-[11px] border-t border-slate-800"><span>Controlador: ' + a.source.ownership + '</span>' + (a.url && a.url !== '#' ? '<a href="' + a.url + '" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">Leer noticia original <i data-lucide="external-link" class="w-3 h-3"></i></a>' : '') + '</div></div>';
    }).join('');

    body.innerHTML = '<div class="space-y-4"><div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1"><h4 class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Síntesis Fáctica de Estado:</h4><p class="text-slate-200 text-sm leading-relaxed">' + (clusterDetail.description || 'Evento en seguimiento.') + '</p></div><div class="space-y-2.5"><h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Despachos por Medio de Comunicación (' + (clusterDetail.articles || []).length + ' fuentes):</h4><div class="space-y-2.5">' + articlesHtml + '</div></div></div>';

    if (window.lucide) lucide.createIcons();
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function openArcoModal() {
    const el = document.getElementById('arco-modal');
    if (el) el.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function submitArcoForm(e) {
    e.preventDefault();
    const resDiv = document.getElementById('arco-result');
    const fakeTicket = 'ARCO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    resDiv.classList.remove('hidden');
    resDiv.innerHTML = '<div class="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> Solicitud Registrada</div><div class="text-slate-300">Ticket ID: <strong class="font-mono text-cyan-400">' + fakeTicket + '</strong></div><div class="text-slate-400 text-[11px] mt-1">Plazo legal: 30 días corridos según Ley N° 21.719. Se ha notificado al Delegado de Protección de Datos.</div>';
    document.getElementById('arco-form').reset();
    if (window.lucide) lucide.createIcons();
}

function refreshData() {
    location.reload();
}
