import requests

BASE_URL = "http://127.0.0.1:8000"

def clear_all():
    print("🧹 Cleaning Registry...")
    assets = requests.get(f"{BASE_URL}/assets").json()
    for a in assets:
        requests.delete(f"{BASE_URL}/assets/{a['asset_id']}")
    print("✨ Database Cleared.")

if __name__ == "__main__":
    clear_all()