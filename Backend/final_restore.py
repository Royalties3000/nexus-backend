import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"
BACKUP_FILE = 'maintenance_backup.json'

def parse_safely(data):
    if not data: return []
    if isinstance(data, list): return data
    try:
        return json.loads(data)
    except:
        return []

def restore():
    print("--- DEBUG START ---")
    
    # 1. Check if file exists
    if not os.path.exists(BACKUP_FILE):
        print(f"❌ ERROR: File '{BACKUP_FILE}' not found in {os.getcwd()}")
        return

    # 2. Try to load JSON
    try:
        with open(BACKUP_FILE, 'r') as f:
            data = json.load(f)
        print(f"📂 File loaded successfully.")
    except Exception as e:
        print(f"❌ ERROR: Could not read JSON file: {e}")
        return

    # 3. Check for data
    assets = data.get('assets', [])
    engineers = data.get('engineers', [])
    print(f"📦 Found {len(assets)} assets and {len(engineers)} engineers in backup.")

    if not assets and not engineers:
        print("⚠️ Warning: Backup file is empty or formatted incorrectly.")
        return

    # 4. Inject Assets
    for a in assets:
        try:
            payload = {
                "asset_id": a["asset_id"],
                "asset_type": a["asset_type"],
                "model_class": a.get("model_class", "Standard"),
                "serial_key": a.get("serial_key", "N/A"),
                "health_score": float(a.get("health_score", 100)),
                "risk_level": int(a.get("risk_level", 3)),
                "responsible_teams": parse_safely(a.get("responsible_teams")),
                "required_certifications": parse_safely(a.get("required_certifications"))
            }
            res = requests.post(f"{BASE_URL}/assets/add", json=payload, timeout=5)
            print(f"Asset {a['asset_id']}: {res.status_code} {res.reason}")
        except Exception as e:
            print(f"❌ Failed to send asset {a.get('asset_id')}: {e}")

    # 5. Inject Engineers
    for e in engineers:
        try:
            payload = {
                "engineer_id": e["engineer_id"],
                "name": e["name"],
                "team": e["team"],
                "certifications": parse_safely(e.get("certifications")),
                "availability": e.get("availability", "Day"),
                "fatigue": float(e.get("fatigue", 0.0))
            }
            res = requests.post(f"{BASE_URL}/engineers", json=payload, timeout=5)
            print(f"Engineer {e['name']}: {res.status_code} {res.reason}")
        except Exception as e:
            print(f"❌ Failed to send engineer {e.get('name')}: {e}")

    print("--- DEBUG END ---")

if __name__ == "__main__":
    restore()