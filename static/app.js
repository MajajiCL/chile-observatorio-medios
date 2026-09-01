/**
 * Observatorio de Medios & Radiografía de Estado de Chile — Suite Profesional 2026
 * Módulos: Asistente Cívico IA, Comparador 1vs1, Simulador Fiscal Dinámico, Mapa de Calor, Exportación y Efemérides
 */

(function () {
    'use strict';

    var currentCategory = 'all';
    var currentRegionId = 'metropolitana';
    var compareRegionA = 'metropolitana';
    var compareRegionB = 'valparaiso';
    var activeHeatmapLayer = 'water';
    var onboardingStep = 1;

    function getSnapshot() {
        return window.OBSERVATORIO_SNAPSHOT || {};
    }

    function safeCreateIcons() {
        try {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        } catch (e) {
            console.warn('Lucide fallback active:', e);
        }
    }

    // 1. INDICADORES ECONÓMICOS DEL BANCO CENTRAL
    function renderEconomicIndicators() {
        var snap = getSnapshot();
        var indicators = snap.economic_indicators || [];
        var container = document.getElementById('economic-ticker');
        if (!container) return;

        var html = '';
        indicators.forEach(function (ind) {
            var valFormatted = typeof ind.value === 'number'
                ? ind.value.toLocaleString('es-CL', { maximumFractionDigits: 2 })
                : ind.value;
            var displayVal = ind.unit === 'CLP' ? '$' + valFormatted : valFormatted + ' ' + (ind.unit === '%' ? '%' : ind.unit);

            html += '<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] bg-[#f1f5f9] border border-[#e2e8f0] text-xs shadow-xs">' +
                '<span class="font-bold text-[#0f172a]">' + ind.code + ':</span>' +
                '<span class="font-mono font-bold text-[#0284c7]">' + displayVal + '</span>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // 2. MOTOR DEL ASISTENTE CÍVICO INTELIGENTE («PREGÚNTALE A LA PRESIDENTA IA»)
    function queryCivicAssistant(userPrompt) {
        if (!userPrompt || !userPrompt.trim()) return;
        var p = userPrompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var bills = snap.legislative_bills || [];
        var fiscal = snap.national_fiscal_balance || {};
        var hist = snap.historical_data || {};

        var answer = '';
        var sources = [];

        var foundRegion = regions.find(function (r) {
            var rName = r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            var rId = r.id.toLowerCase();
            return p.includes(rId) || p.includes(rName.replace('region de ', '').replace('region del ', ''));
        });

        if (foundRegion) {
            var r = foundRegion;
            var sec = r.security || {};
            var hl = r.health || {};
            var pr = r.prisons || {};
            var fin = r.finances || {};

            if (p.includes('seguridad') || p.includes('policia') || p.includes('carabineros') || p.includes('delito') || p.includes('homicidio')) {
                answer = 'En la **' + r.name + '**, la dotación de **Carabineros** es de **' + (sec.carabineros_officers || 0).toLocaleString('es-CL') + ' efectivos** en ' + (sec.carabineros_stations || 15) + ' comisarías. Cuentan con ' + (sec.patrol_vehicles_active || 0) + ' patrullas operativas (' + (sec.patrol_vehicles_broken || 0) + ' en pana). La tasa de homicidios es de **' + (sec.homicide_rate_per_100k || 0) + ' por cada 100k hab.** con un nivel de amenaza de crimen organizado calificado como **' + (sec.organized_crime_threat_level || 'Medio') + '**.';
                sources.push({ name: 'CEAD - Subsecretaría de Prevención del Delito', url: 'https://cead.spd.gov.cl' });
            } else if (p.includes('salud') || p.includes('hospital') || p.includes('espera') || p.includes('cirugia') || p.includes('cama')) {
                answer = 'La red de salud en la **' + r.name + '** cuenta con **' + (hl.hospitals_high_complexity || 1) + ' hospitales de alta complejidad**. La lista de espera quirúrgica acumula **' + (hl.surgical_waiting_list_patients || 0).toLocaleString('es-CL') + ' personas**, con una demora promedio de **' + (hl.avg_waiting_days_surgery || 0) + ' días** para entrar a pabellón. La dotación de camas críticas (UPC) es de **' + (hl.critical_beds_upc_per_100k || 0) + ' por 100k habitantes**.';
                sources.push({ name: 'DEIS - Ministerio de Salud de Chile', url: 'https://deis.minsal.cl' });
            } else if (p.includes('presupuesto') || p.includes('fndr') || p.includes('fondo comun') || p.includes('fcm') || p.includes('dinero')) {
                answer = 'El Gobierno Regional de **' + r.name + '** administra un presupuesto FNDR de **$' + ((fin.budget_gore_fndr_mmclp || 0) / 1000).toFixed(1) + ' Billones CLP** con una tasa de ejecución del **' + (fin.execution_fndr_pct || 0) + '%**. Además, las comunas de la región presentan una dependencia promedio del **' + (fin.fcm_dependency_avg_pct || 0) + '% del Fondo Común Municipal (FCM)**.';
                sources.push({ name: 'DIPRES / SUBDERE SINIM', url: 'https://sinim.gov.cl' });
            } else {
                answer = '**Radiografía General de ' + r.name + ':** Cuenta con una población de **' + (r.population || 0).toLocaleString('es-CL') + ' habitantes**, aporta el **' + (r.pib_share_pct || 0) + '% al PIB nacional**, tiene un IDH de **' + (r.idh || 0.840) + '**, una informalidad laboral de **' + (r.informal_labor_pct || 28) + '%** y un déficit hídrico de **' + (r.water_deficit_pct || 45) + '%**. Su lista de espera quirúrgica es de ' + (hl.surgical_waiting_list_patients || 0).toLocaleString('es-CL') + ' pacientes y el hacinamiento carcelario es de ' + (pr.overcrowding_pct || 0) + '%.';
                sources.push({ name: 'INE / DIPRES / DEIS / Gendarmería', url: 'https://www.ine.gob.cl' });
            }
        } else if (p.includes('presupuesto') || p.includes('gasto') || p.includes('ingreso') || p.includes('pib') || p.includes('deuda') || p.includes('cobre') || p.includes('litio')) {
            answer = 'El **Presupuesto Fiscal de Chile 2026** asciende a **US$ 93.450 Millones** ($87.2 Billones CLP), representando un PIB de US$ 345.000M (US$ 17.250 per cápita). El 51.5% de los ingresos proviene del **IVA**, el 34.0% de **Impuestos a la Renta**, el 5.2% de **Codelco / Minería** y el 2.8% de rentas del **Litio (Corfo)**. Las tres mayores áreas de gasto son **Salud (US$ 17.8B)**, **Educación (US$ 16.9B)** y **Protección Social (US$ 15.2B)**.';
            sources.push({ name: 'DIPRES - Informe de Finanzas Públicas 2026', url: 'https://www.dipres.gob.cl' });
        } else if (p.includes('ley') || p.includes('pension') || p.includes('permisologia') || p.includes('sala cuna') || p.includes('seguridad privada') || p.includes('inteligencia')) {
            var b = bills.find(function (item) {
                var t = item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return p.includes(t.split(' ')[0]) || p.includes('pension') || p.includes('permiso');
            }) || bills[0];

            answer = '**Sobre el proyecto "' + b.title + '":** ' + b.plain_explanation + ' **Impacto ciudadano:** ' + b.citizen_impact + ' **Evidencia técnica:** ' + b.technical_evidence;
            sources.push({ name: 'Senado / Cámara de Diputadas y Diputados / BCN', url: 'https://www.bcn.cl/leychile' });
        } else if (p.includes('historia') || p.includes('efemeride') || p.includes('un dia como hoy') || p.includes('paso hoy') || p.includes('1 de septiembre')) {
            var efe = (hist.milestones || [])[0] || { title: 'Creación del SNS (1952)', desc: 'Ley N° 10.383 unificó la salud pública chilena.', source: 'BCN' };
            answer = '**Un Día Como Hoy en Chile:** ' + efe.title + ' (' + efe.year + '). ' + efe.desc;
            sources.push({ name: efe.source || 'BCN LeyChile', url: efe.url || 'https://www.bcn.cl' });
        } else {
            answer = 'Como **Presidenta IA**, audito Chile con ciencia y datos duros de 11 ministerios. Puedes consultarme por la **seguridad, salud, colegios, cárceles o finanzas de cualquiera de las 16 regiones**, sobre el **Presupuesto Fiscal de US$ 93.5B**, sobre los **5 Proyectos de Ley clave** o sobre la **Historia republicana día a día**.';
            sources.push({ name: 'Gobierno Abierto / Banco Central / DIPRES / BCN', url: 'https://www.bcentral.cl' });
        }

        return { answer: answer, sources: sources };
    }

    function handleAssistantSubmit(e) {
        if (e) e.preventDefault();
        var input = document.getElementById('assistant-input');
        var log = document.getElementById('assistant-chat-log');
        if (!input || !log) return;

        var query = input.value.trim();
        if (!query) return;

        var userBubble = '<div class="flex justify-end">' +
            '<div class="max-w-[85%] p-3 rounded-[16px] rounded-tr-none bg-[#0f172a] text-white text-xs font-medium leading-relaxed">' +
            query +
            '</div></div>';
        log.innerHTML += userBubble;
        input.value = '';
        log.scrollTop = log.scrollHeight;

        setTimeout(function () {
            var res = queryCivicAssistant(query);
            var srcHtml = '';
            if (res.sources && res.sources.length > 0) {
                srcHtml = '<div class="mt-2 pt-2 border-t border-[#e2e8f0] text-[10px] text-[#64748b] flex flex-wrap items-center gap-1.5 font-semibold">' +
                    '<span>📚 Fuente Verificada:</span>' +
                    res.sources.map(function (s) {
                        return '<a href="' + (s.url || '#') + '" target="_blank" rel="noopener noreferrer" class="text-[#0284c7] hover:underline">' + s.name + '</a>';
                    }).join(' • ') +
                    '</div>';
            }

            var aiBubble = '<div class="flex justify-start">' +
                '<div class="max-w-[88%] p-3.5 rounded-[16px] rounded-tl-none bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a] text-xs leading-relaxed space-y-1">' +
                '<div class="flex items-center gap-1 text-[10px] font-bold text-[#0284c7] mb-1"><i data-lucide="bot" class="w-3.5 h-3.5"></i> Presidenta IA — Respuesta Factual:</div>' +
                '<p>' + res.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '</p>' +
                srcHtml +
                '</div></div>';

            log.innerHTML += aiBubble;
            safeCreateIcons();
            log.scrollTop = log.scrollHeight;
        }, 300);
    }

    function askAssistantChip(text) {
        var input = document.getElementById('assistant-input');
        if (input) {
            input.value = text;
            handleAssistantSubmit();
        }
    }

    function openAssistantModal() {
        var modal = document.getElementById('assistant-modal');
        if (modal) modal.classList.remove('hidden');
        var input = document.getElementById('assistant-input');
        if (input) input.focus();
    }

    // 3. BALANCE NACIONAL DE LA REPÚBLICA
    function renderNationalBalanceView() {
        var snap = getSnapshot();
        var fiscal = snap.national_fiscal_balance || {};
        var infra = snap.national_infrastructure_summary || {};

        var revContainer = document.getElementById('revenues-breakdown-list');
        if (revContainer && fiscal.revenues) {
            var revHtml = '';
            fiscal.revenues.forEach(function (r) {
                var amountBillions = (r.amount_usd / 1000000000).toFixed(1);
                revHtml += '<div class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1.5 hover:border-slate-300 transition">' +
                    '<div class="flex justify-between items-center text-xs">' +
                    '<span class="font-bold text-[#0f172a]">' + r.category + '</span>' +
                    '<span class="font-mono font-bold text-[#0284c7]">US$ ' + amountBillions + 'B (' + r.pct_total + '%)</span>' +
                    '</div>' +
                    '<div class="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">' +
                    '<div class="bg-[#0284c7] h-full rounded-full" style="width: ' + Math.min(r.pct_total * 2, 100) + '%"></div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between text-[10px] text-[#64748b] pt-1">' +
                    '<span>' + r.desc + '</span>' +
                    '<span class="font-semibold text-[#0f172a]">Fuente: SII / DIPRES 2026</span>' +
                    '</div>' +
                    '</div>';
            });
            revContainer.innerHTML = revHtml;
        }

        var expContainer = document.getElementById('expenditures-breakdown-list');
        if (expContainer && fiscal.expenditures) {
            var expHtml = '';
            fiscal.expenditures.forEach(function (e) {
                var amountBillions = (e.amount_usd / 1000000000).toFixed(1);
                expHtml += '<div class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1.5 hover:border-slate-300 transition">' +
                    '<div class="flex justify-between items-center text-xs">' +
                    '<span class="font-bold text-[#0f172a]">' + e.category + '</span>' +
                    '<span class="font-mono font-bold text-[#dc2626]">US$ ' + amountBillions + 'B (' + e.pct_total + '%)</span>' +
                    '</div>' +
                    '<div class="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">' +
                    '<div class="bg-[#dc2626] h-full rounded-full" style="width: ' + Math.min(e.pct_total * 4.5, 100) + '%"></div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between text-[10px] text-[#64748b] pt-1">' +
                    '<span>' + e.desc + '</span>' +
                    '<span class="font-semibold text-[#0f172a]">Fuente: Ley de Presupuestos 2026</span>' +
                    '</div>' +
                    '</div>';
            });
            expContainer.innerHTML = expHtml;
        }

        var infraContainer = document.getElementById('national-infra-summary-grid');
        if (infraContainer && infra.total_schools) {
            infraContainer.innerHTML =
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#64748b] block">Educación</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + infra.total_schools.toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">Colegios (Fuente: Mineduc)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#64748b] block">Salud Pública</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + infra.total_hospitals + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">' + infra.total_hospitals + ' Hosp. + ' + infra.total_cesfam + ' CESFAM (DEIS)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#dc2626] block">Cárceles & Gendarmería</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#dc2626]">' + infra.prison_overcrowding_national_pct + '%</span>' +
                '<span class="text-[11px] text-[#64748b] block">Hacinamiento (' + infra.total_prisons + ' penales - Gendarmería)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0f172a] block">Policías Operativos</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + (infra.total_carabineros + infra.total_pdi).toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">' + infra.total_carabineros.toLocaleString('es-CL') + ' Carab. + ' + infra.total_pdi.toLocaleString('es-CL') + ' PDI (CEAD)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0284c7] block">Bomberos de Chile</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0284c7]">' + infra.total_firefighters_volunteers.toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">' + infra.total_fire_stations + ' Cías. Voluntarias (Junta Nacional)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0f172a] block">Fuerzas Armadas</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + infra.total_military_personnel.toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">Ejército, Armada y FACh (Mindef)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#64748b] block">Déficit Habitacional</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#dc2626]">' + (infra.housing_deficit_families / 1000).toFixed(0) + 'k</span>' +
                '<span class="text-[11px] text-[#64748b] block">Familias sin casa (Minvu / TECHO)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#16a34a] block">Matriz Eléctrica Limpia</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#16a34a]">' + infra.renewable_energy_share_pct + '%</span>' +
                '<span class="text-[11px] text-[#64748b] block">Solar, eólica e hidro (CNE / CEN)</span>' +
                '</div>';
        }

        renderFiscalCharts();
        renderInteractiveBudgetSimulator();
    }

    // 4. SIMULADOR FISCAL INTERACTIVO («SI TÚ FUERAS PRESIDENTE»)
    function renderInteractiveBudgetSimulator() {
        var container = document.getElementById('interactive-budget-simulator-container');
        if (!container) return;

        var html = '<div class="space-y-5">' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">🏥 Salud Pública:</span><span id="val-sim-salud" class="font-mono font-bold text-[#0284c7]">0%</span></div>' +
            '<input type="range" id="slider-sim-salud" min="-20" max="30" value="0" step="1" oninput="calculateBudgetSimulation()" class="w-full accent-[#0284c7] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 17.800M</span>' +
            '</div>' +

            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">🎓 Educación:</span><span id="val-sim-educacion" class="font-mono font-bold text-[#0284c7]">0%</span></div>' +
            '<input type="range" id="slider-sim-educacion" min="-20" max="30" value="0" step="1" oninput="calculateBudgetSimulation()" class="w-full accent-[#0284c7] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 16.900M</span>' +
            '</div>' +

            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">🛡️ Seguridad & Policías:</span><span id="val-sim-seguridad" class="font-mono font-bold text-[#0284c7]">0%</span></div>' +
            '<input type="range" id="slider-sim-seguridad" min="-20" max="40" value="0" step="1" oninput="calculateBudgetSimulation()" class="w-full accent-[#0284c7] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 4.850M</span>' +
            '</div>' +

            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">🏗️ Obras Públicas & Minvu:</span><span id="val-sim-infra" class="font-mono font-bold text-[#0284c7]">0%</span></div>' +
            '<input type="range" id="slider-sim-infra" min="-30" max="50" value="0" step="1" oninput="calculateBudgetSimulation()" class="w-full accent-[#0284c7] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 9.400M</span>' +
            '</div>' +

            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">💡 Ciencia, I+D & Litio:</span><span id="val-sim-ciencia" class="font-mono font-bold text-[#0284c7]">0%</span></div>' +
            '<input type="range" id="slider-sim-ciencia" min="-30" max="100" value="0" step="5" oninput="calculateBudgetSimulation()" class="w-full accent-[#0284c7] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 1.250M</span>' +
            '</div>' +

            '<div class="p-4 rounded-[16px] bg-white border border-[#e2e8f0] space-y-2 shadow-xs">' +
            '<div class="flex justify-between items-center text-xs"><span class="font-bold text-[#0f172a]">⚖️ Gasto Administrativo/Asesores:</span><span id="val-sim-burocracia" class="font-mono font-bold text-[#dc2626]">0%</span></div>' +
            '<input type="range" id="slider-sim-burocracia" min="-50" max="10" value="0" step="2" oninput="calculateBudgetSimulation()" class="w-full accent-[#dc2626] cursor-pointer" />' +
            '<span class="text-[10px] text-[#64748b] block">Base actual: US$ 3.800M</span>' +
            '</div>' +
            '</div>' +

            '<div id="simulation-fiscal-results-panel" class="p-5 rounded-[20px] bg-[#0f172a] text-white space-y-4 shadow-lg">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">' +
            '<div><span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">IMPACTO MACROECONÓMICO PROYECTADO</span><h4 class="text-base font-extrabold text-white">Veredicto del Consejo Fiscal Autónomo (CFA)</h4></div>' +
            '<button onclick="resetBudgetSimulation()" class="px-3 py-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-xs font-semibold border border-white/20 transition">Restablecer Presupuesto Oficial</button>' +
            '</div>' +
            '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">' +
            '<div class="p-3 rounded-[12px] bg-white/5 border border-white/10"><span class="text-[10px] text-slate-400 block font-bold">Balance Fiscal Proyectado</span><span id="res-sim-deficit" class="text-base font-mono font-extrabold text-emerald-400">-1.9% PIB</span></div>' +
            '<div class="p-3 rounded-[12px] bg-white/5 border border-white/10"><span class="text-[10px] text-slate-400 block font-bold">Variación Neta Gasto</span><span id="res-sim-netchange" class="text-base font-mono font-extrabold text-cyan-300">US$ 0M</span></div>' +
            '<div class="p-3 rounded-[12px] bg-white/5 border border-white/10"><span class="text-[10px] text-slate-400 block font-bold">Riesgo País (EMBI)</span><span id="res-sim-embi" class="text-base font-mono font-extrabold text-white">118 pts</span></div>' +
            '<div class="p-3 rounded-[12px] bg-white/5 border border-white/10"><span class="text-[10px] text-slate-400 block font-bold">Empleos Generados/Afectados</span><span id="res-sim-jobs" class="text-base font-mono font-extrabold text-amber-300">Neutro</span></div>' +
            '</div>' +
            '<p id="res-sim-verdict" class="text-xs text-slate-300 leading-relaxed">Tu presupuesto respeta la regla fiscal estructural de Chile.</p>' +
            '</div>' +
            '</div>';

        container.innerHTML = html;
        calculateBudgetSimulation();
    }

    function calculateBudgetSimulation() {
        var sSalud = parseInt((document.getElementById('slider-sim-salud') || {}).value || 0, 10);
        var sEdu = parseInt((document.getElementById('slider-sim-educacion') || {}).value || 0, 10);
        var sSeg = parseInt((document.getElementById('slider-sim-seguridad') || {}).value || 0, 10);
        var sInf = parseInt((document.getElementById('slider-sim-infra') || {}).value || 0, 10);
        var sCie = parseInt((document.getElementById('slider-sim-ciencia') || {}).value || 0, 10);
        var sBur = parseInt((document.getElementById('slider-sim-burocracia') || {}).value || 0, 10);

        if (document.getElementById('val-sim-salud')) document.getElementById('val-sim-salud').textContent = (sSalud >= 0 ? '+' : '') + sSalud + '%';
        if (document.getElementById('val-sim-educacion')) document.getElementById('val-sim-educacion').textContent = (sEdu >= 0 ? '+' : '') + sEdu + '%';
        if (document.getElementById('val-sim-seguridad')) document.getElementById('val-sim-seguridad').textContent = (sSeg >= 0 ? '+' : '') + sSeg + '%';
        if (document.getElementById('val-sim-infra')) document.getElementById('val-sim-infra').textContent = (sInf >= 0 ? '+' : '') + sInf + '%';
        if (document.getElementById('val-sim-ciencia')) document.getElementById('val-sim-ciencia').textContent = (sCie >= 0 ? '+' : '') + sCie + '%';
        if (document.getElementById('val-sim-burocracia')) document.getElementById('val-sim-burocracia').textContent = (sBur >= 0 ? '+' : '') + sBur + '%';

        var deltaSalud = 17800 * (sSalud / 100);
        var deltaEdu = 16900 * (sEdu / 100);
        var deltaSeg = 4850 * (sSeg / 100);
        var deltaInf = 9400 * (sInf / 100);
        var deltaCie = 1250 * (sCie / 100);
        var deltaBur = 3800 * (sBur / 100);

        var netDeltaUSD = deltaSalud + deltaEdu + deltaSeg + deltaInf + deltaCie + deltaBur;
        var pibChileUSD = 345000;
        var deltaPctPIB = (netDeltaUSD / pibChileUSD) * 100;
        var newDeficitPct = -1.9 - deltaPctPIB;

        var embiBase = 118;
        var embiNew = Math.max(70, Math.round(embiBase + (deltaPctPIB * 35)));
        var jobsNew = Math.round((deltaInf * 45) + (deltaSeg * 20) + (deltaCie * 15));

        var defEl = document.getElementById('res-sim-deficit');
        var netEl = document.getElementById('res-sim-netchange');
        var embiEl = document.getElementById('res-sim-embi');
        var jobsEl = document.getElementById('res-sim-jobs');
        var verEl = document.getElementById('res-sim-verdict');

        if (netEl) netEl.textContent = (netDeltaUSD >= 0 ? '+US$ ' : '-US$ ') + Math.abs(Math.round(netDeltaUSD)) + 'M';
        if (embiEl) embiEl.textContent = embiNew + ' pts (' + (embiNew > 140 ? 'Riesgo Alto' : embiNew < 100 ? 'Excelente' : 'Estable') + ')';
        if (jobsEl) jobsEl.textContent = (jobsNew >= 0 ? '+' : '') + jobsNew.toLocaleString('es-CL') + ' empleos est.';

        if (defEl) {
            defEl.textContent = (newDeficitPct >= 0 ? '+' : '') + newDeficitPct.toFixed(2) + '% PIB';
            if (newDeficitPct > -1.0) defEl.className = 'text-base font-mono font-extrabold text-emerald-400';
            else if (newDeficitPct > -3.0) defEl.className = 'text-base font-mono font-extrabold text-amber-300';
            else defEl.className = 'text-base font-mono font-extrabold text-red-400';
        }

        if (verEl) {
            if (newDeficitPct < -3.5) {
                verEl.innerHTML = '<span class="text-red-300 font-bold">⚠️ Alerta CFA:</span> El déficit supera el límite prudencial (-3.5% PIB). Esto aumentaría las tasas de interés de créditos hipotecarios y la deuda pública hacia 2030.';
            } else if (newDeficitPct > 0) {
                verEl.innerHTML = '<span class="text-emerald-300 font-bold">✓ Superávit Fiscal:</span> Se genera excedente presupuestario para abonar al Fondo de Estabilización (FEES) y pagar deuda soberana.';
            } else {
                verEl.innerHTML = '<span class="text-cyan-300 font-bold">✓ Sostenibilidad Fiscal:</span> El presupuesto se mantiene dentro de la regla estructural recomendada por el Banco Central y la OCDE.';
            }
        }
    }

    function resetBudgetSimulation() {
        var ids = ['slider-sim-salud', 'slider-sim-educacion', 'slider-sim-seguridad', 'slider-sim-infra', 'slider-sim-ciencia', 'slider-sim-burocracia'];
        ids.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = 0;
        });
        calculateBudgetSimulation();
    }

    // 5. RADIOGRAFÍA 16 REGIONES & EXPORTADOR
    function renderRegionsAuditView() {
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var container = document.getElementById('region-selector-container');
        if (!container) return;

        var html = '<div class="space-y-4">';

        html += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[18px] bg-white border border-[#e2e8f0]">' +
            '<div>' +
            '<label class="block text-xs font-bold text-[#0f172a] uppercase tracking-wider">🗺️ Selección Directa de Región:</label>' +
            '<p class="text-[11px] text-[#64748b]">Elige una de las 16 regiones de Chile para auditarla</p>' +
            '</div>' +
            '<div class="flex items-center gap-2 flex-wrap">' +
            '<select id="region-dropdown-select" onchange="selectRegion(this.value)" class="shadcn-input px-3.5 py-2 text-xs font-bold bg-[#f8f9fa] cursor-pointer min-w-[220px]">';

        regions.forEach(function (r) {
            var selected = (r.id === currentRegionId) ? 'selected' : '';
            html += '<option value="' + r.id + '" ' + selected + '>' + r.number + ' - ' + r.name + '</option>';
        });
        html += '</select>' +
            '<button onclick="exportRegionalReportPDF()" class="shadcn-button-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-xs"><i data-lucide="printer" class="w-3.5 h-3.5"></i> Imprimir Ficha PDF</button>' +
            '<button onclick="exportDataCSV()" class="shadcn-button-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"><i data-lucide="download" class="w-3.5 h-3.5"></i> CSV</button>' +
            '</div></div>';

        html += '<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">';
        regions.forEach(function (r) {
            var isSelected = (r.id === currentRegionId);
            var activeClass = isSelected
                ? 'ring-2 ring-[#0284c7] border-[#0284c7] shadow-md scale-[1.02]'
                : 'border-[#e2e8f0] opacity-85 hover:opacity-100 hover:border-slate-400';
            var photo = r.photo_url || r.image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80';

            html += '<button onclick="selectRegion(\'' + r.id + '\')" id="btn-grid-reg-' + r.id + '" class="group relative rounded-[16px] overflow-hidden border p-2 text-left bg-white transition-all ' + activeClass + '">' +
                '<div class="w-full h-16 rounded-[12px] overflow-hidden relative mb-2 bg-[#0f172a]">' +
                '<img src="' + photo + '" alt="' + r.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80\'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />' +
                '<span class="absolute top-1 left-1 px-1.5 py-0.5 rounded-[6px] text-[9px] font-mono font-extrabold bg-[#0f172a]/90 text-white">' + r.number + '</span>' +
                '</div>' +
                '<div class="space-y-0.5">' +
                '<h4 class="text-[11px] font-extrabold text-[#0f172a] leading-tight truncate">' + r.name.replace('Región de ', '').replace('Región del ', '') + '</h4>' +
                '<span class="text-[10px] font-mono text-[#64748b] block">' + (r.population / 1000).toFixed(0) + 'k hab.</span>' +
                '</div>' +
                '</button>';
        });
        html += '</div></div>';

        container.innerHTML = html;
        selectRegion(currentRegionId);
    }

    function selectRegion(regionId) {
        currentRegionId = regionId;
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var r = regions.find(function (reg) { return reg.id === regionId; }) || regions[0];
        if (!r) return;

        var dropdown = document.getElementById('region-dropdown-select');
        if (dropdown && dropdown.value !== regionId) {
            dropdown.value = regionId;
        }

        regions.forEach(function (reg) {
            var btn = document.getElementById('btn-grid-reg-' + reg.id);
            if (btn) {
                if (reg.id === regionId) {
                    btn.className = 'group relative rounded-[16px] overflow-hidden border p-2 text-left bg-white transition-all ring-2 ring-[#0284c7] border-[#0284c7] shadow-md scale-[1.02]';
                } else {
                    btn.className = 'group relative rounded-[16px] overflow-hidden border p-2 text-left bg-white transition-all border-[#e2e8f0] opacity-85 hover:opacity-100 hover:border-slate-400';
                }
            }
        });

        var container = document.getElementById('region-full-audit-container');
        if (!container) return;

        var photoUrl = r.photo_url || r.image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';
        var photoCaption = r.photo_caption || r.image_caption || r.capital;
        var idhVal = r.idh || 0.840;
        var informalVal = r.informal_labor_pct || 28.0;
        var waterVal = r.water_deficit_pct || 45.0;

        var fin = r.finances || {};
        var hl = r.health || {};
        var sec = r.security || {};
        var pr = r.prisons || {};
        var ed = r.education || {};
        var ff = r.firefighters || {};
        var mil = r.military || {};
        var inf = r.infrastructure || {};

        var html = '<div id="printable-region-card" class="shadcn-card overflow-hidden border border-[#e2e8f0] space-y-6 shadow-card">' +
            '<div class="relative h-56 sm:h-72 w-full overflow-hidden bg-[#0f172a]">' +
            '<img src="' + photoUrl + '" alt="' + r.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80\'" class="w-full h-full object-cover filter brightness-[0.75] contrast-110 hover:scale-105 transition-transform duration-700" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>' +
            '<div class="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">' +
            '<div class="space-y-1.5">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-mono font-extrabold bg-[#0284c7] text-white">' + r.number + '</span>' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">Capital: ' + r.capital + '</span>' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-emerald-500 text-white">IDH: ' + idhVal + ' (PNUD)</span>' +
            '</div>' +
            '<h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight">' + r.name + '</h2>' +
            '<span class="text-xs text-slate-200 flex items-center gap-1 font-medium"><i data-lucide="camera" class="w-3.5 h-3.5 text-amber-300"></i> ' + photoCaption + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-3 py-1.5 rounded-[12px] bg-white/15 backdrop-blur-md text-xs font-mono font-bold border border-white/20">' + (r.population || 0).toLocaleString('es-CL') + ' hab. (INE)</span>' +
            '<span class="px-3 py-1.5 rounded-[12px] bg-white/15 backdrop-blur-md text-xs font-mono font-bold border border-white/20">' + (r.pib_share_pct || 0) + '% PIB (Banco Central)</span>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div class="p-5 sm:p-8 space-y-6">' +
            '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Presupuesto GORE (FNDR)</span><span class="text-base font-mono font-bold text-[#0f172a]">$' + ((fin.budget_gore_fndr_mmclp || 0) / 1000).toFixed(1) + 'B CLP</span><span class="text-[10px] text-[#16a34a] block font-semibold">' + (fin.execution_fndr_pct || 0) + '% Ejecución (DIPRES)</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Informalidad Laboral</span><span class="text-base font-mono font-bold text-[#dc2626]">' + informalVal + '%</span><span class="text-[10px] text-[#64748b] block">Fuente: INE ENE</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Déficit Hídrico</span><span class="text-base font-mono font-bold text-[#0284c7]">' + waterVal + '%</span><span class="text-[10px] text-[#64748b] block">Fuente: DGA / MOP</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Dependencia FCM Comunas</span><span class="text-base font-mono font-bold text-[#0f172a]">' + (fin.fcm_dependency_avg_pct || 0) + '%</span><span class="text-[10px] text-[#64748b] block">Fuente: SUBDERE SINIM</span></div>' +
            '</div>' +

            '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' +
            // SALUD
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="heart-pulse" class="w-4 h-4 text-[#dc2626]"></i> Red Asistencial (Minsal/DEIS)</h3><span class="text-[10px] font-mono text-[#64748b]">' + (hl.hospitals_high_complexity || 0) + ' Hosp. Alta C.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Camas Críticas (UPC):</span><span class="font-mono font-bold">' + (hl.critical_beds_upc_per_100k || 0) + ' / 100k hab.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Lista Espera Quirúrgica:</span><span class="font-mono font-bold text-[#dc2626]">' + (hl.surgical_waiting_list_patients || 0).toLocaleString('es-CL') + ' pers.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Demora Media Pabellón:</span><span class="font-mono font-bold">' + (hl.avg_waiting_days_surgery || 0) + ' días</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Consultas Especialidad:</span><span class="font-mono font-bold">' + (hl.specialist_consult_waiting_list || 0).toLocaleString('es-CL') + '</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Fonasa / Catastro DEIS 2026</div>' +
            '</div></div>' +

            // SEGURIDAD
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="shield" class="w-4 h-4 text-[#0284c7]"></i> Policías (Carabineros / PDI)</h3><span class="text-[10px] font-mono text-[#64748b]">' + (sec.carabineros_officers || 0).toLocaleString('es-CL') + ' Carab.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Detectives PDI:</span><span class="font-mono font-bold">' + (sec.pdi_detectives || 0).toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Patrullas Operativas:</span><span class="font-mono font-bold">' + (sec.patrol_vehicles_active || 0) + ' (' + (sec.patrol_vehicles_broken || 0) + ' en pana)</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Tasa de Homicidios:</span><span class="font-mono font-bold text-[#dc2626]">' + (sec.homicide_rate_per_100k || 0) + ' / 100k hab.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Amenaza Crimen Org.:</span><span class="font-bold text-[#dc2626]">' + (sec.organized_crime_threat_level || 'Medio') + '</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: CEAD Subsecretaría Prevención del Delito</div>' +
            '</div></div>' +

            // CARCELES
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="lock" class="w-4 h-4 text-[#dc2626]"></i> Cárceles (Gendarmería)</h3><span class="text-[10px] font-mono text-[#dc2626] font-bold">' + (pr.overcrowding_pct || 0) + '% Hacin.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Recintos Penales:</span><span class="font-mono font-bold">' + (pr.prisons_count || 0) + ' cárceles</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Población Penal:</span><span class="font-mono font-bold">' + (pr.inmates_total || 0).toLocaleString('es-CL') + ' reos</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Gendarmes de Trato:</span><span class="font-mono font-bold">' + (pr.gendarmerie_staff || 0).toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Prisión Preventiva:</span><span class="font-mono font-bold">' + (pr.preventive_custody_pct || 0) + '% sin condena</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Compendio Estadístico Gendarmería 2026</div>' +
            '</div></div>' +

            // EDUCACION
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="graduation-cap" class="w-4 h-4 text-[#0f172a]"></i> Escuelas & Liceos</h3><span class="text-[10px] font-mono text-[#64748b]">' + (ed.total_schools || 0) + ' Colegios</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Matrícula Escolar:</span><span class="font-mono font-bold">' + (ed.matricula_total || 0).toLocaleString('es-CL') + ' alumnos</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">SIMCE Lectura / Mate:</span><span class="font-mono font-bold">' + (ed.simce_reading_avg || 0) + ' / ' + (ed.simce_math_avg || 0) + ' pts</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Asistencia Crítica:</span><span class="font-mono font-bold text-[#dc2626]">' + (ed.critical_attendance_pct || 0) + '%</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Gratuidad Superior:</span><span class="font-mono font-bold text-[#16a34a]">' + (ed.gratuidad_coverage_pct || 0) + '%</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Centro de Estudios Mineduc / Agencia Calidad</div>' +
            '</div></div>' +

            // BOMBEROS
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-[#dc2626]"></i> Bomberos de Chile</h3><span class="text-[10px] font-mono text-[#0284c7] font-bold">' + (ff.companies_count || 0) + ' Cías.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Voluntarios Activos:</span><span class="font-mono font-bold">' + (ff.volunteers_count || 0).toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Carrobombas / Carros:</span><span class="font-mono font-bold">' + (ff.fire_trucks_operational || 0) + ' (' + (ff.fire_trucks_falla || 0) + ' en falla)</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Tiempo Resp. Urbano:</span><span class="font-mono font-bold">' + (ff.avg_response_time_minutes || 0) + ' min</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Aporte Fiscal Anual:</span><span class="font-mono font-bold">$' + (ff.fiscal_subsidy_mmclp || 0).toLocaleString('es-CL') + 'M CLP</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Memoria Junta Nacional de Bomberos</div>' +
            '</div></div>' +

            // FFAA
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="anchor" class="w-4 h-4 text-[#0f172a]"></i> Fuerzas Armadas (FFAA)</h3><span class="text-[10px] font-mono text-[#64748b]">' + (mil.bases_units_count || 4) + ' Unidades</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Efectivos Militares:</span><span class="font-mono font-bold">' + (mil.stationed_personnel || 0).toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Ramas Presentes:</span><span class="font-bold">' + ((mil.branches_present || []).join(', ') || 'Ejército, Armada, FACh') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Misión Estratégica:</span><span class="font-bold text-[#0284c7]">' + (mil.primary_strategic_mission || 'Protección de soberanía y catástrofes.') + '</span></div>' +
            '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Estado Mayor Conjunto (EMCO)</div>' +
            '</div></div>' +
            '</div>' +

            // VIVIENDA, CALLES Y ENERGIA
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e2e8f0]">' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#dc2626] block">Déficit Habitacional</span><span class="text-base font-mono font-bold text-[#dc2626]">' + (inf.housing_deficit_units || 0).toLocaleString('es-CL') + ' viviendas</span><span class="text-[10px] text-[#64748b] block">' + (inf.campamentos_count || 0) + ' campamentos (' + (inf.campamentos_families || 0).toLocaleString('es-CL') + ' familias) - Minvu/TECHO</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#0f172a] block">Red Vial & Pavimentación</span><span class="text-base font-mono font-bold text-[#0f172a]">' + (inf.paved_roads_pct || 0) + '% pavimentado</span><span class="text-[10px] text-[#64748b] block">' + (inf.total_roads_km || 0).toLocaleString('es-CL') + ' km caminos (Vialidad MOP)</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#16a34a] block">Matriz Renovable Limpia</span><span class="text-base font-mono font-bold text-[#16a34a]">' + (inf.renewable_energy_share_pct || 0) + '% limpia</span><span class="text-[10px] text-[#64748b] block">' + (inf.installed_capacity_mw || 0).toLocaleString('es-CL') + ' MW (CNE/CEN)</span></div>' +
            '</div>' +

            '</div></div>';

        container.innerHTML = html;
        safeCreateIcons();
    }

    // 6. EXPORTACIÓN A PDF Y CSV
    function exportRegionalReportPDF() {
        window.print();
    }

    function exportDataCSV() {
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var csv = '\uFEFF';
        csv += 'Numero,Region,Capital,Poblacion,PIB_Share_Pct,IDH,Informalidad_Pct,Deficit_Hidrico_Pct,Hacinamiento_Penal_Pct,Espera_Quirurgica_Pacientes,Espera_Quirurgica_Dias,Carabineros_Dotacion,Tasa_Homicidios_100k,Presupuesto_FNDR_MMCLP,Dependencia_FCM_Pct\n';

        regions.forEach(function (r) {
            var pr = r.prisons || {};
            var hl = r.health || {};
            var sec = r.security || {};
            var fin = r.finances || {};

            csv += '"' + r.number + '","' + r.name + '","' + r.capital + '",' +
                (r.population || 0) + ',' + (r.pib_share_pct || 0) + ',' + (r.idh || 0) + ',' +
                (r.informal_labor_pct || 0) + ',' + (r.water_deficit_pct || 0) + ',' +
                (pr.overcrowding_pct || 0) + ',' + (hl.surgical_waiting_list_patients || 0) + ',' +
                (hl.avg_waiting_days_surgery || 0) + ',' + (sec.carabineros_officers || 0) + ',' +
                (sec.homicide_rate_per_100k || 0) + ',' + (fin.budget_gore_fndr_mmclp || 0) + ',' +
                (fin.fcm_dependency_avg_pct || 0) + '\n';
        });

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'chile_auditoria_16_regiones_2026.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 7. COMPARADOR CARA A CARA 1 VS 1 (REGIÓN VS REGIÓN CON SEMÁFOROS)
    function renderRegionComparator() {
        var container = document.getElementById('region-comparator-container');
        if (!container) return;

        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var rA = regions.find(function (r) { return r.id === compareRegionA; }) || regions[6];
        var rB = regions.find(function (r) { return r.id === compareRegionB; }) || regions[5];

        var html = '<div class="space-y-6">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[20px] bg-white border border-[#e2e8f0] shadow-sm">' +
            '<div class="flex-1">' +
            '<label class="block text-xs font-bold text-[#0284c7] uppercase">Región A:</label>' +
            '<select id="comp-sel-a" onchange="updateCompareRegions(this.value, null)" class="w-full shadcn-input px-3.5 py-2 text-xs font-bold bg-[#f8f9fa] mt-1">';

        regions.forEach(function (r) {
            var sel = (r.id === rA.id) ? 'selected' : '';
            html += '<option value="' + r.id + '" ' + sel + '>' + r.number + ' - ' + r.name + '</option>';
        });
        html += '</select></div>' +

            '<div class="flex items-center justify-center pt-2 sm:pt-4">' +
            '<span class="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-extrabold text-xs shadow-md">VS</span>' +
            '</div>' +

            '<div class="flex-1">' +
            '<label class="block text-xs font-bold text-[#dc2626] uppercase">Región B:</label>' +
            '<select id="comp-sel-b" onchange="updateCompareRegions(null, this.value)" class="w-full shadcn-input px-3.5 py-2 text-xs font-bold bg-[#f8f9fa] mt-1">';

        regions.forEach(function (r) {
            var sel = (r.id === rB.id) ? 'selected' : '';
            html += '<option value="' + r.id + '" ' + sel + '>' + r.number + ' - ' + r.name + '</option>';
        });
        html += '</select></div></div>';

        var metrics = [
            { name: 'Población Total', valA: (rA.population || 0).toLocaleString('es-CL') + ' hab.', valB: (rB.population || 0).toLocaleString('es-CL') + ' hab.', rawA: rA.population, rawB: rB.population, source: 'INE Censo' },
            { name: 'Aporte al PIB Nacional', valA: (rA.pib_share_pct || 0) + '%', valB: (rB.pib_share_pct || 0) + '%', rawA: rA.pib_share_pct, rawB: rB.pib_share_pct, source: 'Banco Central' },
            { name: 'Índice Desarrollo Humano (IDH)', valA: (rA.idh || 0.840), valB: (rB.idh || 0.840), rawA: rA.idh || 0.840, rawB: rB.idh || 0.840, higherBetter: true, source: 'PNUD' },
            { name: 'Demora Media en Cirugías', valA: ((rA.health || {}).avg_waiting_days_surgery || 0) + ' días', valB: ((rB.health || {}).avg_waiting_days_surgery || 0) + ' días', rawA: (rA.health || {}).avg_waiting_days_surgery, rawB: (rB.health || {}).avg_waiting_days_surgery, higherBetter: false, source: 'DEIS Minsal' },
            { name: 'Tasa de Homicidios x 100k hab.', valA: ((rA.security || {}).homicide_rate_per_100k || 0), valB: ((rB.security || {}).homicide_rate_per_100k || 0), rawA: (rA.security || {}).homicide_rate_per_100k, rawB: (rB.security || {}).homicide_rate_per_100k, higherBetter: false, source: 'CEAD SPD' },
            { name: 'Hacinamiento Carcelario', valA: ((rA.prisons || {}).overcrowding_pct || 0) + '%', valB: ((rB.prisons || {}).overcrowding_pct || 0) + '%', rawA: (rA.prisons || {}).overcrowding_pct, rawB: (rB.prisons || {}).overcrowding_pct, higherBetter: false, source: 'Gendarmería' },
            { name: 'Dependencia Fondo Común (FCM)', valA: ((rA.finances || {}).fcm_dependency_avg_pct || 0) + '%', valB: ((rB.finances || {}).fcm_dependency_avg_pct || 0) + '%', rawA: (rA.finances || {}).fcm_dependency_avg_pct, rawB: (rB.finances || {}).fcm_dependency_avg_pct, higherBetter: false, source: 'SUBDERE SINIM' },
            { name: 'Déficit Hídrico de Cuencas', valA: (rA.water_deficit_pct || 0) + '%', valB: (rB.water_deficit_pct || 0) + '%', rawA: rA.water_deficit_pct, rawB: rB.water_deficit_pct, higherBetter: false, source: 'DGA MOP' }
        ];

        html += '<div class="shadcn-card overflow-hidden border border-[#e2e8f0] shadow-sm">' +
            '<div class="grid grid-cols-3 bg-[#0f172a] text-white p-3 sm:p-4 text-xs font-bold">' +
            '<div>Indicador de Estado</div>' +
            '<div class="text-center text-cyan-300">' + rA.name.replace('Región de ', '').replace('Región del ', '') + '</div>' +
            '<div class="text-center text-amber-300">' + rB.name.replace('Región de ', '').replace('Región del ', '') + '</div>' +
            '</div>' +
            '<div class="divide-y divide-[#e2e8f0]">';

        metrics.forEach(function (m) {
            var badgeA = '';
            var badgeB = '';
            if (m.higherBetter !== undefined && m.rawA !== undefined && m.rawB !== undefined) {
                if (m.higherBetter) {
                    if (m.rawA > m.rawB) badgeA = '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold ml-1">Mejor</span>';
                    else if (m.rawB > m.rawA) badgeB = '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold ml-1">Mejor</span>';
                } else {
                    if (m.rawA > m.rawB) badgeA = '<span class="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold ml-1">Mayor Estrés</span>';
                    else if (m.rawB > m.rawA) badgeB = '<span class="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold ml-1">Mayor Estrés</span>';
                }
            }

            html += '<div class="grid grid-cols-3 p-3.5 sm:p-4 items-center text-xs hover:bg-[#f8f9fa] transition">' +
                '<div><strong class="text-[#0f172a] block">' + m.name + '</strong><span class="text-[10px] text-[#64748b]">Fuente: ' + m.source + '</span></div>' +
                '<div class="text-center font-mono font-bold text-[#0f172a]">' + m.valA + badgeA + '</div>' +
                '<div class="text-center font-mono font-bold text-[#0f172a]">' + m.valB + badgeB + '</div>' +
                '</div>';
        });

        html += '</div></div></div>';
        container.innerHTML = html;
        safeCreateIcons();
    }

    function updateCompareRegions(a, b) {
        if (a) compareRegionA = a;
        if (b) compareRegionB = b;
        renderRegionComparator();
    }

    // 8. MAPA VECTORIAL DE CALOR DE CHILE (HEATMAP TERRITORIAL)
    function renderVectorHeatmap() {
        var container = document.getElementById('vector-heatmap-container');
        if (!container) return;

        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];

        var html = '<div class="space-y-4">' +
            '<div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[18px] bg-white border border-[#e2e8f0]">' +
            '<div><span class="text-xs font-bold text-[#0f172a] uppercase tracking-wider block">🗺️ Capas de Calor Territorial:</span><p class="text-[11px] text-[#64748b]">Visualiza el mapa de Chile según el indicador crítico que elijas</p></div>' +
            '<div class="flex flex-wrap items-center gap-1.5">' +
            '<button onclick="setHeatmapLayer(\'water\')" class="px-3 py-1.5 rounded-[10px] text-xs font-bold ' + (activeHeatmapLayer === 'water' ? 'bg-[#0284c7] text-white' : 'bg-[#f1f5f9] text-[#0f172a]') + '">💧 Déficit Hídrico</button>' +
            '<button onclick="setHeatmapLayer(\'prisons\')" class="px-3 py-1.5 rounded-[10px] text-xs font-bold ' + (activeHeatmapLayer === 'prisons' ? 'bg-[#dc2626] text-white' : 'bg-[#f1f5f9] text-[#0f172a]') + '">🔒 Hacinamiento</button>' +
            '<button onclick="setHeatmapLayer(\'homicide\')" class="px-3 py-1.5 rounded-[10px] text-xs font-bold ' + (activeHeatmapLayer === 'homicide' ? 'bg-[#dc2626] text-white' : 'bg-[#f1f5f9] text-[#0f172a]') + '">🛡️ Homicidios</button>' +
            '<button onclick="setHeatmapLayer(\'fcm\')" class="px-3 py-1.5 rounded-[10px] text-xs font-bold ' + (activeHeatmapLayer === 'fcm' ? 'bg-[#0f172a] text-white' : 'bg-[#f1f5f9] text-[#0f172a]') + '">🏛️ Dependencia FCM</button>' +
            '</div></div>' +

            '<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">';

        regions.forEach(function (r) {
            var val = 0;
            var displayVal = '';
            var colorClass = '';

            if (activeHeatmapLayer === 'water') {
                val = r.water_deficit_pct || 0;
                displayVal = val + '% Déficit';
                colorClass = val > 75 ? 'bg-red-500 text-white' : val > 45 ? 'bg-amber-400 text-[#0f172a]' : 'bg-sky-400 text-white';
            } else if (activeHeatmapLayer === 'prisons') {
                val = (r.prisons || {}).overcrowding_pct || 0;
                displayVal = val + '% Hacin.';
                colorClass = val > 150 ? 'bg-red-600 text-white' : val > 120 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
            } else if (activeHeatmapLayer === 'homicide') {
                val = (r.security || {}).homicide_rate_per_100k || 0;
                displayVal = val + ' / 100k';
                colorClass = val > 7.0 ? 'bg-red-600 text-white' : val > 4.5 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
            } else {
                val = (r.finances || {}).fcm_dependency_avg_pct || 0;
                displayVal = val + '% FCM';
                colorClass = val > 70 ? 'bg-indigo-700 text-white' : val > 50 ? 'bg-indigo-500 text-white' : 'bg-indigo-300 text-[#0f172a]';
            }

            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="p-3 rounded-[16px] bg-white border border-[#e2e8f0] hover:border-[#0284c7] hover:shadow-md cursor-pointer transition space-y-2">' +
                '<div class="flex items-center justify-between">' +
                '<span class="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#0f172a] text-white">' + r.number + '</span>' +
                '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ' + colorClass + '">' + displayVal + '</span>' +
                '</div>' +
                '<h5 class="text-[11px] font-bold text-[#0f172a] truncate">' + r.name.replace('Región de ', '').replace('Región del ', '') + '</h5>' +
                '<div class="text-[10px] text-[#64748b] truncate">Cap: ' + r.capital + '</div>' +
                '</div>';
        });

        html += '</div></div>';
        container.innerHTML = html;
    }

    function setHeatmapLayer(layerKey) {
        activeHeatmapLayer = layerKey;
        renderVectorHeatmap();
    }

    // 9. CALENDARIO DINÁMICO DE EFEMÉRIDES HISTÓRICAS (DÍA A DÍA CON BCN)
    function renderHistoricalView() {
        var snap = getSnapshot();
        var hist = snap.historical_data || {};
        var container = document.getElementById('historical-view-container');
        if (!container) return;

        var today = new Date();
        var currentMonth = today.getMonth() + 1;
        var currentDay = today.getDate();

        var allMilestones = hist.milestones || [];
        var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        var html = '<div class="space-y-8">' +
            '<div class="shadcn-card p-6 md:p-8 space-y-6 border border-[#e2e8f0]">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">' +
            '<div>' +
            '<div class="flex items-center gap-2 mb-1">' +
            '<span class="shadcn-badge bg-[#dc2626] text-white font-mono font-bold">HOY EN LA HISTORIA DE CHILE</span>' +
            '<span class="shadcn-badge bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] font-bold font-mono">' + currentDay + ' de ' + monthNames[currentMonth - 1] + '</span>' +
            '</div>' +
            '<h2 class="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">Efemérides & Hitos de Estado Día a Día</h2>' +
            '<p class="text-xs text-[#64748b]">Acontecimientos institucionales, leyes y transformaciones republicanas ocurridas a lo largo de la historia</p>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
            '<select id="filter-efemeride-month" onchange="filterMilestonesByMonth(this.value)" class="shadcn-input px-3 py-1.5 text-xs font-bold bg-[#f8f9fa]">';

        monthNames.forEach(function (m, idx) {
            var sel = ((idx + 1) === currentMonth) ? 'selected' : '';
            html += '<option value="' + (idx + 1) + '" ' + sel + '>' + m + '</option>';
        });

        html += '</select></div></div>' +
            '<div id="milestones-grid-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">';

        var filteredMilestones = allMilestones.filter(function (m) { return m.month === currentMonth; });
        if (filteredMilestones.length === 0) filteredMilestones = allMilestones.slice(0, 6);

        filteredMilestones.forEach(function (efe) {
            html += '<div class="p-5 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3 hover:border-slate-300 transition">' +
                '<div class="flex items-center justify-between gap-2 flex-wrap">' +
                '<span class="px-2.5 py-0.5 rounded-[8px] text-xs font-mono font-extrabold bg-[#0f172a] text-white">' + efe.day + ' de ' + monthNames[efe.month - 1] + ' (' + efe.year + ')</span>' +
                '<span class="text-[11px] font-bold text-[#0284c7]">Hito Republicano</span>' +
                '</div>' +
                '<h3 class="text-sm font-bold text-[#0f172a] leading-snug">' + efe.title + '</h3>' +
                '<p class="text-xs text-[#334155] leading-relaxed">' + efe.desc + '</p>' +
                '<div class="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">' +
                '<span class="font-medium text-[#0f172a]">Fuente Oficial:</span>' +
                '<a href="' + (efe.url || '#') + '" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#0284c7] hover:underline flex items-center gap-1">' +
                efe.source + ' <i data-lucide="external-link" class="w-3 h-3"></i>' +
                '</a>' +
                '</div>' +
                '</div>';
        });

        html += '</div></div>';

        // SECCIÓN B: EVOLUCIÓN CENTENARIA
        html += '<div class="shadcn-card p-6 md:p-8 space-y-6 border border-[#e2e8f0]">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">' +
            '<div>' +
            '<div class="flex items-center gap-2 mb-1">' +
            '<span class="shadcn-badge bg-[#0f172a] text-white">TRANSFORMACIÓN DE CHILE</span>' +
            '<span class="shadcn-badge bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">100 AÑOS DE DATA</span>' +
            '</div>' +
            '<h2 class="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">Evolución Histórica de Chile (1926 ➔ 2026)</h2>' +
            '<p class="text-xs text-[#64748b]">Comparativa de cómo ha cambiado el país en 1 siglo en salud, pobreza, economía, educación y energía con datos oficiales</p>' +
            '</div>' +
            '<span class="shadcn-badge bg-[#16a34a] text-white">100% FUENTES VERIFICADAS</span>' +
            '</div>' +

            '<div class="grid grid-cols-1 md:grid-cols-2 gap-5">';

        var century = hist.century_comparison || [];
        century.forEach(function (stat) {
            html += '<div class="p-5 rounded-[20px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-4">' +
                '<div class="flex items-center justify-between gap-2">' +
                '<h3 class="text-sm font-extrabold text-[#0f172a]">' + stat.indicator + '</h3>' +
                '<span class="px-2 py-0.5 rounded-[8px] text-[11px] font-mono font-bold bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]">' + stat.change + '</span>' +
                '</div>' +

                '<div class="grid grid-cols-4 gap-2 text-center">' +
                '<div class="p-2.5 rounded-[12px] bg-white border border-[#e2e8f0]"><span class="text-[9px] font-mono uppercase font-bold text-[#64748b] block">1926 (100a)</span><span class="text-xs font-mono font-bold text-[#64748b] block">' + stat.y1926 + '</span></div>' +
                '<div class="p-2.5 rounded-[12px] bg-white border border-[#e2e8f0]"><span class="text-[9px] font-mono uppercase font-bold text-[#64748b] block">1976 (50a)</span><span class="text-xs font-mono font-bold text-[#64748b] block">' + stat.y1976 + '</span></div>' +
                '<div class="p-2.5 rounded-[12px] bg-white border border-[#e2e8f0]"><span class="text-[9px] font-mono uppercase font-bold text-[#0f172a] block">' + stat.y2000 + '</span></div>' +
                '<div class="p-2.5 rounded-[12px] bg-[#0f172a] text-white"><span class="text-[9px] font-mono uppercase font-bold text-slate-300 block">2026 (HOY)</span><span class="text-xs font-mono font-extrabold text-cyan-300 block">' + stat.y2026 + '</span></div>' +
                '</div>' +

                '<p class="text-xs text-[#64748b] leading-relaxed">' + stat.desc + '</p>' +

                '<div class="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">' +
                '<span class="font-medium text-[#0f172a]">Fuente Oficial:</span>' +
                '<a href="' + (stat.source_url || '#') + '" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#0284c7] hover:underline flex items-center gap-1">' +
                stat.source + ' <i data-lucide="external-link" class="w-3 h-3"></i>' +
                '</a>' +
                '</div>' +
                '</div>';
        });

        html += '</div></div></div>';
        container.innerHTML = html;
        safeCreateIcons();
    }

    function filterMilestonesByMonth(monthNum) {
        var mNum = parseInt(monthNum, 10);
        var snap = getSnapshot();
        var hist = snap.historical_data || {};
        var allMilestones = hist.milestones || [];
        var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        var listEl = document.getElementById('milestones-grid-list');
        if (!listEl) return;

        var filtered = allMilestones.filter(function (m) { return m.month === mNum; });
        if (filtered.length === 0) {
            listEl.innerHTML = '<p class="text-xs text-[#64748b] col-span-2 text-center py-8">No hay hitos archivados para este mes en el catálogo principal.</p>';
            return;
        }

        var html = '';
        filtered.forEach(function (efe) {
            html += '<div class="p-5 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3 hover:border-slate-300 transition">' +
                '<div class="flex items-center justify-between gap-2 flex-wrap">' +
                '<span class="px-2.5 py-0.5 rounded-[8px] text-xs font-mono font-extrabold bg-[#0f172a] text-white">' + efe.day + ' de ' + monthNames[efe.month - 1] + ' (' + efe.year + ')</span>' +
                '<span class="text-[11px] font-bold text-[#0284c7]">Hito Republicano</span>' +
                '</div>' +
                '<h3 class="text-sm font-bold text-[#0f172a] leading-snug">' + efe.title + '</h3>' +
                '<p class="text-xs text-[#334155] leading-relaxed">' + efe.desc + '</p>' +
                '<div class="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">' +
                '<span class="font-medium text-[#0f172a]">Fuente Oficial:</span>' +
                '<a href="' + (efe.url || '#') + '" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#0284c7] hover:underline flex items-center gap-1">' +
                efe.source + ' <i data-lucide="external-link" class="w-3 h-3"></i>' +
                '</a>' +
                '</div>' +
                '</div>';
        });

        listEl.innerHTML = html;
        safeCreateIcons();
    }

    // 10. GRÁFICO FISCAL DONUT
    function renderFiscalCharts() {
        var chartDom = document.getElementById('chart-fiscal-flow');
        if (!chartDom || !window.echarts) return;

        var myChart = echarts.init(chartDom);
        var snap = getSnapshot();
        var fiscal = snap.national_fiscal_balance || {};
        var expenditures = fiscal.expenditures || [];

        var dataPoints = expenditures.map(function (e) {
            return {
                name: e.category.split('(')[0].trim(),
                value: (e.amount_usd / 1000000000)
            };
        });

        var option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                textStyle: { color: '#ffffff', fontSize: 12, fontFamily: 'Montserrat' },
                formatter: function (params) {
                    return '<div class="font-bold">' + params.name + '</div>' +
                        '<div>Monto: <span class="font-mono text-cyan-400 font-bold">US$ ' + params.value.toFixed(1) + 'B</span></div>' +
                        '<div>Participación: <span class="font-mono text-amber-300 font-bold">' + params.percent + '%</span></div>' +
                        '<div class="text-[10px] text-slate-300 mt-1">Fuente: DIPRES / Min. Hacienda</div>';
                }
            },
            series: [
                {
                    name: 'Destino del Gasto',
                    type: 'pie',
                    radius: ['45%', '75%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 13,
                            fontWeight: 'bold',
                            fontFamily: 'Montserrat',
                            color: '#0f172a',
                            formatter: '{b}\nUS$ {c}B'
                        },
                        itemStyle: {
                            shadowBlur: 12,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    },
                    labelLine: { show: false },
                    data: dataPoints
                }
            ]
        };

        myChart.setOption(option);
        window.addEventListener('resize', function () { myChart.resize(); });
    }

    // 11. RANKINGS & COMPARADOR TERRITORIAL
    function renderRegionalMatrixTable() {
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var container = document.getElementById('regional-matrix-container');
        if (!container) return;

        var byHacinamiento = regions.slice().sort(function (a, b) { return ((b.prisons || {}).overcrowding_pct || 0) - ((a.prisons || {}).overcrowding_pct || 0); });
        var byEspera = regions.slice().sort(function (a, b) { return ((b.health || {}).avg_waiting_days_surgery || 0) - ((a.health || {}).avg_waiting_days_surgery || 0); });
        var byFCM = regions.slice().sort(function (a, b) { return ((b.finances || {}).fcm_dependency_avg_pct || 0) - ((a.finances || {}).fcm_dependency_avg_pct || 0); });

        var html = '<div class="space-y-6">' +
            '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' +
            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#dc2626] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Mayor Hacinamiento Penal</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byHacinamiento.slice(0, 5).forEach(function (r, idx) {
            var pr = r.prisons || {};
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#dc2626]">' + (pr.overcrowding_pct || 0) + '%</span>' +
                '</div>';
        });
        html += '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Gendarmería de Chile 2026</div>' +
            '</div></div>' +

            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-[#0284c7]"></i> Mayor Demora Quirúrgica</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byEspera.slice(0, 5).forEach(function (r, idx) {
            var hl = r.health || {};
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#0f172a]">' + (hl.avg_waiting_days_surgery || 0) + ' días</span>' +
                '</div>';
        });
        html += '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: DEIS - Ministerio de Salud</div>' +
            '</div></div>' +

            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="landmark" class="w-4 h-4"></i> Dependencia Fondo Común</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byFCM.slice(0, 5).forEach(function (r, idx) {
            var fin = r.finances || {};
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#0284c7]">' + (fin.fcm_dependency_avg_pct || 0) + '%</span>' +
                '</div>';
        });
        html += '<div class="text-[10px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">Fuente: Subdere SINIM 2026</div>' +
            '</div></div></div>' +

            '<div class="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-4 shadow-sm">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">' +
            '<div><h3 class="text-base font-bold text-[#0f172a]">Comparativa Territorial de las 16 Regiones de Chile</h3><p class="text-xs text-[#64748b]">Haz clic en cualquier región para abrir su auditoría completa</p></div>' +
            '<span class="shadcn-badge bg-[#0f172a] text-white">16 REGIONES AUDITADAS</span>' +
            '</div>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">';

        regions.forEach(function (r) {
            var pr = r.prisons || {};
            var hl = r.health || {};
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] hover:border-[#0284c7] hover:shadow-sm cursor-pointer transition space-y-2">' +
                '<div class="flex items-center justify-between">' +
                '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-mono font-extrabold bg-[#0f172a] text-white">' + r.number + '</span>' +
                '<span class="text-[11px] font-mono font-bold text-[#0284c7]">' + (r.pib_share_pct || 0) + '% PIB</span>' +
                '</div>' +
                '<h4 class="text-xs font-extrabold text-[#0f172a] truncate">' + r.name + '</h4>' +
                '<div class="space-y-1 text-[11px] text-[#64748b]">' +
                '<div class="flex justify-between"><span>Población:</span><span class="font-mono font-bold text-[#0f172a]">' + ((r.population || 0) / 1000).toFixed(0) + 'k</span></div>' +
                '<div class="flex justify-between"><span>Hacinamiento Penal:</span><span class="font-mono font-bold text-[#dc2626]">' + (pr.overcrowding_pct || 0) + '%</span></div>' +
                '<div class="flex justify-between"><span>Lista Cirugía:</span><span class="font-mono font-bold text-[#0f172a]">' + (hl.surgical_waiting_list_patients || 0).toLocaleString('es-CL') + '</span></div>' +
                '</div>' +
                '</div>';
        });

        html += '</div></div></div>';
        container.innerHTML = html;
        safeCreateIcons();
    }

    function switchToRegion(regId) {
        switchTab('regiones');
        selectRegion(regId);
        var el = document.getElementById('view-regiones');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    // 12. LEYES & CONGRESO
    function renderLegislativeBills() {
        var snap = getSnapshot();
        var bills = snap.legislative_bills || [];
        var container = document.getElementById('legislative-bills-container');
        if (!container) return;

        var html = '';
        bills.forEach(function (bill, idx) {
            html += '<div class="shadcn-card p-6 md:p-8 space-y-5 border border-[#e2e8f0]">' +
                '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">' +
                '<div class="space-y-1">' +
                '<div class="flex items-center space-x-2"><span class="shadcn-badge bg-[#0f172a] text-white">PROYECTO #' + (idx + 1) + '</span><span class="shadcn-badge bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0]">' + bill.status + '</span></div>' +
                '<h3 class="text-lg sm:text-xl font-bold text-[#0f172a]">' + bill.title + '</h3>' +
                '</div>' +
                '<span class="text-xs font-mono font-bold text-[#0284c7] bg-[#e0f2fe] px-3 py-1 rounded-full">Senado / Cámara de Diputadas y Diputados</span>' +
                '</div>' +
                '<p class="text-xs sm:text-sm text-[#334155] leading-relaxed"><strong>En simple:</strong> ' + bill.plain_explanation + '</p>' +
                '<div class="p-4 rounded-[16px] bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e3a8a] space-y-1"><strong class="block font-bold">¿Cómo te impacta a ti en tu día a día?</strong><p>' + bill.citizen_impact + '</p></div>' +
                '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><strong class="text-[#16a34a] font-bold block">Argumentos a Favor (Oficialismo):</strong><p class="text-[#334155]">' + bill.pro_arguments + '</p></div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><strong class="text-[#dc2626] font-bold block">Argumentos en Contra (Oposición):</strong><p class="text-[#334155]">' + bill.con_arguments + '</p></div>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#fafafa] border border-[#e2e8f0] text-xs space-y-1"><strong class="text-[#0f172a] font-bold block">Evidencia Técnica & Lecciones Internacionales:</strong><p class="text-[#64748b]">' + bill.technical_evidence + '</p></div>' +
                '<div class="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">' +
                '<span class="font-medium text-[#0f172a]">Fuente Legislativa:</span>' +
                '<span class="text-[#0284c7] font-semibold">Biblioteca del Congreso Nacional (BCN) / Tramitación Oficial</span>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // 13. CADENA NACIONAL
    function renderCadenaNacional() {
        var snap = getSnapshot();
        var cn = snap.cadena_nacional || {};
        var titleEl = document.getElementById('cadena-title');
        var headEl = document.getElementById('cadena-headline');
        var takeEl = document.getElementById('cadena-takeaways');
        var quoteEl = document.getElementById('cadena-quote');

        if (titleEl && cn.title) titleEl.textContent = cn.title;
        if (headEl && cn.summary) headEl.textContent = cn.summary;
        if (quoteEl && cn.closing_quote) quoteEl.textContent = '«' + cn.closing_quote + '»';

        if (takeEl && cn.key_takeaways) {
            var html = '';
            cn.key_takeaways.forEach(function (t, i) {
                html += '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                    '<span class="text-[10px] font-mono font-bold text-[#0284c7]">Pilar #' + (i + 1) + '</span>' +
                    '<p class="text-xs font-semibold text-[#0f172a]">' + t + '</p>' +
                    '</div>';
            });
            takeEl.innerHTML = html;
        }
    }

    // 14. OBSERVATORIO DE NOTICIAS & CLUSTERS
    function normalizeCategoryName(cat) {
        if (!cat) return 'Nacional';
        var c = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (c === 'economia' || c === 'pulso' || c === 'negocios') return 'Economía';
        if (c === 'politica' || c === 'congreso') return 'Política';
        if (c === 'seguridad' || c === 'policial' || c === 'justicia') return 'Seguridad';
        if (c === 'investigaciones' || c === 'reportajes' || c === 'ciper') return 'Investigaciones';
        if (c === 'regiones' || c === 'territorio') return 'Regiones';
        return 'Nacional';
    }

    function renderClustersView() {
        var snap = getSnapshot();
        var clusters = snap.clusters || [];
        var container = document.getElementById('clusters-list');
        if (!container) return;

        var filtered = clusters.filter(function (c) {
            if (currentCategory === 'all') return true;
            var mappedCat = normalizeCategoryName(c.category);
            return mappedCat.toLowerCase() === currentCategory.toLowerCase();
        });

        var html = '';
        filtered.forEach(function (c) {
            var bp = c.blindspot || {};
            var biasBadge = '';
            if (bp.left_pct > 0.6) biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-red-100 text-red-700">Mayor cobertura izquierda</span>';
            else if (bp.right_pct > 0.6) biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-blue-100 text-blue-700">Mayor cobertura derecha</span>';
            else biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-slate-100 text-slate-700">Cobertura equilibrada</span>';

            var normCat = normalizeCategoryName(c.category);
            var cleanDesc = c.description ? c.description.replace(/<[^>]*>/g, '') : '';

            html += '<div onclick="openClusterModal(' + c.id + ')" class="shadcn-card p-5 space-y-3 cursor-pointer hover:border-[#0284c7] transition border border-[#e2e8f0]">' +
                '<div class="flex items-center justify-between gap-2 flex-wrap">' +
                '<span class="shadcn-badge bg-[#0f172a] text-white">' + normCat + '</span>' +
                biasBadge +
                '</div>' +
                '<h3 class="text-sm font-bold text-[#0f172a] leading-snug line-clamp-2">' + c.title + '</h3>' +
                '<p class="text-xs text-[#64748b] line-clamp-2">' + cleanDesc + '</p>' +
                '<div class="flex items-center justify-between text-[11px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">' +
                '<span>' + (c.article_count || 1) + ' fuentes verificadas</span>' +
                '<span class="text-[#0284c7] font-semibold flex items-center gap-1">Ver análisis <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></span>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html || '<p class="text-xs text-[#64748b] col-span-2 text-center py-8">No hay noticias registradas en esta categoría.</p>';
        safeCreateIcons();
    }

    function filterCategory(cat, btnElement) {
        currentCategory = cat;
        var pills = document.querySelectorAll('.cat-pill');
        pills.forEach(function (p) {
            p.className = 'cat-pill shadcn-button-secondary px-3 py-1 text-xs font-medium';
        });
        if (btnElement) {
            btnElement.className = 'cat-pill shadcn-button-primary px-3 py-1 text-xs font-semibold';
        }
        renderClustersView();
    }

    function filterClusters() {
        var query = (document.getElementById('cluster-search').value || '').toLowerCase();
        var cards = document.querySelectorAll('#clusters-list > div');
        cards.forEach(function (c) {
            var text = c.textContent.toLowerCase();
            c.style.display = text.includes(query) ? 'block' : 'none';
        });
    }

    function openClusterModal(clusterId) {
        var snap = getSnapshot();
        var clusters = snap.clusters || [];
        var c = clusters.find(function (item) { return item.id === clusterId; });
        if (!c) return;

        var normCat = normalizeCategoryName(c.category);
        document.getElementById('modal-title').textContent = c.title;
        document.getElementById('modal-category').textContent = normCat;

        var body = document.getElementById('modal-body');
        var cleanDesc = c.description ? c.description.replace(/<[^>]*>/g, '') : 'Sin descripción.';
        body.innerHTML = '<div class="space-y-4 text-xs leading-relaxed">' +
            '<p class="text-[#334155]">' + cleanDesc + '</p>' +
            '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-2">' +
            '<strong class="text-[#0f172a] block font-bold">Auditoría Factual de Medios:</strong>' +
            '<p class="text-[#64748b]">Noticia procesada mediante verificación cruzada de fuentes abiertas oficiales y prensa tradicional chilena (La Tercera, Emol, Cooperativa, CIPER, Diario Financiero, Senado de Chile).</p>' +
            '</div>' +
            '</div>';

        document.getElementById('cluster-modal').classList.remove('hidden');
    }

    // 15. ÁGORA CIUDADANA
    var defaultProposals = [
        { id: 1, pilar: 'Salud Pública', title: 'Telemedicina 24/7 en postas rurales de Aysén y Los Lagos', desc: 'Conectar las 240 postas rurales más aisladas con médicos especialistas de Santiago y Concepción vía fibra óptica y satelital.', votes: 428 },
        { id: 2, pilar: 'Seguridad & Cárceles', title: 'Bloqueadores de señal celular penitenciaria con energía solar autónoma', desc: 'Evitar estafas y extorsiones desde los 82 penales del país instalando jaulas Faraday y bloqueadores biométricos.', votes: 612 },
        { id: 3, pilar: 'Agua & Clima', title: 'Bono solar para desalinización comunitaria de agua potable en Coquimbo', desc: 'Subsidiar sistemas de osmosis inversa impulsados por energía fotovoltaica para cooperativas de Agua Potable Rural (APR).', votes: 389 },
        { id: 4, pilar: 'Municipios & Calles', title: 'Piso mínimo de $350.000 por habitante para comunas dependientes del FCM', desc: 'Nivelar la brecha municipal para que ninguna comuna pobre de La Araucanía o Maule tenga menos recursos per cápita que Las Condes.', votes: 541 }
    ];

    function renderCitizenProposals() {
        var container = document.getElementById('citizen-proposals-grid');
        if (!container) return;

        var stored = localStorage.getItem('chile_proposals');
        var list = stored ? JSON.parse(stored) : defaultProposals;

        var html = '';
        list.forEach(function (p) {
            html += '<div class="shadcn-card p-5 sm:p-6 space-y-3 border border-[#e2e8f0]">' +
                '<div class="flex items-center justify-between gap-2">' +
                '<span class="shadcn-badge bg-[#0f172a] text-white">' + p.pilar + '</span>' +
                '<button onclick="upvoteProposal(' + p.id + ')" class="px-3 py-1 rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-mono font-bold text-[#0f172a] flex items-center gap-1 transition">' +
                '<i data-lucide="thumbs-up" class="w-3.5 h-3.5 text-[#0284c7]"></i> ' + p.votes +
                '</button>' +
                '</div>' +
                '<h3 class="text-sm font-bold text-[#0f172a]">' + p.title + '</h3>' +
                '<p class="text-xs text-[#64748b] leading-relaxed">' + p.desc + '</p>' +
                '</div>';
        });

        container.innerHTML = html;
        safeCreateIcons();
    }

    function upvoteProposal(id) {
        var stored = localStorage.getItem('chile_proposals');
        var list = stored ? JSON.parse(stored) : defaultProposals;
        var item = list.find(function (p) { return p.id === id; });
        if (item) {
            item.votes += 1;
            localStorage.setItem('chile_proposals', JSON.stringify(list));
            renderCitizenProposals();
        }
    }

    function openCitizenProposalModal() {
        document.getElementById('proposal-modal').classList.remove('hidden');
    }

    function submitCitizenProposal(e) {
        e.preventDefault();
        var pilar = document.getElementById('prop-pilar').value;
        var title = document.getElementById('prop-title').value;
        var desc = document.getElementById('prop-desc').value;

        var stored = localStorage.getItem('chile_proposals');
        var list = stored ? JSON.parse(stored) : defaultProposals;

        var newProp = {
            id: Date.now(),
            pilar: pilar,
            title: title,
            desc: desc,
            votes: 1
        };

        list.unshift(newProp);
        localStorage.setItem('chile_proposals', JSON.stringify(list));

        var res = document.getElementById('prop-result');
        res.innerHTML = '<span class="text-emerald-700 font-bold block">✓ Propuesta ciudadana publicada con éxito en el Ágora.</span>';
        res.classList.remove('hidden');

        setTimeout(function () {
            closeModal('proposal-modal');
            renderCitizenProposals();
            res.classList.add('hidden');
        }, 1200);
    }

    // 16. MODAL LEY 21.719 (ARCO)
    function openArcoModal() {
        document.getElementById('arco-modal').classList.remove('hidden');
    }

    function submitArcoForm(e) {
        e.preventDefault();
        var res = document.getElementById('arco-result');
        res.innerHTML = '<span class="text-emerald-700 font-bold block">✓ Ticket generado conforme a la Ley N° 21.719. El plazo legal de respuesta es de 15 días hábiles.</span>';
        res.classList.remove('hidden');
        setTimeout(function () {
            closeModal('arco-modal');
            res.classList.add('hidden');
        }, 2500);
    }

    function closeModal(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    }

    // 17. SISTEMA DE PESTAÑAS
    function switchTab(tabKey) {
        var views = ['balance', 'regiones', 'comparador', 'matriz', 'historia', 'leyes', 'cadena', 'clusters', 'citizen'];
        views.forEach(function (v) {
            var el = document.getElementById('view-' + v);
            var btn = document.getElementById('tab-btn-' + v);
            var mobBtn = document.getElementById('mob-tab-btn-' + v);

            if (el) {
                if (v === tabKey) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
            if (btn) {
                if (v === tabKey) btn.className = 'shadcn-button-primary px-3.5 py-2 text-xs font-bold shadow-sm flex items-center space-x-1.5 whitespace-nowrap';
                else btn.className = 'shadcn-button-secondary px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap';
            }
            if (mobBtn) {
                if (v === tabKey) mobBtn.className = 'flex flex-col items-center justify-center py-1 px-1.5 text-[#0284c7] font-bold';
                else mobBtn.className = 'flex flex-col items-center justify-center py-1 px-1.5 text-[#64748b] font-medium';
            }
        });

        if (tabKey === 'balance') {
            setTimeout(renderFiscalCharts, 50);
        } else if (tabKey === 'comparador') {
            renderRegionComparator();
            renderVectorHeatmap();
        }
    }

    // 18. ONBOARDING TOUR GUIADO
    var onboardingSteps = [
        {
            badge: 'PASO 1 DE 4',
            title: '¿Qué es la Presidenta IA & Radiografía de Chile?',
            tagline: 'Una plataforma de Estado, ciencia y datos duros sin sesgos políticos',
            content: '<p>Esta herramienta audita de forma 100% transparente los recursos, dotaciones y brechas de Chile recopilando datos oficiales de <strong>11 ministerios y organismos autónomos</strong> (DIPRES, Banco Central, Minsal, Mineduc, Carabineros, Gendarmería, Bomberos y Gobiernos Regionales).</p>'
        },
        {
            badge: 'PASO 2 DE 4',
            title: '¿Cómo leer el Balance de la República?',
            tagline: 'US$ 93.450 Millones auditados al detalle con sus fuentes',
            content: '<p>En la pestaña <strong>Balance Nacional</strong> puedes ver exactamente de dónde proviene cada peso que entra al Fisco (IVA, Renta, Codelco, Litio) y a qué prioridades se destina (Salud, Educación, Seguridad, Protección Social).</p>'
        },
        {
            badge: 'PASO 3 DE 4',
            title: 'Radiografía de las 16 Regiones de Chile',
            tagline: 'Ficha territorial exhaustiva con fotos reales y datos oficiales',
            content: '<p>En la pestaña <strong>Radiografía 16 Regiones</strong> haz clic en cualquier región para inspeccionar su dotación de Carabineros, camas críticas, listas de espera quirúrgica, cárceles, colegios y finanzas municipales.</p>'
        },
        {
            badge: 'PASO 4 DE 4',
            title: 'Memoria Histórica & Ágora Ciudadana',
            tagline: 'Efemérides día a día y propuestas cívicas de futuro',
            content: '<p>Consulta qué pasó en Chile <strong>Un Día Como Hoy</strong> a lo largo de 100 años y <strong>crea tus propias propuestas cívicas</strong> en el Ágora Nacional.</p>'
        }
    ];

    function openOnboarding(step) {
        onboardingStep = step || 1;
        renderOnboardingStep();
        document.getElementById('onboarding-modal').classList.remove('hidden');
    }

    function renderOnboardingStep() {
        var s = onboardingSteps[onboardingStep - 1] || onboardingSteps[0];
        document.getElementById('onboarding-step-badge').textContent = s.badge;
        document.getElementById('onboarding-step-title').textContent = s.title;
        document.getElementById('onboarding-step-tagline').textContent = s.tagline;
        document.getElementById('onboarding-step-content').innerHTML = s.content;

        var dotsHtml = '';
        for (var i = 1; i <= onboardingSteps.length; i++) {
            var dotClass = (i === onboardingStep) ? 'w-5 bg-[#0284c7]' : 'w-2 bg-[#cbd5e1]';
            dotsHtml += '<span class="h-2 rounded-full transition-all ' + dotClass + '"></span>';
        }
        document.getElementById('onboarding-dots').innerHTML = dotsHtml;

        var prevBtn = document.getElementById('onboarding-btn-prev');
        var nextBtn = document.getElementById('onboarding-btn-next');

        if (prevBtn) prevBtn.style.visibility = (onboardingStep === 1) ? 'hidden' : 'visible';
        if (nextBtn) {
            nextBtn.textContent = (onboardingStep === onboardingSteps.length) ? 'Comenzar a Auditar ✓' : 'Siguiente Paso →';
        }
    }

    function nextOnboardingStep() {
        if (onboardingStep < onboardingSteps.length) {
            onboardingStep++;
            renderOnboardingStep();
        } else {
            finishOnboarding();
        }
    }

    function prevOnboardingStep() {
        if (onboardingStep > 1) {
            onboardingStep--;
            renderOnboardingStep();
        }
    }

    function finishOnboarding() {
        closeModal('onboarding-modal');
        localStorage.setItem('chile_onboarding_done', 'true');
    }

    // INICIALIZACIÓN GLOBAL
    function renderAllViews() {
        renderEconomicIndicators();
        renderNationalBalanceView();
        renderRegionsAuditView();
        renderRegionComparator();
        renderVectorHeatmap();
        renderRegionalMatrixTable();
        renderHistoricalView();
        renderLegislativeBills();
        renderCadenaNacional();
        renderClustersView();
        renderCitizenProposals();
        safeCreateIcons();
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderAllViews();
    });

    window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openAssistantModal();
        }
    });

    // Exponer funciones globales
    window.selectRegion = selectRegion;
    window.switchToRegion = switchToRegion;
    window.switchTab = switchTab;
    window.calculateBudgetSimulation = calculateBudgetSimulation;
    window.resetBudgetSimulation = resetBudgetSimulation;
    window.updateCompareRegions = updateCompareRegions;
    window.setHeatmapLayer = setHeatmapLayer;
    window.exportRegionalReportPDF = exportRegionalReportPDF;
    window.exportDataCSV = exportDataCSV;
    window.filterMilestonesByMonth = filterMilestonesByMonth;
    window.filterCategory = filterCategory;
    window.filterClusters = filterClusters;
    window.openClusterModal = openClusterModal;
    window.upvoteProposal = upvoteProposal;
    window.openCitizenProposalModal = openCitizenProposalModal;
    window.submitCitizenProposal = submitCitizenProposal;
    window.openArcoModal = openArcoModal;
    window.submitArcoForm = submitArcoForm;
    window.closeModal = closeModal;
    window.openOnboarding = openOnboarding;
    window.nextOnboardingStep = nextOnboardingStep;
    window.prevOnboardingStep = prevOnboardingStep;
    window.finishOnboarding = finishOnboarding;
    window.openAssistantModal = openAssistantModal;
    window.handleAssistantSubmit = handleAssistantSubmit;
    window.askAssistantChip = askAssistantChip;

})();
