# -*- coding: utf-8 -*-
"""
Proyecta la geometria en tiempo de build y emite paths SVG listos para pintar.

Motivo: Chile mide 4.300 km de largo por unos 200 de ancho. Dibujado completo en
una sola proyeccion, el pais es una linea vertical donde ninguna comuna del norte
llega a un pixel. Se parte en tres tramos que se muestran lado a lado, cada uno
con su propia escala, y Rapa Nui y Juan Fernandez van en recuadros aparte porque
estan a 3.500 km de la costa y arruinarian el encuadre.

Al proyectar aqui y no en el navegador, el sitio no necesita d3-geo ni
topojson-client: recibe cadenas 'd' y las pinta.
"""
import json, math, os, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = os.path.join(BASE, "data", "geo")
OUT = os.path.join(BASE, "data", "app")
os.makedirs(OUT, exist_ok=True)

# Tramos por latitud. Los cortes caen en limites regionales reales, no en
# numeros redondos: el usuario ve regiones completas en cada tramo.
TRAMOS = [
    {"id": "norte",  "label": "Norte",  "regiones": [15, 1, 2, 3, 4],
     "sub": "Arica y Parinacota a Coquimbo"},
    {"id": "centro", "label": "Centro", "regiones": [5, 13, 6, 7, 16],
     "sub": "Valparaiso a Nuble"},
    {"id": "sur",    "label": "Sur",    "regiones": [8, 9, 14, 10, 11, 12],
     "sub": "Biobio a Magallanes"},
]

# Comunas insulares que se dibujan en recuadro propio.
INSULARES = {"05201": "Rapa Nui", "05104": "Juan Fernandez"}

ANCHO = 300.0     # ancho util de cada tramo en unidades del viewBox
MARGEN = 12.0
DEC = 1           # decimales en las coordenadas: 0,1 unidad es sub-pixel


def leer_topo(path):
    """Decodifica un TopoJSON a features con anillos en lon/lat."""
    topo = json.load(open(path, encoding="utf-8"))
    tr = topo.get("transform")
    sx, sy = (tr["scale"] if tr else (1, 1))
    tx, ty = (tr["translate"] if tr else (0, 0))

    arcos = []
    for arc in topo["arcs"]:
        pts, x, y = [], 0, 0
        for dx, dy in arc:
            if tr:
                x += dx; y += dy
                pts.append((x * sx + tx, y * sy + ty))
            else:
                pts.append((dx, dy))
        arcos.append(pts)

    def anillo(idxs):
        out = []
        for i in idxs:
            a = arcos[~i][::-1] if i < 0 else arcos[i]
            out.extend(a[1:] if out else a)
        return out

    feats = []
    for obj in topo["objects"].values():
        for g in obj.get("geometries", []):
            t = g.get("type")
            if t == "Polygon":
                anillos = [anillo(r) for r in g["arcs"]]
            elif t == "MultiPolygon":
                anillos = [anillo(r) for poly in g["arcs"] for r in poly]
            else:
                continue
            feats.append({"props": g.get("properties", {}), "rings": anillos})
    return feats


def mercator(lon, lat):
    lat = max(min(lat, 84.0), -84.0)
    return (math.radians(lon),
            math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def bounds(feats):
    xs, ys = [], []
    for f in feats:
        for r in f["rings"]:
            for lon, lat in r:
                x, y = mercator(lon, lat)
                xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def hacer_path(rings, fx, fy, min_pts=4):
    """Anillos proyectados a una sola cadena 'd'. Descarta restos degenerados."""
    partes = []
    for r in rings:
        pts, prev = [], None
        for lon, lat in r:
            x, y = mercator(lon, lat)
            p = (round(fx(x), DEC), round(fy(y), DEC))
            if p != prev:                      # colapsa puntos repetidos tras redondear
                pts.append(p); prev = p
        if len(pts) < min_pts:
            continue
        partes.append("M" + "L".join(f"{x},{y}" for x, y in pts) + "Z")
    return "".join(partes)


def encuadrar(feats, ancho=ANCHO):
    """Escala y traslada un grupo de features a un lienzo de ancho fijo."""
    x0, y0, x1, y1 = bounds(feats)
    dx, dy = (x1 - x0) or 1e-9, (y1 - y0) or 1e-9
    k = (ancho - 2 * MARGEN) / dx
    alto = dy * k + 2 * MARGEN
    fx = lambda x: (x - x0) * k + MARGEN
    fy = lambda y: (y1 - y) * k + MARGEN     # y invertida: norte arriba
    return fx, fy, ancho, alto


def main():
    com = leer_topo(os.path.join(GEO, "comunas.topo.json"))
    reg = leer_topo(os.path.join(GEO, "regiones.topo.json"))
    print(f"{len(com)} comunas y {len(reg)} regiones leidas del topojson")

    # El GeoJSON de BCN trae el codigo como entero, asi que Iquique llega como
    # 1101; las fuentes estadisticas lo usan con relleno a cinco digitos (01101).
    # Sin normalizar, las 206 comunas de las regiones 1 a 9 no cruzan con ningun
    # dato y el mapa las pinta como "sin informacion" sin avisar de nada.
    por_codigo = {}
    for f in com:
        cc = str(f["props"].get("cod_comuna")).zfill(5)
        por_codigo[cc] = f

    salida = {"tramos": [], "insulares": [], "regiones": {}}
    vistas = set()

    for T in TRAMOS:
        sel = [f for cc, f in por_codigo.items()
               if f["props"].get("codregion") in T["regiones"] and cc not in INSULARES]
        if not sel:
            continue
        fx, fy, w, h = encuadrar(sel)
        comunas = []
        for f in sel:
            cc = str(f["props"]["cod_comuna"]).zfill(5)
            d = hacer_path(f["rings"], fx, fy)
            if not d:
                continue
            comunas.append({"c": cc, "n": f["props"].get("Comuna"),
                            "r": f["props"].get("codregion"), "d": d})
            vistas.add(cc)

        # contorno de cada region dentro del tramo, para el trazo grueso
        cont = {}
        for f in reg:
            rid = f["props"].get("codregion")
            if rid in T["regiones"]:
                d = hacer_path(f["rings"], fx, fy, min_pts=6)
                if d:
                    cont[str(rid)] = d

        salida["tramos"].append({
            "id": T["id"], "label": T["label"], "sub": T["sub"],
            "w": round(w, 1), "h": round(h, 1),
            "comunas": comunas, "regiones": cont,
        })
        print(f"  tramo {T['label']:<7} {len(comunas):3} comunas   viewBox 0 0 {w:.0f} {h:.0f}")

    # islas oceanicas, cada una en su propio recuadro
    for cc, nombre in INSULARES.items():
        f = por_codigo.get(cc)
        if not f:
            continue
        fx, fy, w, h = encuadrar([f], ancho=88)
        d = hacer_path(f["rings"], fx, fy, min_pts=3)
        if d:
            salida["insulares"].append({"c": cc, "n": nombre, "d": d,
                                        "w": round(w, 1), "h": round(h, 1)})
            vistas.add(cc)
            print(f"  inset {nombre}")

    faltan = set(por_codigo) - vistas
    if faltan:
        print(f"  AVISO: {len(faltan)} comunas sin dibujar: {sorted(faltan)[:10]}")

    p = os.path.join(OUT, "mapa.json")
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(salida, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"\nmapa.json  {os.path.getsize(p)//1024} KB")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
