from dataclasses import dataclass
from enum import Enum
from typing import Optional

class RiskLevel(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4

@dataclass
class Asset:
    asset_id: str
    asset_type: str 
    health_score: float
    risk_level: float
    is_operational: bool
    # Added to match the Orchestrator logic and Frontend requirements
    required_certification: Optional[str] = None