from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Override:
    override_id: str
    constraint: str
    target_id: str
    justification: str
    approved_by: str
    expires_at: datetime

    def is_active(self, now: datetime) -> bool:
        return now < self.expires_at
