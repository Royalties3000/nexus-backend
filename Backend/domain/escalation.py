from datetime import timedelta
from domain.alert import AlertSeverity


ESCALATION_RULES = {
    AlertSeverity.CRITICAL: timedelta(minutes=15),
    AlertSeverity.HIGH: timedelta(minutes=30),
}


def requires_escalation(severity, elapsed_time):
    if severity not in ESCALATION_RULES:
        return False
    return elapsed_time >= ESCALATION_RULES[severity]
