# -*- coding: utf-8 -*-
"""
Descarga el Censo 2024 a nivel de manzana: 216.341 manzanas del pais entero.

Esta es la escala donde de verdad se ve la desigualdad chilena. A nivel comunal,
Las Condes es rica y La Pintana pobre y ahi se acaba el analisis; a nivel de
manzana aparece que dentro de una misma comuna hay cuadras sin agua de red a
trescientos metros de cuadras con fibra optica. Ninguna web chilena lo muestra.

Fuente: servicio "Microdatos Censo 2024" (Esri Chile), que republica los datos
oficiales del INE. Licencia CC BY-SA 4.0: obliga a citar, a distribuir las obras
derivadas bajo la misma licencia y a dejar claro que los analisis son nuestros y
no estan validados por el INE.

De los 213 campos disponibles se bajan 27, elegidos porque describen condiciones
sobre las que se puede actuar. Quedan fuera los rasgos de identidad —lengua
indigena, entre otros— por la misma razon que en el detector de anomalias.

Se descarga comuna por comuna, con paginacion, a data/manzanas_raw/ (no
versionado). El paso 08 lo simplifica y produce lo que el sitio sirve.
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "data", "manzanas_raw")
os.makedirs(RAW, exist_ok=True)

SERVICIO = ("https://services.arcgis.com/r7t1P5pnkoOLRdhr/arcgis/rest/services"
            "/Microdatos_Censo_2024/FeatureServer/0/query")

CAMPOS = [
    "MANZENT", "CUT",
    # poblacion y hogares
    "n_per", "n_hog", "n_edad_0_5", "n_edad_60_mas",
    "n_hog_unipersonales", "n_hog_menores",
    # precariedad habitacional
    "n_viv_hacinadas", "n_viv_irrecuperables", "n_hog_allegados",
    "n_mat_paredes_precarios", "n_tipo_viv_mediagua", "n_tipo_viv_pieza",
    "n_tenencia_arrendada_sin_contrato",
    # servicios basicos
    "n_fuente_agua_publica", "n_fuente_agua_camion", "n_fuente_agua_pozo",
    "n_fuente_elect_publica", "n_comb_cocina_lena",
    # conectividad
    "n_serv_internet_fija", "n_serv_compu",
    # educacion
    "prom_escolaridad18", "n_asistencia_superior",
    # movilidad y otros
    "n_transporte_publico", "n_transporte_camina", "n_discapacidad",
]

PAGINA = 2000


def pedir(url, intentos=4):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "observatorio-civico/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            if i == intentos - 1:
                raise
            time.sleep(2 + i * 3)
    return None


def bajar_comuna(cut):
    """Todas las manzanas de una comuna, paginando hasta agotarlas."""
    feats, offset = [], 0
    while True:
        q = urllib.parse.urlencode({
            "where": f"CUT='{cut}'",
            "outFields": ",".join(CAMPOS),
            "returnGeometry": "true",
            "outSR": "4326",
            "resultOffset": offset,
            "resultRecordCount": PAGINA,
            "f": "geojson",
        })
        d = pedir(SERVICIO + "?" + q)
        lote = d.get("features", [])
        feats += lote
        if len(lote) < PAGINA:
            break
        offset += PAGINA
        time.sleep(0.3)
    return feats


def main():
    comunas = json.load(open(os.path.join(BASE, "data", "raw", "comunas.json"),
                             encoding="utf-8"))["data"]
    # El servicio usa el CUT sin relleno (13123); el proyecto lo maneja con
    # relleno a cinco digitos (13123 igual, pero 01101 en el norte).
    pendientes = [(c["code"], str(int(c["code"])), c["name"]) for c in comunas]

    print(f"{len(pendientes)} comunas · 27 campos · fuente INE via Esri Chile (CC BY-SA 4.0)\n")

    total, fallidas = 0, []
    for i, (code5, cut, nombre) in enumerate(pendientes, 1):
        destino = os.path.join(RAW, f"{code5}.geojson")
        if os.path.exists(destino) and os.path.getsize(destino) > 200:
            with open(destino, encoding="utf-8") as f:
                total += len(json.load(f).get("features", []))
            continue
        try:
            feats = bajar_comuna(cut)
            with open(destino, "w", encoding="utf-8") as f:
                json.dump({"type": "FeatureCollection", "features": feats},
                          f, ensure_ascii=False, separators=(",", ":"))
            total += len(feats)
            print(f"  {i:3}/{len(pendientes)}  {nombre[:24]:<24} {len(feats):>6} manzanas")
        except Exception as e:
            fallidas.append((code5, nombre, str(e)[:60]))
            print(f"  {i:3}/{len(pendientes)}  {nombre[:24]:<24} FALLO: {str(e)[:50]}")
        time.sleep(0.2)

    print(f"\n{total:,} manzanas descargadas")
    if fallidas:
        print(f"{len(fallidas)} comunas fallaron:")
        for c, n, e in fallidas[:12]:
            print(f"   {c} {n}: {e}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
