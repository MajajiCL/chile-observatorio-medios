# 🇨🇱 HANDOFF & GUÍA MAESTRA PARA CLAUDE CODE
## Proyecto: Presidenta IA & Radiografía de Estado de Chile (Suite Cívica Profesional 2026)

> **Destinatario**: Claude Code / Mateo Ávila / Majaji  
> **Fecha de entrega**: Septiembre 2026  
> **Estado**: En producción activa en GitHub Pages  
> **URL Producción**: [https://majajicl.github.io/chile-observatorio-medios/](https://majajicl.github.io/chile-observatorio-medios/)  
> **Repositorio**: [https://github.com/MajajiCL/chile-observatorio-medios](https://github.com/MajajiCL/chile-observatorio-medios)  
> **Rama principal**: `main`

---

## 1. Contexto & Visión del Proyecto

Este proyecto es un **Observatorio Cívico y Radiografía 360° del Estado de Chile**. Nació con el objetivo de dotar a la ciudadanía de una herramienta institucional, analítica y sin sesgos políticos, basada en **datos oficiales de 11 ministerios y organismos autónomos**, simuladores macroeconómicos y memoria histórica republicana.

### Principios Fundamentales del Proyecto
1. **100% Fuentes Verificadas**: Cada cifra, dotación policial, cama crítica, tiempo de espera en pabellón o hito histórico tiene obligatoriamente su enlace a organismos oficiales (DIPRES, Banco Central, DEIS/Minsal, CEAD/SPD, Gendarmería, Mineduc, Bomberos, BCN LeyChile, INE).
2. **Cero Sesgo / Análisis Factual**: Presentación objetiva con argumentos a favor, en contra y evidencia técnica internacional (OCDE, Banco Mundial).
3. **Usabilidad Móvil Estricta**: La web debe verse y funcionar de manera impecable en teléfonos móviles (sin scrolls horizontales, navegación flex-wrap o barra fija inferior, fuentes legibles).
4. **Cumplimiento Legal Chileno**: Incorporación activa de la **Ley N° 21.719** (Protección de Datos Personales y derechos ARCO) y **Ley N° 21.459** (Delitos Informáticos y Ciberseguridad).

---

## 2. Arquitectura Técnica & Estructura de Archivos

El proyecto está diseñado con **Vanilla Web Architecture** de altísimo rendimiento y cero dependencias de compilación complejas para facilitar su despliegue estático universal en GitHub Pages y compatibilidad con `file://`.

```
chile-observatorio-medios/
├── index.html                   # Interfaz principal completa (9 vistas + modales + mobile nav)
├── style.css                    # Estilos CSS, variables de diseño, @media print
├── app.js                       # Lógica de la Suite Profesional (Asistente, Simulador, Comparador)
├── data.js                      # window.OBSERVATORIO_SNAPSHOT (16 regiones, presupuesto, efemérides)
├── static/                      # Espejo idéntico para despliegues estáticos y sync de GH Pages
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── data.js
├── data/
│   ├── snapshot.json            # JSON crudo del balance nacional, regiones y proyectos
│   └── state_audit_complete.json# Auditoría completa de 16 regiones con dotaciones y fotos
├── CLAUDE.md                    # Este archivo de referencia técnica
└── HANDOFF_CLAUDE.md
```

### Librerías en Uso (vía CDN)
- **CSS**: Tailwind CSS CDN + estilos personalizados en `style.css`.
- **Tipografía**: **Montserrat** (`wght@300..900`) para textos y títulos, y **JetBrains Mono** para cifras y métricas.
- **Gráficos**: Apache ECharts `5.4.3`.
- **Iconos**: Lucide Icons (`window.lucide.createIcons()`).

> ⚠️ **REGLA CRÍTICA DE SINCRONIZACIÓN**:  
> Cada vez que modifiques archivos en la raíz (`index.html`, `style.css`, `app.js`, `data.js`), debes copiarlos a la carpeta `static/` antes de hacer commit. De lo contrario, GitHub Pages o entornos estáticos pueden quedar desfasados.

---

## 3. Decisiones de Diseño & Playbook (Mateo Ávila / Majaji)

1. **Tipografía Oficial**: Se usa **Montserrat** para toda la interfaz (a petición explícita del usuario tras descartar fuentes genéricas o condensadas).
2. **Fotografía Real de Regiones**: Cada una de las 16 regiones cuenta con fotos de alta resolución de paisajes y ciudades chilenas reales (Costanera Center, Valparaíso cerros, Morro de Arica, Torres del Paine, etc.) con captions identificando el lugar.
3. **Cero Barras de Desplazamiento Horizontales Innecesarias**: En móviles, no se deben forzar overflow horizontales con barras de scroll; se prefieren grids elásticos (`grid-cols-2 sm:grid-cols-4 lg:grid-cols-8`) o botones flex-wrap.
4. **Resiliencia ante Fallos**: Manejo de imágenes con `onerror` de respaldo y llamadas defensivas a `safeCreateIcons()` para evitar errores si Lucide o ECharts demoran en cargar.

---

## 4. Los 6 Módulos Profesionales Activos

1. **🤖 Asistente Cívico IA («Pregúntale a la Presidenta IA»)**:
   - Botón flotante `#btn-open-assistant` y atajo `Ctrl + K`.
   - Motor RAG local en `app.js` (`queryCivicAssistant(userPrompt)`) que parsea intenciones sobre seguridad, salud, dotación de Carabineros, cárceles, presupuesto fiscal o efemérides en cualquiera de las 16 regiones.
   - Cita fuentes verificadas con enlaces directos.

2. **⚖️ Comparador Cara a Cara 1 vs 1 (Región vs Región)**:
   - Contenedor `#region-comparator-container`. Permite enfrentar 2 regiones y despliega badges de semáforo ("Mejor" o "Mayor Estrés") en Demora de Cirugías, Homicidios, Hacinamiento Penal, Dependencia FCM, Déficit Hídrico, IDH y PIB.

3. **🎛️ Simulador Fiscal Interactivo («Si tú fueras Presidente»)**:
   - Contenedor `#interactive-budget-simulator-container`. Sliders para Salud, Educación, Seguridad, Obras Públicas, Ciencia/Litio y Burocracia/Asesores.
   - Algoritmo en tiempo real que calcula déficit proyectado sobre el PIB, impacto en el EMBI (Riesgo País), empleos generados y dictamen del Consejo Fiscal Autónomo (CFA).

4. **🗺️ Mapa Vectorial de Calor (Heatmap Territorial)**:
   - Contenedor `#vector-heatmap-container`. Permite conmutar capas térmicas: *Déficit Hídrico*, *Hacinamiento Penal*, *Tasa de Homicidios* y *Dependencia Fondo Común Municipal*.

5. **📄 Exportador Ejecutivo PDF & CSV de Datos Abiertos**:
   - Función `exportRegionalReportPDF()` con `@media print` en `style.css` que oculta barras de navegación, botones y modales, imprimiendo una ficha ejecutiva limpia de la región seleccionada.
   - Función `exportDataCSV()` que descarga `chile_auditoria_16_regiones_2026.csv` con BOM UTF-8.

6. **📜 Calendario de Efemérides & Memoria Centenaria (1926-2026)**:
   - Catálogo de hitos históricos de Enero a Diciembre con filtro dinámico por mes. Cada hito incluye enlace a su texto legal en la **Biblioteca del Congreso Nacional (BCN LeyChile)**.
   - Comparativa de 1 siglo de evolución en pobreza infantil, analfabetismo, salud y electrificación.

---

## 5. Roadmap Prioritario para Claude Code

Claude Code, enfócate en los siguientes tres ejes prioritarios:

### Eje 1: Interfaz & Experiencia de Usuario (UI/UX)
- [ ] **Mapa Geográfico SVG Interactivo**: Reemplazar o complementar la grilla del Heatmap con un mapa vectorial SVG interactivo de la silueta de Chile (de Arica a Magallanes y Antártica), con zoom territorial (Norte Grande, Norte Chico, Centro, Sur, Austral) y coloreado coroplético dinámico.
- [ ] **Dark Mode Toggle**: Implementar selector de tema Claro / Oscuro institucional con persistencia en `localStorage` y soporte para `prefers-color-scheme`.
- [ ] **Micro-animaciones Suaves**: Mejorar transiciones entre pestañas con animaciones de opacidad y desplazamiento usando clases de Tailwind / CSS.
- [ ] **PWA (Progressive Web App)**: Añadir `manifest.json` y Service Worker básico para que los usuarios puedan "Instalar" la app en la pantalla de inicio de sus teléfonos Android/iOS y consultarla sin conexión.

### Eje 2: Nuevos Complementos & Enriquecimiento de Datos
- [ ] **Conector API Mindicador / Banco Central**: Crear script en GitHub Actions (`.github/workflows/update_indicators.yml`) con cron diario que consulte la API del Banco Central o Mindicador.cl para refrescar automáticamente el Dólar, UF, UTM, Imacec y Cobre en `data/snapshot.json`.
- [ ] **Desglose Comunal**: Ampliar la auditoría regional a las 346 comunas de Chile (SINIM Subdere), permitiendo buscar cualquier municipalidad para ver sus ingresos y dotación.
- [ ] **Ágora Ciudadana con Backend / Supabase / GitHub Issues**: Actualmente las propuestas se guardan en `localStorage`. Sería potente conectar las propuestas a GitHub Discussions o Supabase para que sean colaborativas y persistentes entre usuarios reales.

### Eje 3: Seguridad, Hardening & Cumplimiento Legal
- [ ] **Sanitización de Entradas (DOMPurify)**: En el Asistente Cívico y en el formulario del Ágora, asegurar que todo texto ingresado pase por sanitización estricta antes de insertarse en el DOM (prevención de XSS reflejado/almacenado).
- [ ] **Cabeceras de Seguridad (CSP & Permissions Policy)**: Configurar `<meta http-equiv="Content-Security-Policy">` restringiendo fuentes permitidas de scripts, estilos, fuentes e imágenes.
- [ ] **Validación de Esquema de Datos**: Incorporar validación defensiva en `data.js` para asegurar que si un indicador viene nulo (`null` o `undefined`), nunca rompa la ejecución de gráficos ni de la tabla.
- [ ] **Auditoría de Privacidad Ley N° 21.719**: Enriquecer el modal de derechos ARCO con envío de correo formal (ej. vía Formspree / endpoint serverless cifrado) para dar cumplimiento al plazo de 15 días hábiles que exige la ley chilena.

---

## 6. Comandos Clave de Trabajo

```bash
# Probar sintaxis JS
node --check app.js
node --check static/app.js

# Probar funcionamiento sin navegador (mock test)
node -e "const fs = require('fs'); global.window = global; global.document = { getElementById: () => ({ innerHTML: '' }), addEventListener: () => {} }; eval(fs.readFileSync('data.js','utf8')); eval(fs.readFileSync('app.js','utf8')); console.log('OK');"

# Sincronizar archivos raíz hacia static/
copy index.html static\index.html
copy style.css static\style.css
copy app.js static\app.js
copy data.js static\data.js

# Commits y despliegue a GitHub Pages
git add .
git commit -m "feat(ui): tu descripción aquí"
git push origin main
```

---
*Documento preparado por Antigravity para continuidad inmediata con Claude Code.*
