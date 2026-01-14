from Persistence.database import SessionLocal, engine, Base
from Persistence import models
import datetime
import requests

# Create DB session
db = SessionLocal()

# Insert a critical asset
asset = models.AssetModel(
    asset_id="TEST-A1",
    asset_type="Pump",
    required_certifications=["ELECT"],
    health_score=20.0,
    risk_level=5.0,
)
# Remove existing test asset if present
existing = db.query(models.AssetModel).filter(models.AssetModel.asset_id==asset.asset_id).first()
if existing:
    db.delete(existing)
    db.commit()

# Insert
db.add(asset)

# Insert two engineers, one with cert and one without
eng1 = models.EngineerModel(
    engineer_id="ENG-1",
    name="Alice",
    certifications=["ELECT"],
    fatigue=0.1
)
eng2 = models.EngineerModel(
    engineer_id="ENG-2",
    name="Bob",
    certifications=[],
    fatigue=0.2
)
# Clean up old test engineers
for eid in [eng1.engineer_id, eng2.engineer_id]:
    old = db.query(models.EngineerModel).filter(models.EngineerModel.engineer_id==eid).first()
    if old:
        db.delete(old)
        db.commit()

# Add engineers
db.add(eng1)
db.add(eng2)

# Commit
db.commit()

# Call schedule endpoint
print('Calling backend /schedule...')
resp = requests.post('http://127.0.0.1:8000/schedule')
print('Status:', resp.status_code)
print('Body:', resp.json())

# Query maintenance orders
orders = db.query(models.MaintenanceModel).filter(models.MaintenanceModel.asset_id==asset.asset_id).all()
print('DB Orders:', [(o.order_id, o.assigned_engineer_id, o.status) for o in orders])

# Close session
db.close()
