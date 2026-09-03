# -*- coding: utf-8 -*-
"""
Detector de anomalias territoriales.

Recorre cada indicador en cada comuna —del orden de 86.000 cifras— y se queda
solo con lo que se aparta de lo que el contexto de esa comuna predice. En vez de
que alguien navegue el mapa a ver que encuentra, el sistema trae los hallazgos.

Es la parte que ningun equipo humano puede hacer a mano, y por eso mismo la que
mas facil produce basura convincente. Cuatro filtros la contienen:

  CONFIABILIDAD  El residuo se contrae por poblacion. Una tasa sobre 600
                 habitantes es azar, y sin esto los hallazgos serian siempre
                 las mismas comunas minusculas.

  RELEVANCIA     Se pondera por cuanta gente vive afectada. Una anomalia en una
                 comuna de 400.000 personas importa mas que la misma anomalia en
                 una de 3.000, aunque la desviacion estadistica sea identica.

  AJUSTE         Si el modelo apenas explica el indicador (R2 bajo), sus residuos
                 son ruido y no anomalias. Se exige un minimo.

  DIVERSIDAD     Como maximo dos hallazgos por comuna y dos por indicador. Sin
                 esto, una sola comuna rara copa la lista entera y el resultado
                 informa de un caso en vez de un pais.

Los indicadores de direccion ambigua (religion, pueblos originarios, tipo de
vivienda) se reportan como 'atipico', nunca como bueno o malo: describen a una
comuna, no la califican.
"""
import json, os, sys
import numpy as np

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "data", "raw")
OUT = os.path.join(BASE, "data", "app")

CONTEXTO = {
    "population_total": "log",
    "population_density": "log",
    "sinim_rural_pct": "lin",
    "median_income": "log",
    "poverty_rate_pct": "lin",
}

# Dimensiones que se excluyen del detector por decision de diseno, no por
# limitacion tecnica. Son rasgos culturales e historicos, no desempeno: que los
# Kawesqar esten en Magallanes o los afrodescendientes de Azapa en Arica no es
# una anomalia, es su territorio. Tratarlos como desviaciones produce hallazgos
# vacios —el patron es geografia historica conocida— y ademas insinua que la
# presencia de un pueblo en su propia tierra es algo que hay que explicar.
# El detector busca problemas sobre los que se puede actuar con politica publica.
IDENTIDAD = ("religion", "pueblos_indigenas", "afrodescendencia", "lenguas",
             "_genero", "credo", "indigena")

# Unidades que ya expresan una magnitud relativa y por tanto son comparables
# entre comunas tal como vienen. Todo lo demas es un conteo absoluto y hay que
# normalizarlo: si no, el detector "descubre" que Puente Alto tiene muchos votos
# y que Las Condes recauda mucho, que es solo decir que son comunas grandes y
# ricas. Se normaliza por defecto y se exceptua esta lista, no al reves.
YA_RELATIVAS = ("%", "puntos", "casos/100k", "por 100k", "hab/km2", "km2", "km²",
                "metros", "ug/m3", "kwh/hab", "miles clp", "clp")

R2_MINIMO = 0.10          # bajo esto, el residuo es ruido y no senal
Z_MINIMO = 1.5            # desviaciones tipicas para que valga la pena mirar
MAX_POR_COMUNA = 2
MAX_POR_INDICADOR = 2
TOTAL = 40


def cargar():
    ind = json.load(open(os.path.join(RAW, "indicators.json"), encoding="utf-8"))["data"]
    com = json.load(open(os.path.join(RAW, "comunas.json"), encoding="utf-8"))["data"]
    vals = {}
    for r in ind:
        p = os.path.join(RAW, f"ind_{r['code']}.json")
        if os.path.exists(p):
            d = json.load(open(p, encoding="utf-8"))
            vals[r["code"]] = {v["comuna_code"]: v["value"]
                               for v in d["values"] if v.get("value") is not None}
    return ind, com, vals


def matriz_contexto(codes, vals):
    cols, ok = [], np.ones(len(codes), dtype=bool)
    for var, tf in CONTEXTO.items():
        v = vals.get(var, {})
        col = np.array([v.get(c, np.nan) for c in codes], dtype=float)
        if tf == "log":
            col = np.where(col > 0, np.log(np.where(col > 0, col, 1)), np.nan)
        ok &= ~np.isnan(col)
        cols.append(col)
    X = np.column_stack(cols)
    mu, sd = np.nanmean(X[ok], axis=0), np.nanstd(X[ok], axis=0)
    sd[sd == 0] = 1.0
    return (X - mu) / sd, ok


def main():
    ind, com, vals = cargar()
    codes = [c["code"] for c in com]
    meta = {c["code"]: c for c in com}
    cat = {r["code"]: r for r in ind}
    Z, ok = matriz_contexto(codes, vals)

    pob = vals.get("population_total", {})
    poblaciones = sorted(v for v in pob.values() if v and v > 0)
    K = float(poblaciones[len(poblaciones) // 2])
    pob_max = float(poblaciones[-1])
    print(f"{len(ind)} indicadores x {len(com)} comunas = {len(ind)*len(com):,} cifras a revisar")
    print(f"contraccion k = {K:,.0f} hab.\n")

    hallazgos, descartados_r2 = [], 0

    excluidos_identidad = 0
    for r in ind:
        code = r["code"]
        if code in CONTEXTO or code not in vals:
            continue
        if any(t in code for t in IDENTIDAD):
            excluidos_identidad += 1
            continue

        # Los conteos absolutos no son comparables entre comunas: Santiago tiene
        # mas de todo porque tiene mas gente, y el detector terminaria diciendo
        # que las comunas grandes son grandes. Se pasan a tasa por cada 1.000
        # habitantes antes de buscar desviaciones.
        serie = vals[code]
        unidad = (r.get("unit") or "").strip().lower()
        normalizada = unidad not in YA_RELATIVAS
        if normalizada:
            serie = {c: (v / pob[c] * 1000.0)
                     for c, v in serie.items() if pob.get(c)}
            if len(serie) < 80:
                continue

        y_raw = np.array([serie.get(c, np.nan) for c in codes], dtype=float)
        m = ok & ~np.isnan(y_raw)
        n = int(m.sum())
        if n < 80:
            continue

        X = np.column_stack([Z[m], np.ones(n)])
        y = y_raw[m]
        beta, *_ = np.linalg.lstsq(X, y, rcond=None)
        pred = X @ beta
        resid = y - pred
        ss_tot = float(((y - y.mean()) ** 2).sum())
        if ss_tot <= 0:
            continue
        r2 = 1 - float((resid ** 2).sum()) / ss_tot
        if r2 < R2_MINIMO:
            descartados_r2 += 1
            continue

        sd = resid.std()
        if sd == 0:
            continue

        direction = r.get("direction")
        signo = -1.0 if direction == "lower_better" else 1.0
        ambiguo = direction == "ambiguous"

        for k, i in enumerate(np.where(m)[0]):
            cc = codes[i]
            p = pob.get(cc) or 0.0
            w = p / (p + K) if p > 0 else 0.0
            z = float(resid[k] / sd) * (1.0 if ambiguo else signo) * w
            if abs(z) < Z_MINIMO:
                continue
            # relevancia: la anomalia pesa segun cuanta gente vive bajo ella
            peso = abs(z) * (0.35 + 0.65 * (np.log1p(p) / np.log1p(pob_max)))
            hallazgos.append({
                "comuna": cc, "nombre": meta[cc]["name"], "region": meta[cc]["region_name"],
                "pop": meta[cc].get("population"),
                "ind": code, "ind_nombre": r["name_es"], "cat": r["category"],
                "unit": ("por 1.000 hab." if normalizada else r["unit"]),
                "year": r["year"], "fuente": r["source"],
                "url": r.get("source_url"),
                "valor": round(float(y[k]), 2), "esperado": round(float(pred[k]), 2),
                "z": round(z, 2), "r2": round(r2, 3),
                "tipo": "atipico" if ambiguo else ("sobre" if z > 0 else "bajo"),
                "peso": round(float(peso), 4),
            })

    print(f"{excluidos_identidad} indicadores de identidad excluidos por diseno")
    print(f"{len(hallazgos):,} desviaciones superan {Z_MINIMO} sigma")
    print(f"{descartados_r2} indicadores descartados por R2 < {R2_MINIMO} (residuo = ruido)\n")

    hallazgos.sort(key=lambda h: -h["peso"])

    # Un indicador con direccion definida senala un problema o un logro sobre el
    # que se puede actuar; uno ambiguo solo describe. "Santiago tiene muchos
    # departamentos con ascensor" es cierto y no sirve para decidir nada, asi que
    # lo descriptivo no puede ocupar mas de un tercio de la lista.
    MAX_ATIPICOS = TOTAL // 3
    sel, por_comuna, por_ind, atipicos = [], {}, {}, 0
    for h in sorted(hallazgos, key=lambda x: (x["tipo"] == "atipico", -x["peso"])):
        if por_comuna.get(h["comuna"], 0) >= MAX_POR_COMUNA:
            continue
        if por_ind.get(h["ind"], 0) >= MAX_POR_INDICADOR:
            continue
        if h["tipo"] == "atipico":
            if atipicos >= MAX_ATIPICOS:
                continue
            atipicos += 1
        sel.append(h)
        por_comuna[h["comuna"]] = por_comuna.get(h["comuna"], 0) + 1
        por_ind[h["ind"]] = por_ind.get(h["ind"], 0) + 1
        if len(sel) >= TOTAL:
            break
    sel.sort(key=lambda x: -x["peso"])

    print(f"{len(sel)} hallazgos seleccionados, {len(set(h['comuna'] for h in sel))} comunas distintas\n")
    for h in sel[:14]:
        flecha = {"sobre": "+", "bajo": "-", "atipico": "~"}[h["tipo"]]
        print(f"  {flecha} {h['nombre'][:19]:<19} {h['ind_nombre'][:44]:<44} "
              f"{h['valor']:>10,.1f} (esp. {h['esperado']:>9,.1f})  {h['z']:+.1f}s")

    payload = {
        "generated_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "revisadas": len(ind) * len(com),
        "sobre_umbral": len(hallazgos),
        "umbral_z": Z_MINIMO,
        "hallazgos": sel,
    }
    p = os.path.join(OUT, "hallazgos.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    print(f"\nhallazgos.json  {os.path.getsize(p)//1024} KB")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
