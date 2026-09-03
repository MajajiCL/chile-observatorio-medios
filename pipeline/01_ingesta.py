# -*- coding: utf-8 -*-
"""Descarga el catalogo completo de Chile Abierto: 70 indicadores x 349 comunas.
Respeta el rate limit publico (60 req/min) con pausa de 1.1s entre llamadas."""
import json, os, sys, time, urllib.request

API = "https://chileabierto.cl/api/v1"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(OUT, exist_ok=True)

def get(path):
    req = urllib.request.Request(API + path, headers={"User-Agent": "observatorio-civico/1.0"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.load(r)

def save(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

print("[1/3] catalogo de indicadores...")
ind = get("/indicators")
save("indicators.json", ind)
codes = [r["code"] for r in ind["data"]]
print(f"      {len(codes)} indicadores")

print("[2/3] comunas...")
# OJO: la API ignora los parametros limit y page; devuelve siempre el listado
# completo. Paginar aqui provoca un bucle infinito. Una sola llamada basta.
d = get("/comunas")
comunas = d.get("data", [])
save("comunas.json", {"data": comunas, "total": d.get("total")})
print(f"      {len(comunas)} comunas")

print("[3/3] valores por indicador...")
ok, fail = 0, []
for i, c in enumerate(codes, 1):
    try:
        save(f"ind_{c}.json", get(f"/indicators/{c}"))
        ok += 1
        print(f"      {i:2}/{len(codes)}  {c}")
    except Exception as e:
        fail.append((c, str(e)[:60]))
        print(f"      {i:2}/{len(codes)}  {c}  FALLO: {e}")
    time.sleep(1.1)

print(f"\nOK {ok}/{len(codes)}")
if fail:
    print("Fallaron:", fail)
