from enum import Enum
from dataclasses import dataclass


class AlertSeverity(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


@dataclass(frozen=True)
class Alert:
    alert_id: str
    severity: AlertSeverity
    message: str
