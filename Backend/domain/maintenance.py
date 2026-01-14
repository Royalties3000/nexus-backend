from dataclasses import dataclass
from typing import Set


@dataclass(frozen=True)
class MaintenanceOrder:
    order_id: str
    asset_id: str
    required_certifications: Set[str]
    task_type: str
    base_time_minutes: int
    task_difficulty: float

