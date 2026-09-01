import json, os

base_dir = r"C:\Users\mandr\.gemini\antigravity\scratch\chile-observatorio-medios"

# Verificar que data.js y snapshot.json tengan todo el dataset completo
with open(os.path.join(base_dir, "data", "snapshot.json"), "r", encoding="utf-8") as f:
    snapshot = json.load(f)

print("Verificando claves del snapshot:")
for k in snapshot.keys():
    print(f"- {k}: {type(snapshot[k]).__name__}")
