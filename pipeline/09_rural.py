# -*- coding: utf-8 -*-
"""
Capa rural del Censo 2024: 28.415 entidades pobladas, con nombre propio.

Las manzanas del paso 07 cubren la ciudad. Este paso cubre lo demas: caserios,
comunidades indigenas, fundos, asentamientos mineros y pesqueros, parcelas y
veranadas. Es el Chile que no cabe en una manzana urbana y que, a nivel comunal,
desaparece dentro del promedio.

Trae ademas lo que ninguna otra capa del proyecto tiene: NOM_LOCALIDAD y
NOM_ENTIDAD, o sea el nombre con que la gente llama al lugar donde vive.

Sale en archivos propios, separados de las manzanas urbanas. Un fundo puede
medir kilometros y una manzana cien metros; mezclarlos en un mismo encuadre
dejaria la ciudad reducida a un punto ilegible.

Este paso descarga y construye en una sola pasada: son 28.415 registros, un
octavo de las manzanas, y no compensa partirlo en dos.
"""
import json, math, os, sys, time, urllib.parse, urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRUDO = os.path.join(BASE, "data", "rural_raw")
OUT = os.path.join(BASE, "data", "app", "rural")
os.makedirs(CRUDO, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

SERVICIO = ("https://services.arcgis.com/r7t1P5pnkoOLRdhr/arcgis/rest/services"
            "/Microdatos_Censo_2024/FeatureServer/1/query")

# Los mismos indicadores que en la capa urbana, mas los nombres del lugar.
CAMPOS = [
    "MANZENT", "CUT", "NOM_LOCALIDAD", "NOM_ENTIDAD", "TIPO_CATEGORIA",
    "n_per", "n_hog",
    "n_viv_hacinadas", "n_viv_irrecuperables", "n_hog_allegados",
    "n_mat_paredes_precarios", "n_fuente_agua_camion", "n_fuente_agua_pozo",
    "n_fuente_elect_publica", "n_comb_cocina_lena",
    "n_serv_internet_fija", "prom_escolaridad18", "n_asistencia_superior",
]

# clave, campo, denominador, nombre, direccion, unidad
INDICADORES = [
    ("hac",  "n_viv_hacinadas",         "hog", "Viviendas hacinadas",           "menos", "%"),
    ("irr",  "n_viv_irrecuperables",    "hog", "Viviendas irrecuperables",      "menos", "%"),
    ("alle", "n_hog_allegados",         "hog", "Hogares allegados",             "menos", "%"),
    ("prec", "n_mat_paredes_precarios", "hog", "Paredes de material precario",  "menos", "%"),
    ("agua", "n_fuente_agua_camion",    "hog", "Agua por camión aljibe",        "menos", "%"),
    ("pozo", "n_fuente_agua_pozo",      "hog", "Agua de pozo o noria",          "menos", "%"),
    ("luz",  "n_fuente_elect_publica",  "hog", "Electricidad de red pública",   "mas",   "%"),
    ("lena", "n_comb_cocina_lena",      "hog", "Cocina a leña",                 "menos", "%"),
    ("net",  "n_serv_internet_fija",    "hog", "Internet fija",                 "mas",   "%"),
    ("esc",  "prom_escolaridad18",      None,  "Años de escolaridad (18+)",     "mas",   "años"),
]

R_TIERRA = 6378137.0
TOL = 8.0            # mas holgada que en ciudad: aqui los poligonos son enormes
MIN_PTS = 4
PAGINA = 1000


def pedir(url, intentos=4):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "observatorio-civico/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(2 + i * 3)
    return None


def bajar_comuna(cut):
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
        time.sleep(0.25)
    return feats


def mercator(lon, lat):
    lat = max(min(lat, 84.0), -84.0)
    return (R_TIERRA * math.radians(lon),
            R_TIERRA * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def simplificar(pts, tol):
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    pila = [(0, len(pts) - 1)]
    while pila:
        a, b = pila.pop()
        if b <= a + 1:
            continue
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        norma = math.hypot(dx, dy)
        peor, peor_i = -1.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = (math.hypot(px - ax, py - ay) if norma == 0
                 else abs(dy * px - dx * py + bx * ay - by * ax) / norma)
            if d > peor:
                peor, peor_i = d, i
        if peor > tol:
            keep[peor_i] = True
            pila.append((a, peor_i))
            pila.append((peor_i, b))
    return [p for p, k in zip(pts, keep) if k]


def anillos(geom):
    t = (geom or {}).get("type")
    if t == "Polygon":
        return geom["coordinates"]
    if t == "MultiPolygon":
        return [r for poly in geom["coordinates"] for r in poly]
    return []


def construir(code, feats):
    xs, ys = [], []
    for ft in feats:
        for r in anillos(ft.get("geometry")):
            for lon, lat in r:
                x, y = mercator(lon, lat)
                xs.append(x); ys.append(y)
    if not xs:
        return None

    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    W, H = round(x1 - x0), round(y1 - y0)

    filas = []
    for ft in feats:
        p = ft.get("properties") or {}
        partes = []
        for r in anillos(ft.get("geometry")):
            pts, prev = [], None
            for lon, lat in r:
                mx, my = mercator(lon, lat)
                q = (mx - x0, y1 - my)
                if q != prev:
                    pts.append(q); prev = q
            pts = simplificar(pts, TOL)
            ent, prev = [], None
            for a, b in pts:
                q = (round(a), round(b))
                if q != prev:
                    ent.append(q); prev = q
            if len(ent) >= MIN_PTS:
                partes.append("M" + "L".join(f"{a},{b}" for a, b in ent) + "Z")
        if not partes:
            continue

        per = p.get("n_per") or 0
        hog = p.get("n_hog") or 0
        fila = {
            "d": "".join(partes),
            "l": (p.get("NOM_LOCALIDAD") or "").strip(),
            "e": (p.get("NOM_ENTIDAD") or "").strip(),
            "t": (p.get("TIPO_CATEGORIA") or "").strip(),
            "p": int(per), "h": int(hog),
        }
        for clave, campo, den, _n, _d, _u in INDICADORES:
            v = p.get(campo)
            if v is None:
                continue
            if den is None:
                fila[clave] = round(float(v), 1)
            else:
                base = hog if den == "hog" else per
                if base and base > 0:
                    fila[clave] = round(float(v) / base * 100.0, 1)
        filas.append(fila)

    return {"c": code, "w": W, "h": H, "ent": filas} if filas else None


def main():
    comunas = json.load(open(os.path.join(BASE, "data", "raw", "comunas.json"),
                             encoding="utf-8"))["data"]
    print(f"{len(comunas)} comunas · capa rural del Censo 2024 (INE vía Esri Chile)\n")

    total_ent, total_kb, vacias, fallidas = 0, 0, 0, []

    for i, c in enumerate(comunas, 1):
        code = c["code"]
        cut = str(int(code))
        crudo = os.path.join(CRUDO, f"{code}.geojson")

        if os.path.exists(crudo) and os.path.getsize(crudo) > 60:
            feats = json.load(open(crudo, encoding="utf-8")).get("features", [])
        else:
            try:
                feats = bajar_comuna(cut)
                with open(crudo, "w", encoding="utf-8") as f:
                    json.dump({"type": "FeatureCollection", "features": feats},
                              f, ensure_ascii=False, separators=(",", ":"))
            except Exception as e:
                fallidas.append((code, c["name"], str(e)[:50]))
                print(f"  {i:3}/{len(comunas)}  {c['name'][:22]:<22} FALLO: {str(e)[:44]}")
                continue
            time.sleep(0.15)

        if not feats:
            vacias += 1
            continue

        datos = construir(code, feats)
        if not datos:
            vacias += 1
            continue

        destino = os.path.join(OUT, f"{code}.json")
        with open(destino, "w", encoding="utf-8") as f:
            json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
        total_ent += len(datos["ent"])
        total_kb += os.path.getsize(destino) / 1024
        if i % 25 == 0 or len(feats) > 400:
            print(f"  {i:3}/{len(comunas)}  {c['name'][:22]:<22} {len(datos['ent']):>5} entidades")

    print(f"\n{total_ent:,} entidades rurales publicadas")
    print(f"{total_kb/1024:.1f} MB · {total_kb/max(1, len(comunas)-vacias):.0f} KB por comuna")
    if vacias:
        print(f"{vacias} comunas sin poblacion rural censada (son urbanas por completo)")
    if fallidas:
        print(f"{len(fallidas)} comunas fallaron: {fallidas[:6]}")

    cat = [{"k": k, "n": n, "dir": d, "u": u} for k, _c, _den, n, d, u in INDICADORES]
    with open(os.path.join(BASE, "data", "app", "rural_capas.json"), "w", encoding="utf-8") as f:
        json.dump({
            "capas": cat,
            # en que comunas existe esta escala: el conmutador lo necesita para
            # no ofrecer un boton que solo puede fallar
            "comunas": sorted(x[:-5] for x in os.listdir(OUT)),
            "fuente": "INE — Censo de Población y Vivienda 2024",
            "via": "Esri Chile · Microdatos Censo 2024, capa manzanas-entidades",
            "licencia": "CC BY-SA 4.0",
        }, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
