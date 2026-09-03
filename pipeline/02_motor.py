# -*- coding: utf-8 -*-
"""
Motor de brechas territoriales.

Convierte el catalogo crudo de Chile Abierto en lo que el observatorio publica:
para cada comuna y cada indicador de resultado, cuanto se aparta del valor que
su propio contexto predice.

Dos calculos, deliberadamente distintos:

  PARES    Las 15 comunas mas parecidas en tamano, ruralidad, ingreso y pobreza.
           Sirve para responder "comparado con comunas como la mia".

  BRECHA   Residuo de una regresion del indicador contra ese mismo contexto.
           Positivo = rinde por encima de lo que su contexto predice.
           El signo se normaliza segun 'direction', de modo que en todo el
           sistema positivo siempre significa "mejor de lo esperado".

No se calcula brecha para indicadores de direccion ambigua: sin un sentido de
"mejor" definido, un residuo no significa nada.
"""
import json, os, sys
import numpy as np

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "data", "raw")
OUT = os.path.join(BASE, "data", "app")
os.makedirs(os.path.join(OUT, "comuna"), exist_ok=True)

# Variables que describen el contexto de una comuna. Son predictores, nunca
# resultados: no tiene sentido preguntar si una comuna "es mas rural de lo
# esperado".
CONTEXTO = {
    "population_total": "log",
    "population_density": "log",
    "sinim_rural_pct": "lin",
    "median_income": "log",
    "poverty_rate_pct": "lin",
}

# Las capas del mapa. Pocas y curadas: cada una responde una pregunta concreta.
# El resto de los 70 indicadores vive en la ficha de cada comuna.
CAPAS = [
    ("crime_rate_per_100k",   "Seguridad",   "Donde el delito supera lo que el contexto predice"),
    ("paes_comprension_2024", "Educacion",   "Donde se aprende mas de lo que el contexto permite"),
    ("sinim_fcm_dependency",  "Autonomia",   "Que municipios no pueden financiarse solos"),
    ("poverty_rate_pct",      "Pobreza",     "Donde la pobreza es peor de lo que el contexto explica"),
    ("transparency_score",    "Transparencia","Que municipios rinden cuentas y cuales no"),
    ("median_income",         "Ingreso",     "Mediana del ingreso imponible de asalariados"),
]

N_PARES = 15


def cargar():
    ind = json.load(open(os.path.join(RAW, "indicators.json"), encoding="utf-8"))["data"]
    com = json.load(open(os.path.join(RAW, "comunas.json"), encoding="utf-8"))["data"]
    vals = {}
    for r in ind:
        p = os.path.join(RAW, f"ind_{r['code']}.json")
        if not os.path.exists(p):
            continue
        d = json.load(open(p, encoding="utf-8"))
        vals[r["code"]] = {
            v["comuna_code"]: v["value"]
            for v in d["values"] if v.get("value") is not None
        }
    return ind, com, vals


def matriz_contexto(codes, vals):
    """Matriz estandarizada de contexto. Devuelve (X, mascara_de_completos)."""
    cols, ok = [], np.ones(len(codes), dtype=bool)
    for var, tf in CONTEXTO.items():
        v = vals.get(var, {})
        col = np.array([v.get(c, np.nan) for c in codes], dtype=float)
        if tf == "log":
            col = np.where(col > 0, np.log(np.where(col > 0, col, 1)), np.nan)
        ok &= ~np.isnan(col)
        cols.append(col)
    X = np.column_stack(cols)
    # estandarizar usando solo las filas completas
    mu = np.nanmean(X[ok], axis=0)
    sd = np.nanstd(X[ok], axis=0)
    sd[sd == 0] = 1.0
    return (X - mu) / sd, ok


def calcular_pares(codes, Z, ok):
    """Las N comunas mas cercanas en el espacio de contexto."""
    pares = {}
    idx_ok = np.where(ok)[0]
    Zok = Z[idx_ok]
    for pos, i in enumerate(idx_ok):
        d = np.sqrt(((Zok - Zok[pos]) ** 2).sum(axis=1))
        orden = np.argsort(d)[1:N_PARES + 1]      # el 0 es la comuna misma
        pares[codes[i]] = [codes[idx_ok[j]] for j in orden]
    return pares


def calcular_brecha(codes, Z, ok, serie, direction, pob=None, k_shrink=None):
    """
    Residuo estandarizado del indicador contra el contexto.
    Devuelve (dict por comuna, r2, n). Signo normalizado: + es siempre mejor.

    Ademas del residuo crudo ('z') se entrega uno contraido por tamano ('zs').

    Por que: una tasa "por 100.000 habitantes" calculada sobre una comuna de 600
    personas se mueve enteramente por azar. Sin corregir, los extremos de
    cualquier ranking los ocupan siempre las comunas mas chicas, que es justo el
    error que este proyecto le reprocha a los rankings. La contraccion pondera
    cada residuo por pob/(pob+k): las comunas grandes conservan su brecha casi
    intacta y las minusculas se acercan a cero, que es lo que la evidencia
    permite afirmar sobre ellas.
    """
    y_raw = np.array([serie.get(c, np.nan) for c in codes], dtype=float)
    m = ok & ~np.isnan(y_raw)
    n = int(m.sum())
    if n < 40:
        return {}, None, n

    X = np.column_stack([Z[m], np.ones(n)])
    y = y_raw[m]
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    pred = X @ beta
    resid = y - pred

    ss_res = float((resid ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else None

    sd = resid.std()
    if sd == 0:
        return {}, r2, n
    # en indicadores donde menos es mejor, invertimos para que + sea siempre bueno
    signo = -1.0 if direction == "lower_better" else 1.0

    out, sel = {}, np.where(m)[0]
    for k, i in enumerate(sel):
        z = float(resid[k] / sd) * signo
        cc = codes[i]
        if pob and k_shrink:
            p = pob.get(cc) or 0.0
            w = p / (p + k_shrink) if p > 0 else 0.0
        else:
            w = 1.0
        out[cc] = {
            "z": round(z, 3),
            "zs": round(z * w, 3),
            "w": round(w, 3),
            "d": round(float(resid[k]) * signo, 2),
            "e": round(float(pred[k]), 2),
        }
    return out, r2, n


def main():
    ind, com, vals = cargar()
    print(f"{len(ind)} indicadores  |  {len(com)} comunas  |  {len(vals)} series cargadas")

    codes = [c["code"] for c in com]
    meta = {c["code"]: c for c in com}
    Z, ok = matriz_contexto(codes, vals)
    print(f"Comunas con contexto completo: {int(ok.sum())} de {len(codes)}")

    pares = calcular_pares(codes, Z, ok)

    # Constante de contraccion: la mediana de poblacion comunal. Con ella, una
    # comuna de tamano mediano conserva la mitad de su brecha y las muy pequenas
    # se contraen hacia cero.
    pob_map = vals.get("population_total", {})
    poblaciones = sorted(v for v in pob_map.values() if v and v > 0)
    K_SHRINK = float(poblaciones[len(poblaciones) // 2]) if poblaciones else 0.0
    print(f"Contraccion por tamano: k = {K_SHRINK:,.0f} habitantes (mediana comunal)")

    cat = {r["code"]: r for r in ind}
    brechas, diag = {}, []
    for r in ind:
        code, direction = r["code"], r.get("direction")
        # Un predictor no puede tener brecha contra si mismo: predecir la pobreza
        # a partir de la pobreza da R2=1 y no significa nada. Los indicadores de
        # contexto describen la situacion, no la explican.
        if direction == "ambiguous" or code not in vals or code in CONTEXTO:
            continue
        g, r2, n = calcular_brecha(codes, Z, ok, vals[code], direction, pob_map, K_SHRINK)
        if g:
            brechas[code] = g
            diag.append({"code": code, "name": r["name_es"], "r2": round(r2, 3) if r2 else None, "n": n})

    diag.sort(key=lambda x: -(x["r2"] or 0))
    print(f"\nBrechas calculadas para {len(brechas)} indicadores.")
    print("\nCuanto del indicador explica el puro contexto socioeconomico:")
    for d in diag[:8]:
        print(f"   R2={d['r2']:.2f}  n={d['n']:3}  {d['name']}")
    print("   ...")
    for d in diag[-4:]:
        print(f"   R2={d['r2']:.2f}  n={d['n']:3}  {d['name']}")

    # ---- core.json: lo que carga el mapa al abrir ----
    capas = []
    for code, etiq, pregunta in CAPAS:
        if code not in vals:
            print(f"   AVISO: capa '{code}' sin datos, se omite")
            continue
        r = cat[code]
        capas.append({
            "code": code, "label": etiq, "question": pregunta,
            "name": r["name_es"], "unit": r["unit"], "year": r["year"],
            "direction": r["direction"], "source": r["source"],
            "source_url": r.get("source_url"), "avg": r.get("national_avg"),
            "values": {k: round(v, 2) for k, v in vals[code].items()},
            "gaps": brechas.get(code, {}),
            "r2": next((d["r2"] for d in diag if d["code"] == code), None),
            # las capas de contexto se pintan por valor; no admiten brecha
            "context_only": code in CONTEXTO,
        })

    core = {
        "generated_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "comunas": [{
            "c": c["code"], "n": c["name"], "r": c["region_id"],
            "rn": c["region_name"], "p": c.get("province_name"),
            "lat": c.get("lat"), "lng": c.get("lng"), "pop": c.get("population"),
        } for c in com],
        "layers": capas,
        "catalog": [{
            "c": r["code"], "n": r["name_es"], "u": r["unit"], "y": r["year"],
            "cat": r["category"], "dir": r.get("direction"),
            "avg": r.get("national_avg"), "src": r.get("source"),
            "url": r.get("source_url"), "ctx": r["code"] in CONTEXTO,
        } for r in ind],
        "diagnostics": diag,
        "n_indicators": len(ind),
    }
    with open(os.path.join(OUT, "core.json"), "w", encoding="utf-8") as f:
        json.dump(core, f, ensure_ascii=False, separators=(",", ":"))
    print(f"\ncore.json  {os.path.getsize(os.path.join(OUT,'core.json'))//1024} KB")

    # ---- una ficha por comuna, cargada solo al hacer clic ----
    for c in com:
        cc = c["code"]
        ficha = {"c": cc, "n": c["name"], "rn": c["region_name"],
                 "p": c.get("province_name"), "pop": c.get("population"),
                 "peers": [{"c": p, "n": meta[p]["name"]} for p in pares.get(cc, [])],
                 "ind": []}
        for r in ind:
            code = r["code"]
            v = vals.get(code, {}).get(cc)
            if v is None:
                continue
            # solo cifras: nombre, unidad, fuente y ano viven una vez en core.json
            row = {"c": code, "v": round(v, 2)}
            g = brechas.get(code, {}).get(cc)
            if g:
                row["z"] = g["zs"]      # el contraido es el que se muestra
                row["zr"] = g["z"]      # el crudo queda disponible
                row["e"] = g["e"]
            # posicion dentro del grupo de pares
            pv = [vals[code][p] for p in pares.get(cc, []) if p in vals.get(code, {})]
            if len(pv) >= 5:
                mejor_arriba = r.get("direction") == "higher_better"
                peores = sum(1 for x in pv if (x < v if mejor_arriba else x > v))
                row["pk"] = round(peores / len(pv) * 100)
                row["pn"] = len(pv)
            ficha["ind"].append(row)
        with open(os.path.join(OUT, "comuna", f"{cc}.json"), "w", encoding="utf-8") as f:
            json.dump(ficha, f, ensure_ascii=False, separators=(",", ":"))

    tot = sum(os.path.getsize(os.path.join(OUT, "comuna", f)) for f in os.listdir(os.path.join(OUT, "comuna")))
    print(f"fichas     {len(com)} archivos, {tot//1024} KB en total")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
