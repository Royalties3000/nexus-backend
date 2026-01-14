import requests
import json

BASE_URL = "http://127.0.0.1:8000"
FILE_NAME = 'maintenance_backup.json'

def parse_list(data):
    if not data: return []
    if isinstance(data, list): return data
    try:
        return json.loads(data)
    except:
        return []

def restore():
    with open(FILE_NAME, 'r') as f:
        data = json.load(f)

    print(f"Checking {len(data['assets'])} assets...")

    for a in data['assets']:
        # We match your JSON keys exactly to your Backend Pydantic Schema
        payload = {
            "asset_id": a.get("asset_id"),
            "asset_type": a.get("asset_type"),
            "model_class": a.get("model_class"),
            "serial_key": a.get("serial_key"),
            "health_score": a.get("health_score", 100.0),
            "risk_level": a.get("risk_level", 5),
            "responsible_teams": parse_list(a.get("responsible_teams")),
            "required_certifications": parse_list(a.get("required_certifications"))
        }

        response = requests.post(f"{BASE_URL}/assets/add", json=payload)
        
        if response.status_code == 200:
            print(f"✅ {payload['asset_id']} - Restored")
        else:
            print(f"❌ {payload['asset_id']} - Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    restore()