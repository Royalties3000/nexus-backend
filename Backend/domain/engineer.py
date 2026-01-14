from dataclasses import dataclass
from typing import Set, Dict


@dataclass(frozen=True)
class ServiceEngineer:
    engineer_id: str
    certifications: Set[str]
    skill_matrix: Dict[str, float]
    hours_worked_today: float
    available_from: int          # minutes since shift start
    shift_start: int             # minutes since midnight
    shift_end: int               # minutes since midnight
    last_shift_end: int | None   # minutes since midnight (previous day)
