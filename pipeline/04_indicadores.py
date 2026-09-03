# -*- coding: utf-8 -*-
"""
Refresca los indicadores economicos que si cambian a diario.

Deliberadamente separado del resto del pipeline: la pobreza es CASEN 2022 y el
PAES es 2024. Meterlos en el mismo archivo "actualizado hoy" seria sugerir una
frescura que esos datos no tienen, y la credibilidad es el producto.
"""
import json, os, sys, urllib.request
from datetime import datetime, timezone

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "data", "app", "indicadores.json")
QUIERO = ["uf", "dolar", "euro", "utm", "ipc", "imacec", "tpm"]


def main():
    req = urllib.request.Request("https://mindicador.cl/api",
                                 headers={"User-Agent": "observatorio-civico/1.0"})
    with urllib.request.urlopen(req, timeout=45) as r:
        d = json.load(r)

    out = []
    for k in QUIERO:
        v = d.get(k)
        if not isinstance(v, dict) or v.get("valor") is None:
            continue
        out.append({
            "code": k,
            "name": v.get("nombre"),
            "value": v.get("valor"),
            "unit": v.get("unidad_medida"),
            "date": (v.get("fecha") or "")[:10],
        })

    if not out:
        raise SystemExit("mindicador no devolvio ningun indicador utilizable")

    payload = {
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "mindicador.cl",
        "source_url": "https://mindicador.cl",
        "indicators": out,
    }

    # Escribir solo si cambio algo, para no generar commits vacios cada dia.
    if os.path.exists(OUT):
        try:
            prev = json.load(open(OUT, encoding="utf-8"))
            if prev.get("indicators") == out:
                print("sin cambios")
                return
        except Exception:
            pass

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print("actualizado:", ", ".join(f"{i['code']}={i['value']}" for i in out))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
