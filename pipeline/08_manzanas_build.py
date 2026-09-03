# -*- coding: utf-8 -*-
"""
Convierte las manzanas descargadas en lo que el sitio puede servir.

El problema es de peso: 216.341 manzanas con geometria completa son unos 400 MB,
imposibles de entregar a un navegador. Tres reducciones, en este orden:

  RECORTE       De los 27 campos se derivan 9 indicadores, ya como porcentaje
                sobre su denominador correcto (hogares o personas). Un conteo
                absoluto por manzana no dice nada: toda manzana grande tiene
                mas de todo.

  GEOMETRIA     Cada manzana se proyecta a metros reales —no a una escala
                relativa a la comuna, que arruinaria la precision en las comunas
                enormes del norte— y se simplifica con Douglas-Peucker a 3 m de
                tolerancia. Una manzana urbana es practicamente un rectangulo,
                asi que de los 50 puntos originales sobreviven unos diez sin
                diferencia visible. Aqui si se puede simplificar cada poligono
                por separado: entre manzanas hay calles, no bordes compartidos.

  PARTICION     Un archivo por comuna. El sitio carga solo el de la comuna que
                se esta mirando, no el pais entero.

El resultado es del orden de 200 KB por comuna, que se descarga al instante.
"""
import json, math, os, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "data", "manzanas_raw")
OUT = os.path.join(BASE, "data", "app", "manzana")
os.makedirs(OUT, exist_ok=True)

# Cada indicador con su denominador: sin eso solo se estaria midiendo tamano.
# 'hog' = hogares censados, 'per' = poblacion, None = valor tal cual.
# clave, campo de origen, denominador, nombre, direccion, unidad
INDICADORES = [
    ("hac",  "n_viv_hacinadas",             "hog", "Viviendas hacinadas",          "menos", "%"),
    ("irr",  "n_viv_irrecuperables",        "hog", "Viviendas irrecuperables",     "menos", "%"),
    ("alle", "n_hog_allegados",             "hog", "Hogares allegados",            "menos", "%"),
    ("prec", "n_mat_paredes_precarios",     "hog", "Paredes de material precario", "menos", "%"),
    ("agua", "n_fuente_agua_camion",        "hog", "Agua por camión aljibe",       "menos", "%"),
    ("lena", "n_comb_cocina_lena",          "hog", "Cocina a leña",                "menos", "%"),
    ("net",  "n_serv_internet_fija",        "hog", "Internet fija",                "mas",   "%"),
    ("sup",  "n_asistencia_superior",       "per", "Asiste a educación superior",  "mas",   "%"),
    ("esc",  "prom_escolaridad18",          None,  "Años de escolaridad (18+)",    "mas",   "años"),
]

R_TIERRA = 6378137.0     # metros; proyecta a distancias reales
TOL = 3.0                # tolerancia de simplificacion, en metros
MIN_PTS = 4


def mercator(lon, lat):
    """Web Mercator en metros. Basta para distancias dentro de una comuna."""
    lat = max(min(lat, 84.0), -84.0)
    return (R_TIERRA * math.radians(lon),
            R_TIERRA * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def simplificar(pts, tol):
    """Douglas-Peucker iterativo: conserva la forma y descarta lo colineal."""
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
            if norma == 0:
                d = math.hypot(px - ax, py - ay)
            else:
                d = abs(dy * px - dx * py + bx * ay - by * ax) / norma
            if d > peor:
                peor, peor_i = d, i
        if peor > tol:
            keep[peor_i] = True
            pila.append((a, peor_i))
            pila.append((peor_i, b))
    return [p for p, k in zip(pts, keep) if k]


def anillos(geom):
    t = geom.get("type")
    if t == "Polygon":
        return geom["coordinates"]
    if t == "MultiPolygon":
        return [r for poly in geom["coordinates"] for r in poly]
    return []


def main():
    archivos = sorted(f for f in os.listdir(RAW) if f.endswith(".geojson"))
    print(f"{len(archivos)} comunas descargadas\n")

    total_mz, total_kb, sin_datos = 0, 0, 0

    for nombre in archivos:
        code = nombre.replace(".geojson", "")
        with open(os.path.join(RAW, nombre), encoding="utf-8") as f:
            feats = json.load(f).get("features", [])
        if not feats:
            sin_datos += 1
            continue

        # encuadre propio de la comuna: maximiza la precision al redondear
        xs, ys = [], []
        for ft in feats:
            for r in anillos(ft.get("geometry") or {}):
                for lon, lat in r:
                    x, y = mercator(lon, lat)
                    xs.append(x); ys.append(y)
        if not xs:
            sin_datos += 1
            continue

        # Encuadre en metros: el origen es la esquina noroeste de la comuna y
        # una unidad es un metro, asi que la precision no depende del tamano.
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        W, H = round(x1 - x0), round(y1 - y0)

        salida = []
        for ft in feats:
            p = ft.get("properties") or {}
            geom = ft.get("geometry")
            if not geom:
                continue

            partes = []
            for r in anillos(geom):
                pts, prev = [], None
                for lon, lat in r:
                    mx, my = mercator(lon, lat)
                    q = (mx - x0, y1 - my)          # y invertida: norte arriba
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
            fila = {"m": str(p.get("MANZENT")), "d": "".join(partes),
                    "p": int(per), "h": int(hog)}

            for clave, campo, den, _, _dir, _u in INDICADORES:
                v = p.get(campo)
                if v is None:
                    continue
                if den is None:
                    fila[clave] = round(float(v), 1)
                else:
                    base = hog if den == "hog" else per
                    if base and base > 0:
                        fila[clave] = round(float(v) / base * 100.0, 1)
            salida.append(fila)

        if not salida:
            sin_datos += 1
            continue

        destino = os.path.join(OUT, f"{code}.json")
        with open(destino, "w", encoding="utf-8") as f:
            json.dump({"c": code, "w": W, "h": H, "mz": salida},
                      f, ensure_ascii=False, separators=(",", ":"))
        total_mz += len(salida)
        total_kb += os.path.getsize(destino) / 1024

    print(f"{total_mz:,} manzanas procesadas")
    print(f"{total_kb/1024:.1f} MB en total, {total_kb/max(1,len(archivos)-sin_datos):.0f} KB por comuna")
    if sin_datos:
        print(f"{sin_datos} comunas sin manzanas con geometria")

    # catalogo de capas de manzana, para que el sitio sepa que mostrar
    cat = [{"k": k, "n": n, "dir": dr, "u": u} for k, c, d, n, dr, u in INDICADORES]
    with open(os.path.join(BASE, "data", "app", "manzana_capas.json"), "w", encoding="utf-8") as f:
        json.dump({
            "capas": cat,
            "comunas": sorted(x[:-5] for x in os.listdir(OUT)),
            "fuente": "INE — Censo de Población y Vivienda 2024",
            "via": "Esri Chile · Microdatos Censo 2024",
            "licencia": "CC BY-SA 4.0",
        }, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
