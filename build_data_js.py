import json, os

base_dir = r"C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios"

with open(os.path.join(base_dir, "data", "snapshot.json"), "r", encoding="utf-8") as f:
    snapshot = json.load(f)

# Asegurar que los datos estén limpios y con encoding perfecto
js_content = "window.OBSERVATORIO_SNAPSHOT = " + json.dumps(snapshot, ensure_ascii=False, indent=2) + ";\n"

with open(os.path.join(base_dir, "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)

with open(os.path.join(base_dir, "static", "data.js"), "w", encoding="utf-8") as f:
    f.write(js_content)

print("data.js generado con éxito.")
