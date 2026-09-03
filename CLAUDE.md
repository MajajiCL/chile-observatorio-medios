# Brecha Territorial — Observatorio Cívico de Chile

> **Producción**: https://majajicl.github.io/chile-observatorio-medios/
> **Repositorio**: https://github.com/MajajiCL/chile-observatorio-medios (rama `main`)
> **Local**: `C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios`
> también accesible como `D:\CLAUDIOPRO\_appdata\gemini\antigravity\scratch\chile-observatorio-medios`
> (es el **mismo directorio**: el scratch de Antigravity está enlazado dentro de `D:\CLAUDIOPRO`)

---

## 1. Qué es y qué NO es

Un mapa de las 345 comunas de Chile coloreado por **brecha**: cuánto se aparta cada
comuna del resultado que predicen su propio tamaño, ruralidad, ingreso y pobreza.

**No es un ranking.** Esa es la decisión de producto entera, y conviene entender por qué.

El puntaje PAES de una comuna se explica en un 51% solo por su contexto
socioeconómico. Publicar la tabla ordenada por puntaje produce siempre el mismo
podio — Vitacura, Lo Barnechea, Las Condes — que no informa sobre educación sino
sobre riqueza. Ordenar por brecha, en cambio, pone primero a **San Nicolás**
(Ñuble): un liceo rural que no selecciona alumnos, educa al 80% de los más
vulnerables de su zona y aun así obtiene 106 puntos más de lo que su contexto
predice. Está noveno en la tabla nacional; primero por brecha.

Esa es la diferencia entre publicar datos y producir un diagnóstico.

---

## 2. Cómo se construye

```
pipeline/
  01_ingesta.py       70 indicadores x 345 comunas de Chile Abierto  -> data/raw/
  05_censo.py         180 series del Censo 2024 (INE)                -> data/raw/
  02_motor.py         Calcula pares y brechas                        -> data/app/
  03_geo.py           Proyecta la geometría a paths SVG              -> data/app/mapa.json
  06_hallazgos.py     Detector de anomalías                          -> data/app/hallazgos.json
  07_manzanas.py      216.341 manzanas del Censo 2024 (ArcGIS)       -> data/manzanas_raw/
  08_manzanas_build.py  Simplifica y parte por comuna                -> data/app/manzana/
  04_indicadores.py   Refresca UF, dólar, IPC... (lo diario)         -> data/app/indicadores.json
```

Orden: `01` y `05` (fuentes) → `02` → `03` → `06`. Total: **250 indicadores**.

Para regenerar todo desde cero:

```bash
python pipeline/01_ingesta.py     # ~2 min (respeta el límite de 60 req/min)
python pipeline/02_motor.py
python pipeline/03_geo.py         # requiere data/geo/*.topo.json (ver abajo)
```

### Regenerar la geometría

`data/geo_raw/` **no está versionado**: son 19 MB que el pipeline reduce a 246 KB.
Si hace falta rehacerlos:

```bash
mkdir -p data/geo_raw
for i in $(seq 1 16); do
  curl -sL "https://raw.githubusercontent.com/caracena/chile-geojson/master/$i.geojson" \
       -o "data/geo_raw/$i.geojson"
done

npx -y mapshaper "data/geo_raw/*.geojson" combine-files -merge-layers force \
  -filter-fields cod_comuna,Comuna,codregion,Region,Provincia \
  -filter-islands min-area=6km2 \
  -simplify visvalingam weighted keep-shapes percentage=4% -clean \
  -o format=topojson data/geo/comunas.topo.json

npx -y mapshaper "data/geo_raw/*.geojson" combine-files -merge-layers force \
  -filter-islands min-area=20km2 -dissolve codregion copy-fields=Region \
  -simplify visvalingam weighted keep-shapes percentage=8% -clean \
  -o format=topojson data/geo/regiones.topo.json
```

Usar **mapshaper y no un simplificador propio**: preserva la topología compartida.
Simplificar cada polígono por separado deja huecos y solapes entre comunas vecinas,
que en un coroplético se ven como agujeros blancos.

---

## 3. Decisiones que no se deben revertir sin entenderlas

**La geometría se proyecta en el build, no en el navegador.**
`03_geo.py` emite cadenas `d` de SVG ya proyectadas. Por eso el sitio no carga
d3-geo ni topojson-client: cero dependencias, y la CSP puede ser estricta.

**Chile se dibuja en tres tramos lado a lado.**
El país mide 4.300 km de largo por unos 200 de ancho. En una sola proyección, es
una línea vertical donde ninguna comuna del norte alcanza un píxel. Rapa Nui y
Juan Fernández van en recuadros aparte: están a 3.500 km de la costa y, incluidos
en el encuadre, comprimirían el continente a un cuarto del ancho.

**Las brechas se contraen por población.**
Una tasa "por 100.000 habitantes" calculada sobre una comuna de 600 personas se
mueve por azar. Sin contraer, los extremos de cualquier ranking los ocupan siempre
las comunas más chicas — el error exacto que este proyecto le reprocha a los
rankings. El residuo se pondera por `pob/(pob+k)`, con `k` = mediana de población
comunal. La ficha muestra el valor sin contraer cuando difiere mucho.

**Un indicador de contexto no tiene brecha.**
Pobreza, ingreso, ruralidad, población y densidad son predictores. Calcular su
brecha da R²=1,00 y no significa nada: es predecir la pobreza con la pobreza.
Van marcados `context_only` y se pintan por valor.

**La escala de color es verde-azulado ↔ púrpura, no rojo-verde.**
El par rojo-verde es indistinguible en deuteranopía, el daltonismo más común.
En un mapa donde el color *es* el dato, eso no es un detalle de estilo.

**Las manzanas se sirven por comuna, nunca completas.**
Son 216.341 polígonos: unos 400 MB en bruto. Se descargan a `data/manzanas_raw/`
(no versionado) y `08` los reduce a ~200 KB por comuna. El sitio carga el
archivo de una sola comuna, al pulsar «ver cuadra por cuadra». Tres reducciones
lo hacen posible: 9 indicadores derivados en vez de 27 campos crudos, geometría
en metros simplificada con Douglas-Peucker a 3 m, y partición por comuna. Aquí
sí se puede simplificar cada polígono por separado —a diferencia de las comunas—
porque entre manzanas hay calles, no bordes compartidos.

**Los indicadores de manzana son porcentajes, no conteos.**
Cada uno va sobre su denominador correcto (hogares censados o población). Un
conteo absoluto por manzana solo mide el tamaño de la manzana.

**El código de comuna se rellena a 5 dígitos, siempre.**
El GeoJSON de BCN lo entrega como entero, así que Iquique llega como `1101`,
mientras las fuentes estadísticas usan `01101`. Sin `zfill(5)`, las **206 comunas
de las regiones 1 a 9** no cruzan con ningún dato y el mapa las pinta como "sin
información" sin error de consola ni aviso alguno. Ocurrió y estuvo publicado.
Al tocar el pipeline, verificar siempre que el cruce dé 345 de 345.

**El detector de anomalías excluye los rasgos de identidad.**
Religión, pueblos originarios, afrodescendencia y lenguas quedan fuera por
decisión de diseño, no por límite técnico. Que los Kawésqar estén en Magallanes
o los afrodescendientes de Azapa en Arica no es una anomalía: es su territorio.
Tratarlo como desviación da hallazgos vacíos —el patrón es geografía histórica
conocida— e insinúa que la presencia de un pueblo en su propia tierra es algo
que hay que explicar. El detector busca problemas sobre los que se puede actuar.

**Los conteos absolutos se normalizan por población antes de buscar anomalías.**
Si no, el detector "descubre" que Puente Alto tiene muchos votos y que Las Condes
recauda mucho, que es solo decir que son comunas grandes y ricas. Se normaliza
por defecto y se exceptúa una lista de unidades ya relativas, nunca al revés.

**Cada dato muestra su fecha real.**
CASEN es 2022, PAES 2024, CEAD 2024; solo UF, dólar y TPM cambian a diario — y el
IPC que devuelve mindicador puede tener meses. Presentarlos juntos bajo un
"actualizado hoy" destruiría la credibilidad, que es el producto.

**La CSP no admite `'unsafe-inline'` en estilos.**
Por eso ningún color se escribe como atributo `style` dentro de `innerHTML`. Los
colores del mapa van como atributo de presentación SVG (`fill`) y el resto se
aplica por CSSOM tras insertar el nodo. Si algo deja de pintarse, revisar esto
antes que nada.

---

## 4. Estructura

```
index.html                 Una sola vista: el mapa es la página
style.css                  Sistema visual (Montserrat + JetBrains Mono)
app.js                     Pintado, capas, buscador, fichas. Sin dependencias
manifest.json, icon.svg    Instalable como app
data/app/
  mapa.json                Paths SVG proyectados (511 KB)
  core.json                Comunas, catálogo de 70 indicadores, 6 capas (150 KB)
  indicadores.json         Económicos diarios
  comuna/<código>.json     345 fichas, cargadas al hacer clic (~5 KB c/u)
data/raw/                  Respaldo crudo de Chile Abierto: sostiene cada cifra
data/geo/                  TopoJSON simplificado
.github/workflows/         Actualización diaria de indicadores económicos
```

Los archivos del sitio anterior (`data.js`, `data/snapshot.json`,
`data/state_audit_complete.json`) se conservan a propósito: contienen presupuesto
DIPRES, efemérides BCN y datos regionales de salud y cárceles que Chile Abierto
**no** cubre. Son el insumo de futuras capas.

> No hay carpeta `static/`. GitHub Pages sirve desde la raíz (`source: main /`),
> así que ese espejo eran 460 KB duplicados que nunca se sirvieron. Se eliminó.
> **No volver a crearlo.**

---

> ⚖️ Los datos del Censo 2024 son **CC BY-SA 4.0**: obligan a citar al INE, a
> declarar las modificaciones y a distribuir las obras derivadas bajo la misma
> licencia. Ver `DATOS.md`, que además detalla qué no se debe hacer con datos a
> nivel de manzana (reidentificación).

## 5. Fuentes

Todas verificadas en vivo, ninguna citada de memoria.

| Fuente | Qué aporta |
|---|---|
| [Chile Abierto](https://chileabierto.cl/api) | 70 indicadores × 345 comunas, sin autenticación, 60 req/min |
| [mindicador.cl](https://mindicador.cl/api) | UF, dólar, euro, UTM, IPC, Imacec, TPM |
| DEMRE / MINEDUC | PAES 2024 por comuna |
| CASEN / MIDESO | Pobreza comunal 2022, ingreso mediano 2024 |
| SINIM / SUBDERE | Ruralidad, Fondo Común Municipal, ejecución presupuestaria |
| CEAD | Delitos por 100.000 habitantes 2024 |
| CPLT | Transparencia municipal 2025 |
| INE Censo 2024 | 180 series comunales + 216.341 manzanas con 213 campos (vía servicio de Esri Chile) |
| BCN | Geometría comunal y regional |

⚠️ La documentación de Chile Abierto dice 349 comunas; la API devuelve **345**, y
además **ignora los parámetros `limit` y `page`** (paginar provoca un bucle
infinito). Las 345 calzan exactamente con el GeoJSON de BCN.

---

## 6. Pendiente

- [ ] **Capa «manzanas-entidades»**: 28.415 registros con nombres de localidades,
      aldeas y caseríos (`NOM_LOCALIDAD`, `NOM_ENTIDAD`, `TIPO_CATEGORIA`) en la
      capa 1 del mismo servicio. Es el nivel «pueblo a pueblo» del mundo rural,
      que las manzanas urbanas no cubren.
- [ ] **Buscador por manzana** y detector de anomalías a esa escala: hoy el
      detector solo mira el nivel comunal.
- [ ] **Incertidumbre explícita**: CASEN tiene error muestral; publicar el intervalo, no solo el punto.
- [ ] **Quién tiene la palanca**: enlazar cada indicador con su responsable (municipio / ministerio) y su norma en BCN LeyChile. Es lo que convierte un número en una acción.
- [ ] **Tendencia**: hoy solo hay nivel. Una comuna pobre que mejora tres años seguidos es otra historia que una estancada.
- [ ] **Modelo más fino**: la regresión es lineal y falla en la cola alta (Vitacura aparece "sobre lo esperado" por eso). Conviene revisar la forma funcional.
- [ ] **Comparador de pares** en pantalla, no solo el listado de comunas comparables.
- [ ] Recuperar del sitio anterior lo que valga: simulador fiscal, efemérides BCN, exportación CSV/PDF.

---

## 7. Comandos

```bash
node --check app.js                       # sintaxis
python -m http.server 4173                # servidor local
python pipeline/04_indicadores.py         # refrescar económicos a mano
git add . && git commit -m "..." && git push origin main   # despliega Pages
```
