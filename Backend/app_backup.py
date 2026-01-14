from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
import json
import random

# Internal Imports
from domain.asset import Asset
from domain.maintenance import MaintenanceOrder
from domain.engineer import ServiceEngineer
from Services.orchestrator import run_orchestration
from Persistence.database import SessionLocal, engine, Base
from Persistence.event_store import record_event
from Persistence import models

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Siemens Nexus Orchestrator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ASSET ROUTES ---

@app.get("/assets")
async def get_assets(db: Session = Depends(get_db)):
    return db.query(models.AssetModel).all()

@app.post("/assets/add")
async def create_asset(data: dict, db: Session = Depends(get_db)):
    try:
        new_asset = models.AssetModel(
            asset_id=data.get("asset_id"),
            asset_type=data.get("asset_type"),
            model_class=data.get("model_class", "Standard"),
            serial_key=data.get("serial_key", "N/A"),
            health_score=float(data.get("health_score", 100)),
            risk_level=int(data.get("risk_level", 3)),
            responsible_teams=data.get("responsible_teams", []),
            required_certifications=data.get("required_certifications", [])
        )
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        return {"message": "Asset Deployment Successful", "asset_id": new_asset.asset_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Asset Deployment Failed: {str(e)}")

@app.post("/assets/chaos")
async def trigger_chaos(db: Session = Depends(get_db)):
    """SIMULATION: Decay health of 40% of assets to trigger the scheduler."""
    assets = db.query(models.AssetModel).all()
    affected = 0
    for asset in assets:
        if random.random() < 0.4:
            asset.health_score = round(random.uniform(10, 48), 1)
            asset.risk_level = random.randint(3, 5)
            affected += 1
    db.commit()
    return {"status": "Chaos Protocol Active", "affected_units": affected}

@app.post("/assets/reset-health")
async def reset_health(db: Session = Depends(get_db)):
    """Restore all assets to optimal status."""
    db.query(models.AssetModel).update({models.AssetModel.health_score: 100.0, models.AssetModel.risk_level: 1})
    db.commit()
    return {"message": "All systems restored to 100% health"}

@app.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    try:
        clean_id = asset_id.strip()
        asset = db.query(models.AssetModel).filter(models.AssetModel.asset_id == clean_id).first()
        if not asset:
            asset = db.query(models.AssetModel).filter(models.AssetModel.asset_id.like(f"%{clean_id}%")).first()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        db.delete(asset)
        db.commit()
        return {"status": "success", "message": f"Unit {clean_id} decommissioned"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Deletion blocked: {str(e)}")

# --- ENGINEER ROUTES ---
def calculate_nexus_fatigue(engineer):
    # Use datetime.datetime.now() to match your import style
    now = datetime.datetime.now()
    
    # 1. RECOVERY LOGIC
    if hasattr(engineer, 'last_shift_end') and engineer.last_shift_end:
        hours_off = (now - engineer.last_shift_end).total_seconds() / 3600
        if hours_off > 48:
            return 0.0
    else:
        hours_off = 0

    # 2. CARRYOVER (Using the columns we added to the model)
    # Default to 0 if the attribute is missing/None
    work_yesterday = getattr(engineer, 'hours_worked_yesterday', 0) or 0
    carryover = min(work_yesterday * 2.5, 25.0)

    # 3. SHIFT STRAIN
    strain = 0.0
    if hasattr(engineer, 'last_shift_start') and engineer.last_shift_start:
        hours_active = (now - engineer.last_shift_start).total_seconds() / 3600
        if hours_active > 0:
            strain = pow(hours_active, 1.35)

    recovery_multiplier = 0.4 if hours_off > 18 else 1.0
    total_fatigue = (carryover * recovery_multiplier) + strain
    
    return min(max(round(total_fatigue, 1), 0.0), 100.0)


# --- ENGINEER ROUTES ---

@app.get("/engineers")
def get_engineers(db: Session = Depends(get_db)):
    # FIX: Use models.EngineerModel to match your import style
    engineers = db.query(models.EngineerModel).all()
    
    for eng in engineers:
        # Calculate on the fly
        eng.fatigue = calculate_nexus_fatigue(eng)
        
    return engineers

@app.post("/engineers")
async def add_engineer(data: dict, db: Session = Depends(get_db)):
    try:
        new_eng = models.EngineerModel(
            engineer_id=data.get("engineer_id"),
            name=data.get("name"),
            team=data.get("team"),
            certifications=data.get("certifications", []),
            skill_matrix=data.get("skill_matrix", {}), 
            availability=data.get("availability", "Day"),
            # We initialize these so the fatigue logic has a starting point
            last_shift_start=datetime.datetime.now(),
            last_shift_end=datetime.datetime.now() - datetime.timedelta(days=2),
            hours_worked_yesterday=0.0,
            fatigue=0.0
        )
        db.add(new_eng)
        db.commit()
        return {"message": "Personnel Authorized"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/engineers/{engineer_id}")
async def delete_engineer(engineer_id: str, db: Session = Depends(get_db)):
    """
    Removes personnel from the authorization matrix.
    Prevents deletion if the engineer is currently assigned to active maintenance.
    """
    try:
        clean_id = engineer_id.strip()
        engineer = db.query(models.EngineerModel).filter(models.EngineerModel.engineer_id == clean_id).first()
        
        if not engineer:
            raise HTTPException(status_code=404, detail="Personnel record not found")

        # SAFETY CHECK: Check for active maintenance tasks
        active_task = db.query(models.MaintenanceModel).filter(
            models.MaintenanceModel.assigned_engineer_id == clean_id,
            models.MaintenanceModel.status != "COMPLETED"
        ).first()

        if active_task:
            raise HTTPException(
                status_code=400, 
                detail=f"Personnel cannot be removed: Active assignment found on Order {active_task.order_id}"
            )

        db.delete(engineer)
        db.commit()
        
        # Log the decommissioning
        record_event(db, "PERSONNEL_DEPARTURE", {
            "engineer_id": clean_id,
            "severity": "WARNING",
            "message": f"Personnel {engineer.name} ({clean_id}) has been removed from the system."
        })
        db.commit() # Commit the event log

        return {"status": "success", "message": f"Personnel {clean_id} unauthorized and removed."}

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"System error during deletion: {str(e)}")
    

# --- ORCHESTRATION & ANALYSIS ---
@app.post("/schedule")
async def trigger_schedule(db: Session = Depends(get_db)):
    # 1. Fetch current state
    db_assets = db.query(models.AssetModel).all()
    db_engineers = db.query(models.EngineerModel).all()
    
    active_orders = []
    print(f"\n--- SCHEDULER SCAN START ---")
    
    for asset in db_assets:
        current_health = float(asset.health_score)
        if current_health < 50.0:
            # We check for IN_PROGRESS to allow re-scheduling of stalled assignments
            existing_work = db.query(models.MaintenanceModel).filter(
                models.MaintenanceModel.asset_id == asset.asset_id,
                models.MaintenanceModel.status == "IN_PROGRESS"
            ).first()
            
            if not existing_work:
                req_certs = set(asset.required_certifications) if asset.required_certifications else set()
                active_orders.append(
                    MaintenanceOrder(
                        order_id=f"ORD-{asset.asset_id[:5]}-{random.randint(100,999)}",
                        asset_id=asset.asset_id,
                        required_certifications=req_certs,
                        task_type="Emergency Repair",
                        base_time_minutes=120,
                        task_difficulty=1.5
                    )
                )

    if not active_orders:
        return {"status": "idle", "message": "No new critical needs found."}

    # 2. Run the Brain
    allocations = run_orchestration(db_assets, active_orders, db_engineers)

    # 3. Persistence with Error Handling
    try:
        for alloc in allocations:
            new_task = models.MaintenanceModel(
                order_id=alloc['order_id'],
                asset_id=alloc['asset_id'],
                assigned_engineer_id=alloc['engineer_id'],
                status="ASSIGNED",
                priority=3,
                scheduled_date=datetime.datetime.fromisoformat(alloc['start_time'])
            )
            db.add(new_task)
            
            record_event(db, "ASSIGNMENT", {
        "engineer_id": alloc['engineer_id'],
        "asset_id": alloc['asset_id'],
        "severity": "CRITICAL",
        "message": f"EMERGENCY: Engineer {alloc['engineer_name']} assigned to repair {alloc['asset_id']}."
            })

        db.commit()
        return {"status": "success", "decisions": allocations}
        
    except Exception as e:
        db.rollback()
        print(f"CRITICAL DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Database persistence failed.")

@app.get("/maintenance/orders")
async def get_maintenance_orders(db: Session = Depends(get_db)):
    orders = db.query(models.MaintenanceModel).all()
    # We return the raw objects; FastAPI converts them to JSON
    return orders

@app.get("/alerts")
async def get_alerts(db: Session = Depends(get_db)):
    events = db.query(models.EventLogModel).filter(models.EventLogModel.event_type == "CRITICAL_GAP").order_by(models.EventLogModel.created_at.desc()).limit(10).all()
    alerts = []
    for e in events:
        payload = e.payload if isinstance(e.payload, dict) else json.loads(e.payload)
        alerts.append({
            "id": e.id,
            "message": f"CRITICAL: {payload.get('reason')} (Asset: {payload.get('asset_id')})",
            "timestamp": e.created_at
        })
    return alerts

@app.get("/analysis/readiness")
def get_readiness_metrics(db: Session = Depends(get_db)):
    engineers = db.query(models.EngineerModel).all()
    assets = db.query(models.AssetModel).all()
    needs = {}
    for a in assets:
        for cert in (a.required_certifications or []):
            cert_clean = cert.strip()
            needs[cert_clean] = needs.get(cert_clean, 0) + 1

    capabilities = {}
    for e in engineers:
        for cert in (e.certifications or []):
            norm_cert = cert.strip().lower()
            capabilities[norm_cert] = capabilities.get(norm_cert, 0) + 1

    readiness_data = []
    for cert, count_needed in needs.items():
        count_available = capabilities.get(cert.lower(), 0)
        score = min(100, (count_available / count_needed) * 100) if count_needed > 0 else 100
        readiness_data.append({
            "skill": cert,
            "needed": count_needed,
            "available": count_available,
            "readiness": round(score, 1)
        })
    return readiness_data

# --- FINAL UI ADAPTERS ---
@app.get("/assignments")
async def get_assignments_for_ui(db: Session = Depends(get_db)):
    """
    Standardizes maintenance data for the React ScheduleView.
    Now filters out 'COMPLETED' tasks to ensure the UI stays clean.
    """
    # FIX: Only fetch tasks that are NOT completed
    orders = db.query(models.MaintenanceModel).filter(
        models.MaintenanceModel.status != "COMPLETED"
    ).all()
    
    ui_formatted_data = []
    for o in orders:
        # Fetch names for the UI strings
        eng = db.query(models.EngineerModel).filter(models.EngineerModel.engineer_id == o.assigned_engineer_id).first()
        eng_name = eng.name if eng else "Unknown Engineer"
        
        # Format dates as strings for the 'new Date()' constructor in JS
        # Added a check: if o.scheduled_date is already a string (common in some SQLite setups), 
        # we don't call isoformat()
        if o.scheduled_date and hasattr(o.scheduled_date, 'isoformat'):
            start_iso = o.scheduled_date.isoformat()
        else:
            start_iso = str(o.scheduled_date) if o.scheduled_date else datetime.datetime.now().isoformat()

        ui_formatted_data.append({
            "id": o.order_id,
            "asset_name": o.asset_id,
            "engineer_name": eng_name,
            "start_date": start_iso,
            "duration_days": 1,
            "type": "CRITICAL" if o.priority >= 4 else "DECAY_REPAIR"
        })
    
    return ui_formatted_data

@app.put("/assignments/{order_id}/complete")
async def complete_task(order_id: str, db: Session = Depends(get_db)):
    # 1. Find the maintenance task
    task = db.query(models.MaintenanceModel).filter(
        models.MaintenanceModel.order_id == order_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    # 2. Find the associated asset
    asset = db.query(models.AssetModel).filter(
        models.AssetModel.asset_id == task.asset_id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Associated asset not found")

    try:
        # Save the engineer ID before updating, just in case
        executing_engineer = task.assigned_engineer_id
        
        # 3. Update task status
        task.status = "COMPLETED"
        
        # 4. RESTORE ASSET HEALTH TO 100%
        asset.health_score = 100.0
        
        # 5. ENHANCED LOGGING: Pass specific IDs for the Audit Log columns
        record_event(db, "REPAIR_COMPLETE", {
            "order_id": order_id,
            "asset_id": asset.asset_id,        # Fills 'Asset' column
            "engineer_id": executing_engineer, # Fills 'Engineer' column
            "severity": "SUCCESS",              # Color-codes the row
            "message": f"FIXED: Asset {asset.asset_id} restored to 100% by {executing_engineer}."
        })
        
        db.commit()
        return {
            "status": "success", 
            "message": f"Asset {asset.asset_id} fully restored and task cleared."
        }
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Completion protocol failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to persist recovery state.")

@app.get("/audit")
async def get_audit_log(db: Session = Depends(get_db)):
    """Returns formatted logs for the Incident/Audit Log panel with full traceability."""
    logs = db.query(models.EventLogModel).order_by(models.EventLogModel.created_at.desc()).all()
    
    formatted_logs = []
    for log in logs:
        # 1. Safely handle the payload (JSON or Dict)
        try:
            payload = log.payload if isinstance(log.payload, dict) else json.loads(log.payload or "{}")
        except:
            payload = {"message": str(log.payload)}

        # 2. Map payload keys to match your frontend table columns
        formatted_logs.append({
            "id": log.id,
            "timestamp": log.created_at.strftime("%m/%d/%Y, %I:%M:%S %p") if log.created_at else "---",
            "event_type": log.event_type,
            # 'engineer' and 'asset' here must match the data you passed in record_event
            "engineer": payload.get("engineer_id", payload.get("engineer", "SYSTEM")),
            "asset": payload.get("asset_id", "---"),
            "severity": payload.get("severity", "INFO"),
            "description": payload.get("message", f"Event logged: {log.event_type}")
        })
        
    return formatted_logs


def record_event(db, event_type, details):
    """
    Standardizes log entries for the Audit Log UI.
    Captures equipment code, engineer ID, and event description.
    """
    new_event = models.EventLogModel(
        created_at=datetime.datetime.now(),
        event_type=event_type,
        payload=json.dumps({
            "engineer_id": details.get("engineer_id", "-"),
            "asset_id": details.get("asset_id", "-"),
            "severity": details.get("severity", "INFO"),
            "message": details.get("message", "System automated event")
        })
    )
    db.add(new_event)
    # Note: db.commit() is usually handled by the calling route