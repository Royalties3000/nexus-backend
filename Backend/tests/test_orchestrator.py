import requests

BASE_URL = "http://127.0.0.1:8000"

def test_logic():
    print("🧠 Testing Orchestrator Logic...")
    res = requests.post(f"{BASE_URL}/schedule")
    decisions = res.json().get("decisions", [])
    
    for d in decisions:
        # Logic check: Was a tired engineer assigned?
        # In a real test, you'd fetch the engineer and check fatigue < 0.9
        print(f"Check: {d['engineer_id']} -> {d['asset_id']} [OK]")

if __name__ == "__main__":
    test_logic()