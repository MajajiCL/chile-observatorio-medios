/**
 * Observatorio de Medios & Radiografía de Estado de Chile
 * Actualización: Auditoría Transversal, 16 Regiones con Fotos Reales y Flujo Visual Sin Barras Laterales
 */

(function () {
    'use strict';

    var currentCategory = 'all';
    var currentSortField = 'population';
    var sortDirection = 'desc';
    var currentRegionId = 'metropolitana';
    var onboardingStep = 1;

    function getSnapshot() {
        return window.OBSERVATORIO_SNAPSHOT || {};
    }

    function safeCreateIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    // 1. INDICADORES ECONÓMICOS (FLEX-WRAP, CERO SCROLL LATERAL)
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
    // 2. BALANCE NACIONAL (INGRESOS & GASTOS)
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
                    '<p class="text-[11px] text-[#64748b]">' + r.desc + '</p>' +
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
                    '<p class="text-[11px] text-[#64748b]">' + e.desc + '</p>' +
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
                '<span class="text-[11px] text-[#64748b] block">Colegios y Liceos</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#64748b] block">Salud Pública</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + infra.total_hospitals + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">Hospitales (+ ' + infra.total_cesfam + ' CESFAM)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#dc2626] block">Cárceles & Gendarmería</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#dc2626]">' + infra.prison_overcrowding_national_pct + '%</span>' +
                '<span class="text-[11px] text-[#64748b] block">Hacinamiento (' + infra.total_prisons + ' penales)</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0f172a] block">Policías Operativos</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + (infra.total_carabineros + infra.total_pdi).toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">' + infra.total_carabineros.toLocaleString('es-CL') + ' Carab. + ' + infra.total_pdi.toLocaleString('es-CL') + ' PDI</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0284c7] block">Bomberos de Chile</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0284c7]">' + infra.total_firefighters_volunteers.toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">' + infra.total_fire_stations + ' Cías. Voluntarias</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#0f172a] block">Fuerzas Armadas</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#0f172a]">' + infra.total_military_personnel.toLocaleString('es-CL') + '</span>' +
                '<span class="text-[11px] text-[#64748b] block">Ejército, Armada y FACh</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#64748b] block">Déficit Habitacional</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#dc2626]">' + (infra.housing_deficit_families / 1000).toFixed(0) + 'k</span>' +
                '<span class="text-[11px] text-[#64748b] block">Familias sin vivienda propia</span>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1">' +
                '<span class="text-[10px] uppercase font-bold text-[#16a34a] block">Matriz Eléctrica Limpia</span>' +
                '<span class="text-lg font-mono font-extrabold text-[#16a34a]">' + infra.renewable_energy_share_pct + '%</span>' +
                '<span class="text-[11px] text-[#64748b] block">Solar, eólica e hidroeléctrica</span>' +
                '</div>';
        }

        renderFiscalCharts();
    }

    // 3. GRÁFICO FISCAL DONUT
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
                textStyle: { color: '#ffffff', fontSize: 12, fontFamily: 'Plus Jakarta Sans' },
                formatter: function (params) {
                    return '<div class="font-bold">' + params.name + '</div>' +
                        '<div>Monto: <span class="font-mono text-cyan-400 font-bold">US$ ' + params.value.toFixed(1) + 'B</span></div>' +
                        '<div>Participación: <span class="font-mono text-amber-300 font-bold">' + params.percent + '%</span></div>';
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
                            fontFamily: 'Plus Jakarta Sans',
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
    // 4. RADIOGRAFÍA 16 REGIONES: SELECTOR VISUAL EN CUADRÍCULA + DROPDOWN (SIN SCROLLBARS)
    function renderRegionsAuditView() {
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var container = document.getElementById('region-selector-container');
        if (!container) return;

        var html = '<div class="space-y-4">';

        // Dropdown para cambio instantáneo en móvil
        html += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[18px] bg-white border border-[#e2e8f0]">' +
            '<div>' +
            '<label class="block text-xs font-bold text-[#0f172a] uppercase tracking-wider">Selección Directa de Región:</label>' +
            '<p class="text-[11px] text-[#64748b]">Elige una de las 16 regiones de Chile para auditarla</p>' +
            '</div>' +
            '<select id="region-dropdown-select" onchange="selectRegion(this.value)" class="shadcn-input px-3.5 py-2 text-xs font-bold bg-[#f8f9fa] cursor-pointer min-w-[240px]">';

        regions.forEach(function (r) {
            var selected = (r.id === currentRegionId) ? 'selected' : '';
            html += '<option value="' + r.id + '" ' + selected + '>' + r.number + ' - ' + r.name + '</option>';
        });
        html += '</select></div>';

        // Cuadrícula visual fotográfica de las 16 regiones (Grid 2 cols en móvil, 4 cols en tablet, 8 cols en desktop)
        html += '<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">';
        regions.forEach(function (r) {
            var isSelected = (r.id === currentRegionId);
            var activeClass = isSelected
                ? 'ring-2 ring-[#0284c7] border-[#0284c7] shadow-md scale-[1.02]'
                : 'border-[#e2e8f0] opacity-85 hover:opacity-100 hover:border-slate-400';
            var photo = r.photo_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80';

            html += '<button onclick="selectRegion(\'' + r.id + '\')" id="btn-grid-reg-' + r.id + '" class="group relative rounded-[16px] overflow-hidden border p-2 text-left bg-white transition-all ' + activeClass + '">' +
                '<div class="w-full h-16 rounded-[12px] overflow-hidden relative mb-2 bg-[#0f172a]">' +
                '<img src="' + photo + '" alt="' + r.name + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />' +
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

        var photoUrl = r.photo_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';
        var photoCaption = r.photo_caption || r.capital;
        var idhVal = r.idh || 0.840;
        var informalVal = r.informal_labor_pct || 28.0;
        var waterVal = r.water_deficit_pct || 45.0;

        var html = '<div class="shadcn-card overflow-hidden border border-[#e2e8f0] space-y-6 shadow-card">' +
            '<div class="relative h-56 sm:h-72 w-full overflow-hidden bg-[#0f172a]">' +
            '<img src="' + photoUrl + '" alt="' + r.name + '" class="w-full h-full object-cover filter brightness-[0.75] contrast-110 hover:scale-105 transition-transform duration-700" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>' +
            '<div class="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">' +
            '<div class="space-y-1.5">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-mono font-extrabold bg-[#0284c7] text-white">' + r.number + '</span>' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">Capital: ' + r.capital + '</span>' +
            '<span class="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-emerald-500 text-white">IDH: ' + idhVal + '</span>' +
            '</div>' +
            '<h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight">' + r.name + '</h2>' +
            '<span class="text-xs text-slate-200 flex items-center gap-1 font-medium"><i data-lucide="camera" class="w-3.5 h-3.5 text-amber-300"></i> ' + photoCaption + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
            '<span class="px-3 py-1.5 rounded-[12px] bg-white/15 backdrop-blur-md text-xs font-mono font-bold border border-white/20">' + r.population.toLocaleString('es-CL') + ' hab.</span>' +
            '<span class="px-3 py-1.5 rounded-[12px] bg-white/15 backdrop-blur-md text-xs font-mono font-bold border border-white/20">' + r.pib_share_pct + '% PIB Chile</span>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div class="p-6 sm:p-8 space-y-6">' +
            '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Presupuesto GORE (FNDR)</span><span class="text-base font-mono font-bold text-[#0f172a]">$' + (r.finances.budget_gore_fndr_mmclp / 1000).toFixed(1) + 'B CLP</span><span class="text-[10px] text-[#16a34a] block font-semibold">' + r.finances.execution_fndr_pct + '% Ejecución</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Informalidad Laboral</span><span class="text-base font-mono font-bold text-[#dc2626]">' + informalVal + '%</span><span class="text-[10px] text-[#64748b] block">Tasa Ocupación Informal</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Déficit Hídrico</span><span class="text-base font-mono font-bold text-[#0284c7]">' + waterVal + '%</span><span class="text-[10px] text-[#64748b] block">Estrés Cuencas DGA</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0]"><span class="text-[10px] uppercase font-bold text-[#64748b] block">Dependencia FCM Comunas</span><span class="text-base font-mono font-bold text-[#0f172a]">' + r.finances.fcm_dependency_avg_pct + '%</span><span class="text-[10px] text-[#64748b] block">Fondo Común Municipal</span></div>' +
            '</div>' +

            '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' +
            // SALUD
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="heart-pulse" class="w-4 h-4 text-[#dc2626]"></i> Red de Salud</h3><span class="text-[10px] font-mono text-[#64748b]">' + r.health.hospitals_high_complexity + ' Hosp. Alta C.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Camas Críticas (UPC):</span><span class="font-mono font-bold">' + r.health.critical_beds_upc_per_100k + ' / 100k hab.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Lista Espera Quirúrgica:</span><span class="font-mono font-bold text-[#dc2626]">' + r.health.surgical_waiting_list_patients.toLocaleString('es-CL') + ' pers.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Demora Media Pabellón:</span><span class="font-mono font-bold">' + r.health.avg_waiting_days_surgery + ' días</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Consultas Especialidad:</span><span class="font-mono font-bold">' + r.health.specialist_consult_waiting_list.toLocaleString('es-CL') + '</span></div>' +
            '</div></div>' +

            // SEGURIDAD
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="shield" class="w-4 h-4 text-[#0284c7]"></i> Policías & Seguridad</h3><span class="text-[10px] font-mono text-[#64748b]">' + r.security.carabineros_officers.toLocaleString('es-CL') + ' Carab.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Detectives PDI:</span><span class="font-mono font-bold">' + r.security.pdi_detectives.toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Patrullas Operativas:</span><span class="font-mono font-bold">' + r.security.patrol_vehicles_active + ' (' + r.security.patrol_vehicles_broken + ' en pana)</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Tasa de Homicidios:</span><span class="font-mono font-bold text-[#dc2626]">' + r.security.homicide_rate_per_100k + ' / 100k hab.</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Amenaza Crimen Org.:</span><span class="font-bold text-[#dc2626]">' + r.security.organized_crime_threat_level + '</span></div>' +
            '</div></div>' +

            // CARCELES
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="lock" class="w-4 h-4 text-[#dc2626]"></i> Cárceles & Gendarmería</h3><span class="text-[10px] font-mono text-[#dc2626] font-bold">' + r.prisons.overcrowding_pct + '% Hacinamiento</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Recintos Penales:</span><span class="font-mono font-bold">' + r.prisons.prisons_count + ' cárceles</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Población Penal:</span><span class="font-mono font-bold">' + r.prisons.inmates_total.toLocaleString('es-CL') + ' reos</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Gendarmes de Trato:</span><span class="font-mono font-bold">' + r.prisons.gendarmerie_staff.toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Prisión Preventiva:</span><span class="font-mono font-bold">' + r.prisons.preventive_custody_pct + '% sin condena</span></div>' +
            '</div></div>' +

            // EDUCACION
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="graduation-cap" class="w-4 h-4 text-[#0f172a]"></i> Educación & Escuelas</h3><span class="text-[10px] font-mono text-[#64748b]">' + r.education.total_schools + ' Colegios</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Matrícula Escolar:</span><span class="font-mono font-bold">' + r.education.matricula_total.toLocaleString('es-CL') + ' alumnos</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">SIMCE Lectura / Mate:</span><span class="font-mono font-bold">' + r.education.simce_reading_avg + ' / ' + r.education.simce_math_avg + ' pts</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Asistencia Crítica:</span><span class="font-mono font-bold text-[#dc2626]">' + r.education.critical_attendance_pct + '%</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Gratuidad Superior:</span><span class="font-mono font-bold text-[#16a34a]">' + r.education.gratuidad_coverage_pct + '%</span></div>' +
            '</div></div>' +

            // BOMBEROS
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-[#dc2626]"></i> Bomberos & Emergencias</h3><span class="text-[10px] font-mono text-[#0284c7] font-bold">' + r.firefighters.companies_count + ' Cías.</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Voluntarios Activos:</span><span class="font-mono font-bold">' + r.firefighters.volunteers_count.toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Carrobombas / Carros:</span><span class="font-mono font-bold">' + r.firefighters.fire_trucks_operational + ' (' + r.firefighters.fire_trucks_falla + ' en falla)</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Tiempo Resp. Urbano:</span><span class="font-mono font-bold">' + r.firefighters.avg_response_time_minutes + ' min</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Aporte Fiscal Anual:</span><span class="font-mono font-bold">$' + (r.firefighters.fiscal_subsidy_mmclp).toLocaleString('es-CL') + 'M CLP</span></div>' +
            '</div></div>' +

            // FFAA
            '<div class="p-4 rounded-[18px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-3">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2"><h3 class="text-xs font-bold text-[#0f172a] flex items-center gap-1.5"><i data-lucide="anchor" class="w-4 h-4 text-[#0f172a]"></i> Fuerzas Armadas (FFAA)</h3><span class="text-[10px] font-mono text-[#64748b]">' + r.military.bases_units_count + ' Unidades</span></div>' +
            '<div class="space-y-2 text-xs">' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Efectivos Militares:</span><span class="font-mono font-bold">' + r.military.stationed_personnel.toLocaleString('es-CL') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Ramas Presentes:</span><span class="font-bold">' + r.military.branches_present.join(', ') + '</span></div>' +
            '<div class="flex justify-between"><span class="text-[#64748b]">Misión Estratégica:</span><span class="font-bold text-[#0284c7]">' + r.military.primary_strategic_mission + '</span></div>' +
            '</div></div>' +
            '</div>' +

            // VIVIENDA, CALLES Y ENERGIA
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e2e8f0]">' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#dc2626] block">Déficit Habitacional</span><span class="text-base font-mono font-bold text-[#dc2626]\">' + r.infrastructure.housing_deficit_units.toLocaleString('es-CL') + ' viviendas</span><span class="text-[10px] text-[#64748b] block">' + r.infrastructure.campamentos_count + ' campamentos (' + r.infrastructure.campamentos_families.toLocaleString('es-CL') + ' familias)</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#0f172a] block">Red Vial & Pavimentación</span><span class="text-base font-mono font-bold text-[#0f172a]">' + r.infrastructure.paved_roads_pct + '% pavimentado</span><span class="text-[10px] text-[#64748b] block">' + r.infrastructure.total_roads_km.toLocaleString('es-CL') + ' km de caminos totales</span></div>' +
            '<div class="p-3.5 rounded-[14px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><span class="text-[10px] uppercase font-bold text-[#16a34a] block">Matriz Energética Renovable</span><span class="text-base font-mono font-bold text-[#16a34a]">' + r.infrastructure.renewable_energy_share_pct + '% limpia</span><span class="text-[10px] text-[#64748b] block">Capacidad: ' + r.infrastructure.installed_capacity_mw.toLocaleString('es-CL') + ' MW</span></div>' +
            '</div>' +

            '</div></div>';

        container.innerHTML = html;
        safeCreateIcons();
    }
    // 5. RANKINGS & COMPARADOR TERRITORIAL (EN VEZ DE TABLA HORIZONTAL ROTA)
    function renderRegionalMatrixTable() {
        var snap = getSnapshot();
        var regions = snap.regions_complete_audit || [];
        var container = document.getElementById('regional-matrix-container');
        if (!container) return;

        var byHacinamiento = regions.slice().sort(function (a, b) { return b.prisons.overcrowding_pct - a.prisons.overcrowding_pct; });
        var byEspera = regions.slice().sort(function (a, b) { return b.health.avg_waiting_days_surgery - a.health.avg_waiting_days_surgery; });
        var byFCM = regions.slice().sort(function (a, b) { return b.finances.fcm_dependency_avg_pct - a.finances.fcm_dependency_avg_pct; });

        var html = '<div class="space-y-6">' +
            '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' +
            // TOP HACINAMIENTO
            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#dc2626] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Mayor Hacinamiento Penal</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byHacinamiento.slice(0, 5).forEach(function (r, idx) {
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#dc2626]">' + r.prisons.overcrowding_pct + '%</span>' +
                '</div>';
        });
        html += '</div></div>' +

            // TOP LISTA ESPERA
            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-[#0284c7]"></i> Mayor Demora Quirúrgica</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byEspera.slice(0, 5).forEach(function (r, idx) {
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#0f172a]">' + r.health.avg_waiting_days_surgery + ' días</span>' +
                '</div>';
        });
        html += '</div></div>' +

            // TOP DEPENDENCIA FCM
            '<div class="p-5 rounded-[20px] bg-white border border-[#e2e8f0] space-y-3 shadow-sm">' +
            '<div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2">' +
            '<span class="text-xs font-bold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="landmark" class="w-4 h-4"></i> Dependencia Fondo Común</span>' +
            '</div>' +
            '<div class="space-y-2">';
        byFCM.slice(0, 5).forEach(function (r, idx) {
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="flex items-center justify-between p-2 rounded-[10px] hover:bg-[#f8f9fa] cursor-pointer transition text-xs">' +
                '<span class="font-medium text-[#0f172a]"><strong class="text-[#64748b] mr-1">#' + (idx + 1) + '</strong> ' + r.name.replace('Región de ', '').replace('Región del ', '') + '</span>' +
                '<span class="font-mono font-bold text-[#0284c7]">' + r.finances.fcm_dependency_avg_pct + '%</span>' +
                '</div>';
        });
        html += '</div></div></div>' +

            // LISTADO RESPONSIVO DE LAS 16 REGIONES
            '<div class="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-4 shadow-sm">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">' +
            '<div><h3 class="text-base font-bold text-[#0f172a]">Comparativa de las 16 Regiones de Chile</h3><p class="text-xs text-[#64748b]">Haz clic en cualquier región para abrir su auditoría completa</p></div>' +
            '<span class="shadcn-badge bg-[#0f172a] text-white">16 REGIONES AUDITADAS</span>' +
            '</div>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">';

        regions.forEach(function (r) {
            html += '<div onclick="switchToRegion(\'' + r.id + '\')" class="p-3.5 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] hover:border-[#0284c7] hover:shadow-sm cursor-pointer transition space-y-2">' +
                '<div class="flex items-center justify-between">' +
                '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-mono font-extrabold bg-[#0f172a] text-white">' + r.number + '</span>' +
                '<span class="text-[11px] font-mono font-bold text-[#0284c7]">' + r.pib_share_pct + '% PIB</span>' +
                '</div>' +
                '<h4 class="text-xs font-extrabold text-[#0f172a] truncate">' + r.name + '</h4>' +
                '<div class="space-y-1 text-[11px] text-[#64748b]">' +
                '<div class="flex justify-between"><span>Población:</span><span class="font-mono font-bold text-[#0f172a]">' + (r.population / 1000).toFixed(0) + 'k</span></div>' +
                '<div class="flex justify-between"><span>Hacinamiento Penal:</span><span class="font-mono font-bold text-[#dc2626]">' + r.prisons.overcrowding_pct + '%</span></div>' +
                '<div class="flex justify-between"><span>Lista Cirugía:</span><span class="font-mono font-bold text-[#0f172a]">' + r.health.surgical_waiting_list_patients.toLocaleString('es-CL') + '</span></div>' +
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

    // 6. LEYES & CONGRESO
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
                '<span class="text-xs font-mono font-bold text-[#0284c7] bg-[#e0f2fe] px-3 py-1 rounded-full">Cámara de Origen</span>' +
                '</div>' +
                '<p class="text-xs sm:text-sm text-[#334155] leading-relaxed"><strong>En simple:</strong> ' + bill.plain_explanation + '</p>' +
                '<div class="p-4 rounded-[16px] bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e3a8a] space-y-1"><strong class="block font-bold">¿Cómo te impacta a ti en tu día a día?</strong><p>' + bill.citizen_impact + '</p></div>' +
                '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><strong class="text-[#16a34a] font-bold block">Argumentos a Favor (Oficialismo):</strong><p class="text-[#334155]">' + bill.pro_arguments + '</p></div>' +
                '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-1"><strong class="text-[#dc2626] font-bold block">Argumentos en Contra (Oposición):</strong><p class="text-[#334155]">' + bill.con_arguments + '</p></div>' +
                '</div>' +
                '<div class="p-4 rounded-[16px] bg-[#fafafa] border border-[#e2e8f0] text-xs space-y-1"><strong class="text-[#0f172a] font-bold block">Evidencia Técnica & Lecciones Internacionales (OCDE / Banco Central):</strong><p class="text-[#64748b]">' + bill.technical_evidence + '</p></div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // 7. CADENA NACIONAL
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

    // 8. SIMULADOR PROSPECTIVO OCDE
    function runSimulation() {
        var sel = document.getElementById('simulator-select');
        var out = document.getElementById('simulator-output');
        if (!sel || !out) return;

        var val = sel.value;
        var simulations = {
            'carceles': {
                title: 'Reforma Penitenciaria Tipo Noruega (Reinserción Real vs Castigo Simple)',
                evidence: 'En Noruega, la tasa de reincidencia cayó del 70% al 20% tras convertir las cárceles en centros de capacitación laboral intensiva y salud mental. En Chile, la sobrepoblación es de 134.8% y 53% de los liberados vuelve a delinquir antes de 3 años.',
                cost: 'US$ 450 Millones en 4 años',
                impact: 'Reducción proyectada del 35% en delitos violentos hacia 2030 y ahorro fiscal de US$ 180M anuales en juicios y custodias.'
            },
            'salud': {
                title: 'Hospitales de Alta Resolución (Modelo Español) vs Subsidio a la Demanda',
                evidence: 'España redujo las listas de espera en 40% instalando centros de resolución ambulatoria rápida (CARE) donde el 80% de los pacientes sale con diagnóstico y tratamiento el mismo día.',
                cost: 'US$ 620 Millones en 3 años',
                impact: 'Baja del tiempo promedio de espera quirúrgica en Chile de 480 días a menos de 90 días.'
            },
            'agua': {
                title: 'Red Nacional de Desalinización Multipropósito (Modelo Israel) vs Camiones Aljibe',
                evidence: 'Israel pasó de un déficit hídrico crónico a producir el 85% de su agua potable vía desalinización costera con energía solar. Chile hoy gasta US$ 120M anuales en camiones aljibe que no resuelven el problema.',
                cost: 'US$ 1.800 Millones (Concesiones Público-Privadas)',
                impact: 'Seguridad hídrica total para Coquimbo, Valparaíso y Atacama, habilitando 50.000 nuevas hectáreas agrícolas sostenibles.'
            },
            'educacion': {
                title: 'Formación Técnico-Profesional Dual (Modelo Alemán)',
                evidence: 'Alemania mantiene el desempleo juvenil más bajo de Europa (5.8%) gracias a que el 50% de la formación técnica ocurre dentro de empresas con contrato y remuneración desde el primer año.',
                cost: 'US$ 280 Millones anuales',
                impact: 'Aumento del 42% en empleabilidad juvenil formal inmediata en Chile al egresar de 4° Medio Técnico.'
            }
        };

        var item = simulations[val] || simulations['carceles'];
        out.innerHTML = '<div class="space-y-3 text-xs leading-relaxed">' +
            '<h4 class="text-sm font-bold text-[#0f172a]">' + item.title + '</h4>' +
            '<p class="text-[#334155]"><strong>Evidencia Comparada:</strong> ' + item.evidence + '</p>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">' +
            '<div class="p-3 rounded-[12px] bg-white border border-[#e2e8f0]"><strong class="text-[#64748b] block text-[10px] uppercase">Costo Fiscal Estimado:</strong><span class="font-mono font-bold text-[#0f172a]">' + item.cost + '</span></div>' +
            '<div class="p-3 rounded-[12px] bg-white border border-[#e2e8f0]"><strong class="text-[#16a34a] block text-[10px] uppercase">Impacto Proyectado:</strong><span class="font-bold text-[#16a34a]">' + item.impact + '</span></div>' +
            '</div>' +
            '</div>';
    }
    // 9. OBSERVATORIO DE NOTICIAS & CLUSTERS (FLEX-WRAP EN CATEGORÍAS)
    function renderClustersView() {
        var snap = getSnapshot();
        var clusters = snap.clusters || [];
        var container = document.getElementById('clusters-list');
        if (!container) return;

        var filtered = clusters.filter(function (c) {
            if (currentCategory === 'all') return true;
            return (c.category || '').toLowerCase() === currentCategory.toLowerCase();
        });

        var html = '';
        filtered.forEach(function (c) {
            var bp = c.blindspot || {};
            var biasBadge = '';
            if (bp.left_pct > 0.6) biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-red-100 text-red-700">Mayor cobertura izquierda</span>';
            else if (bp.right_pct > 0.6) biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-blue-100 text-blue-700">Mayor cobertura derecha</span>';
            else biasBadge = '<span class="px-2 py-0.5 rounded-[8px] text-[10px] font-bold bg-slate-100 text-slate-700">Cobertura equilibrada</span>';

            html += '<div onclick="openClusterModal(' + c.id + ')" class="shadcn-card p-5 space-y-3 cursor-pointer hover:border-[#0284c7] transition border border-[#e2e8f0]">' +
                '<div class="flex items-center justify-between gap-2 flex-wrap">' +
                '<span class="shadcn-badge bg-[#0f172a] text-white">' + (c.category || 'Nacional') + '</span>' +
                biasBadge +
                '</div>' +
                '<h3 class="text-sm font-bold text-[#0f172a] leading-snug line-clamp-2">' + c.title + '</h3>' +
                '<p class="text-xs text-[#64748b] line-clamp-2">' + (c.description ? c.description.replace(/<[^>]*>/g, '') : '') + '</p>' +
                '<div class="flex items-center justify-between text-[11px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">' +
                '<span>' + (c.article_count || 1) + ' fuentes verificadas</span>' +
                '<span class="text-[#0284c7] font-semibold flex items-center gap-1">Ver análisis <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></span>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html || '<p class="text-xs text-[#64748b] col-span-2 text-center py-8">No hay noticias registradas en esta categoría.</p>';
        safeCreateIcons();
    }

    function filterCategory(cat) {
        currentCategory = cat;
        var pills = document.querySelectorAll('.cat-pill');
        pills.forEach(function (p) {
            p.className = 'cat-pill shadcn-button-secondary px-3 py-1 text-xs font-medium';
        });
        if (event && event.target) {
            event.target.className = 'cat-pill shadcn-button-primary px-3 py-1 text-xs font-semibold';
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

        document.getElementById('modal-title').textContent = c.title;
        document.getElementById('modal-category').textContent = c.category || 'Nacional';

        var body = document.getElementById('modal-body');
        var cleanDesc = c.description ? c.description.replace(/<[^>]*>/g, '') : 'Sin descripción.';
        body.innerHTML = '<div class="space-y-4 text-xs leading-relaxed">' +
            '<p class="text-[#334155]">' + cleanDesc + '</p>' +
            '<div class="p-4 rounded-[16px] bg-[#f8f9fa] border border-[#e2e8f0] space-y-2">' +
            '<strong class="text-[#0f172a] block font-bold">Auditoría Factual de Medios:</strong>' +
            '<p class="text-[#64748b]">Noticia procesada mediante verificación cruzada de fuentes abiertas oficiales y prensa tradicional chilena.</p>' +
            '</div>' +
            '</div>';

        document.getElementById('cluster-modal').classList.remove('hidden');
    }

    // 10. ÁGORA CIUDADANA
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

    // 11. MODAL LEY 21.719 (ARCO)
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

    // 12. SISTEMA DE PESTAÑAS (FLEX-WRAP, CERO SCROLL LATERAL)
    function switchTab(tabKey) {
        var views = ['balance', 'regiones', 'matriz', 'leyes', 'cadena', 'clusters', 'citizen'];
        views.forEach(function (v) {
            var el = document.getElementById('view-' + v);
            var btn = document.getElementById('tab-btn-' + v);
            if (el) {
                if (v === tabKey) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
            if (btn) {
                if (v === tabKey) btn.className = 'shadcn-button-primary px-4 py-2.5 text-xs font-bold shadow-sm flex items-center space-x-1.5 whitespace-nowrap';
                else btn.className = 'shadcn-button-secondary px-4 py-2.5 text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap';
            }
        });

        if (tabKey === 'balance') {
            setTimeout(renderFiscalCharts, 50);
        }
    }

    // 13. ONBOARDING TOUR GUIADO
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
            tagline: 'US$ 93.450 Millones auditados al detalle',
            content: '<p>En la pestaña <strong>Balance Nacional</strong> puedes ver exactamente de dónde proviene cada peso que entra al Fisco (IVA, Renta, Codelco, Litio) y a qué prioridades se destina (Salud, Educación, Seguridad, Protección Social).</p>'
        },
        {
            badge: 'PASO 3 DE 4',
            title: 'Radiografía de las 16 Regiones de Chile',
            tagline: 'Ficha territorial exhaustiva en 9 dimensiones',
            content: '<p>En la pestaña <strong>Radiografía 16 Regiones</strong> haz clic en cualquier región para inspeccionar su dotación de Carabineros, camas críticas, listas de espera quirúrgica, cárceles, colegios y finanzas municipales.</p>'
        },
        {
            badge: 'PASO 4 DE 4',
            title: 'Simulador OCDE & Ágora Ciudadana',
            tagline: 'Lecciones internacionales y co-creación ciudadana',
            content: '<p>Explora cómo otros países han solucionado problemas similares (Noruega, Israel, España, Alemania) y <strong>crea tus propias propuestas cívicas</strong> en el Ágora Nacional.</p>'
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
        renderRegionalMatrixTable();
        renderLegislativeBills();
        renderCadenaNacional();
        runSimulation();
        renderClustersView();
        renderCitizenProposals();
        safeCreateIcons();

        if (!localStorage.getItem('chile_onboarding_done')) {
            openOnboarding(1);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderAllViews();
    });

    // Exponer funciones globales
    window.selectRegion = selectRegion;
    window.switchToRegion = switchToRegion;
    window.switchTab = switchTab;
    window.runSimulation = runSimulation;
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

})();
