from typing import List, Optional, Dict
import datetime
# We use the Model types for type hinting to ensure compatibility with DB objects
from Persistence.models import AssetModel, EngineerModel, MaintenanceModel

# Local helpers
from .alert_services import raise_critical_alert
from .audit_service import log_allocation

def calculate_priority(asset: Optional[AssetModel]) -> float:
    if not asset:
        return 0.0
    health = max(1, getattr(asset, "health_score", 100))
    risk = getattr(asset, "risk_level", 0)
    priority = float(risk) / (health / 100.0)
    return priority

def calculate_actual_duration(engineer: EngineerModel, task_type: str, base_time: int, difficulty: float) -> int:
    skills = getattr(engineer, "skill_matrix", {}) or {}
    skill_key = "repairSpeed" if task_type == "Repair" else "diagnostics"
    raw_skill = skills.get(skill_key, 5) 
    normalized_skill = max(0.1, float(raw_skill) / 10.0)
    base_calc = base_time * (difficulty / normalized_skill)
    return int(base_calc + 20) 

def run_orchestration(
    assets: List[AssetModel],
    orders: List[MaintenanceModel],
    engineers: List[EngineerModel],
) -> List[Dict]:
    print(f"\n{'='*60}")
    print(f"BRAIN: Starting Orchestration for {len(orders)} orders...")
    print(f"{'='*60}")

    asset_map = {a.asset_id: a for a in assets}
    allocations: List[Dict] = []

    # 1. Prioritize Orders
    orders_with_priority = []
    for order in orders:
        asset = asset_map.get(order.asset_id)
        priority = calculate_priority(asset)
        orders_with_priority.append((priority, order))

    prioritized = sorted(orders_with_priority, key=lambda x: x[0], reverse=True)

    for priority, order in prioritized:
        asset = asset_map.get(order.asset_id)
        print(f"\n[SYSTEM] Processing Order {order.order_id} (Asset: {order.asset_id})")
        print(f"  - Calculated Priority: {priority:.2f}")

        required_certs = getattr(asset, "required_certifications", []) or []
        if isinstance(required_certs, str):
            required_certs = [required_certs]
        
        print(f"  - Requirements: {required_certs if required_certs else 'None'}")

        # 2. Capability Matching
        eligible = []
        for e in engineers:
            certs = getattr(e, "certifications", []) or []
            has_capability = all(cert in certs for cert in required_certs) if required_certs else True
            
            # Fatigue Gate
            current_fatigue = getattr(e, "fatigue", 0)
            is_rested = current_fatigue < 100.0
            
            if has_capability and is_rested:
                eligible.append(e)

        # --- FALLBACK LOGIC ---
        if not eligible:
            print(f"  - [!] No exact matches found. Checking fallback pool...")
            fallback_pool = [e for e in engineers if getattr(e, "fatigue", 0) < 100.0]
            
            if fallback_pool:
                print(f"  - [✓] Fallback Triggered: Found {len(fallback_pool)} available personnel.")
                eligible = fallback_pool
            else:
                print(f"  - [X] FATAL: No personnel available (all fatigued or empty pool).")
                try: raise_critical_alert(order)
                except: pass
                continue

        # 3. Efficiency Selection
        best_eng = min(eligible, key=lambda e: getattr(e, "fatigue", 0))
        print(f"  - [✓] Assigned to: {best_eng.name} (ID: {best_eng.engineer_id})")
        print(f"  - [i] Engineer Current Fatigue: {getattr(best_eng, 'fatigue', 0):.2f}")

        # 4. Timeline
        start_time = datetime.datetime.utcnow() 
        duration = calculate_actual_duration(
            best_eng, 
            getattr(order, "task_type", "Repair"),
            120, 
            1.5 
        )
        end_time = start_time + datetime.timedelta(minutes=duration)

        # 5. State Update
        old_fatigue = getattr(best_eng, "fatigue", 0)
        best_eng.fatigue = old_fatigue + (duration / 60.0)
        print(f"  - [i] Task Duration: {duration} mins. New Fatigue: {best_eng.fatigue:.2f}")

        allocation = {
            "order_id": order.order_id,
            "engineer_id": best_eng.engineer_id,
            "engineer_name": best_eng.name,
            "asset_id": order.asset_id,
            "duration_minutes": duration,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        }
        allocations.append(allocation)
        
        try: log_allocation(order, best_eng)
        except: pass

    print(f"\n{'='*60}")
    print(f"BRAIN: Orchestration Finished. Successfully allocated {len(allocations)} tasks.")
    print(f"{'='*60}\n")
    return allocations