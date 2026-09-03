# Fuentes, atribución y licencia de los datos

Este observatorio no produce datos: los toma de organismos públicos chilenos, los
cruza y los interpreta. Esa distinción importa para lo que sigue.

---

## Atribución

### Censo de Población y Vivienda 2024 — nivel comunal y de manzana

**Autoría:** Instituto Nacional de Estadísticas (INE), Chile.
**Producto:** Censo de Población y Vivienda 2024. **Año:** 2024.
**Obtenido de:**
- Resultados comunales: <https://censo2024.ine.gob.cl/estadisticas/>
- Manzanas urbanas y entidades rurales: servicio «Microdatos Censo 2024»
  (capas *Manzanas* y *Manzanas-entidades*), publicado por Esri Chile a partir
  de los resultados oficiales del INE.

**Licencia:** [Creative Commons Reconocimiento-CompartirIgual 4.0 Internacional
(CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.es).

**Modificaciones realizadas.** La licencia obliga a declararlas, y son estas:

- De los 213 campos por manzana se seleccionaron 27 y de ellos se derivaron 9
  indicadores, expresados como porcentaje sobre su denominador correspondiente
  (hogares censados o población) en vez de conteos absolutos.
- La geometría se reproyectó a metros y se simplificó con Douglas-Peucker: 3 m
  de tolerancia en manzanas urbanas y 8 m en entidades rurales, para poder
  servirla a un navegador. Las formas son aproximadas.
- De las 28.415 entidades rurales se conservaron los nombres de localidad y
  entidad y su categoría, más 10 indicadores derivados del mismo modo.
- De las planillas comunales se extrajeron 180 series. Se descartó «Migración
  interna» por ser una matriz origen-destino y no una tabla de indicadores.
- Se calcularon valores derivados —grupos de comunas comparables, residuos
  respecto a un modelo de contexto y detección de anomalías— descritos en
  `CLAUDE.md`.

> **Estos análisis, cálculos e interpretaciones son de este proyecto. El INE no
> los ha realizado ni validado, y no responde por ellos.**

### Otras fuentes

| Fuente | Aporte | Vía |
|---|---|---|
| INE, CASEN/MIDESO, CEAD, SINIM/SUBDERE, DEMRE/MINEDUC, SERVEL, CPLT, FONASA, SINCA | 70 indicadores comunales | [Chile Abierto](https://chileabierto.cl/api) |
| Banco Central de Chile | UF, dólar, euro, UTM, IPC, Imacec, TPM | [mindicador.cl](https://mindicador.cl) |
| Biblioteca del Congreso Nacional (BCN) | Geometría comunal y regional | Datos abiertos BCN |

Cada indicador del sitio muestra su fuente y su año en pantalla. No hay ninguna
cifra sin procedencia.

---

## Condiciones que este proyecto asume

Por usar datos bajo CC BY-SA 4.0, **las obras derivadas de esos datos** —los
archivos de `data/app/`— se distribuyen bajo la misma licencia CC BY-SA 4.0.
Quien los reutilice queda sujeto a las mismas condiciones: citar, declarar
modificaciones y compartir igual.

El código del pipeline y de la interfaz es obra independiente y se distribuye
bajo la licencia indicada en `LICENSE`.

---

## Lo que este proyecto no hace, y no debe hacer

El Secreto Estadístico (Ley N° 17.374) protege la información individual. Los
datos por manzana que publica el INE ya vienen agregados y anonimizados
precisamente para cumplirlo.

En consecuencia, queda excluido de este proyecto:

- **Reidentificar.** No se cruzan estos datos con otras fuentes con el fin de
  identificar personas, hogares o entidades. En manzanas de muy poca población
  un cruce así podría llegar a individualizar, y por eso no se hace.
- **Usar los datos con fines no estadísticos** que vulneren el secreto
  estadístico.
- **Atribuir al INE** análisis o conclusiones de este proyecto.

La capa rural incluye «Comunidad Indígena» entre las categorías de asentamiento
del INE. Es una clasificación territorial oficial y se muestra como tal —igual
que caserío, fundo o asentamiento pesquero—, pero **no entra al detector de
anomalías**: describe qué tipo de asentamiento es, no señala un problema.

Los rasgos de identidad —religión, pueblos originarios, afrodescendencia,
lenguas— están **excluidos del detector de anomalías** por decisión de diseño.
Que los Kawésqar estén en Magallanes o los afrodescendientes de Azapa en Arica
no es una desviación que haya que explicar: es su territorio. El detector busca
condiciones sobre las que se puede actuar con política pública, no diferencias
culturales.

---

## Advertencias de interpretación

- **Las fechas no son homogéneas.** CASEN es 2022, PAES 2024, delitos CEAD 2024,
  Censo 2024. Solo UF, dólar y TPM cambian a diario. Cada dato lleva su año.
- **Las brechas están contraídas por población.** En comunas o manzanas muy
  pequeñas, una tasa se mueve por azar; el sitio muestra el valor contraído y
  advierte cuándo difiere del crudo.
- **El modelo de contexto es una regresión lineal** de cinco variables. Falla en
  los extremos: Vitacura aparece «sobre lo esperado» por esa razón, no por
  mérito. No es una medida de causalidad.
- **La geometría es aproximada** por la simplificación. No sirve para usos
  catastrales, legales ni de deslinde.
- El INE no garantiza continuidad, actualización ni ausencia de errores en los
  datos de origen, y se reserva modificarlos o retirarlos.
