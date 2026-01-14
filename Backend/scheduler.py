from datetime import datetime, timedelta
from Services.orchestrator import run_orchestration
from Persistence.repositories import (
    load_assets,
    load_engineers,
    load_orders
)

def run():
    # 1. Load current state from your restored database
    assets = load_assets()
    engineers = load_engineers()
    orders = load_orders()

    # 2. Run the logic to see who should fix what
    orchestration_results = run_orchestration(assets, orders, engineers)

    # 3. Transform results into the "Assignment" format the React UI expects
    # This prevents the "Blank Screen" by ensuring the keys match the Frontend
    formatted_assignments = []
    
    # Assuming run_orchestration returns a list of assignment objects/dicts
    for idx, task in enumerate(orchestration_results):
        # Determine if this is a decay-based urgent repair
        is_urgent = task.get("priority", 0) > 7 or task.get("health_impact", 0) > 50
        
        assignment = {
            "id": f"task-{idx}",
            "asset_name": task.get("asset_id", "Unknown Asset"),
            "engineer_name": task.get("engineer_name", "Unassigned"),
            "start_date": datetime.now().isoformat(), # Or task.get("scheduled_date")
            "duration_days": 1 if is_urgent else 2,
            "type": "CRITICAL" if is_urgent else "ROUTINE"
        }
        formatted_assignments.append(assignment)

    return formatted_assignments

def trigger_emergency_repair(asset_id):
    """
    Call this specifically when 'System Decay' hits a critical level.
    It forces an immediate assignment.
    """
    assets = load_assets()
    engineers = load_engineers()
    
    # Filter for the specific decayed asset
    target_asset = next((a for a in assets if a.asset_id == asset_id), None)
    
    if target_asset:
        # Fast-track orchestration logic for this one asset
        return run_orchestration([target_asset], [], engineers)
    return []