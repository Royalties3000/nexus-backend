import requests
import random

BASE_URL = "http://127.0.0.1:8000"

def seed_realistic_data():
    print("🏗️  Infecting Realistic Siemens Nexus Data...")

    # These MUST match the strings used in your 'analysis/readiness' logic
    valid_certs = ["High Voltage L3", "Robotics Specialist", "Cyber-Physical Security", "Hydraulic Systems"]
    valid_teams = ["Power Systems", "Automation Unit", "Nexus Safety", "Field Operations"]

    for i in range(10):
        # We alternate health: 5 critical (needs repair), 5 healthy
        health = random.uniform(10, 35) if i < 5 else random.uniform(70, 95)
        asset_id = f"SIEMENS-UX-{100 + i}"
        
        asset_data = {
            "asset_id": asset_id,
            "asset_type": random.choice(["Gas Turbine", "Cobot Arm", "Logic Controller"]),
            "model_class": "Nexus-Prime",
            "serial_key": f"SN-9900-{i}",
            "health_score": round(health, 1),
            "risk_level": random.randint(3, 5) if health < 40 else 1,
            "responsible_teams": [random.choice(valid_teams)],
            "required_certifications": [random.choice(valid_certs)]
        }

        try:
            res = requests.post(f"{BASE_URL}/assets/add", json=asset_data)
            if res.status_code == 200:
                print(f"✅ Added {asset_id} | Health: {health}% | Cert: {asset_data['required_certifications'][0]}")
        except Exception as e:
            print(f"🔌 Connection Error: {e}")

    # Add 5 Engineers with matching certifications
    for i in range(5):
        eng_id = f"ENG-SYS-{i}"
        eng_data = {
            "engineer_id": eng_id,
            "name": f"Specialist {chr(65+i)}",
            "team": random.choice(valid_teams),
            "certifications": [random.choice(valid_certs)], # Guaranteed matches for assets
            "availability": "Day",
            "fatigue": random.uniform(0, 0.4) # Low fatigue so they get assigned
        }
        requests.post(f"{BASE_URL}/engineers", json=eng_data)
    
    print("\n✨ Database Seeded with Realistic Parameters.")

if __name__ == "__main__":
    seed_realistic_data()