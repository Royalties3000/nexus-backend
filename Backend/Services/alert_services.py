def raise_critical_alert(order):
    print(f"[CRITICAL ALERT] No certified engineer for {order.order_id}")

import uuid
from datetime import datetime
from domain.alert import Alert, AlertSeverity
from domain.escalation import requires_escalation
from Persistence.event_store import record_event


def create_alert(db, severity, message):
    alert_id = str(uuid.uuid4())

    alert = Alert(
        alert_id=alert_id,
        severity=severity,
        message=message
    )

    record_event(
        db,
        event_type="ALERT_CREATED",
        payload={
            "alert_id": alert_id,
            "severity": severity.value,
            "message": message
        }
    )

    return alert


def escalate_alert(db, alert, created_at):
    elapsed = datetime.utcnow() - created_at

    if requires_escalation(alert.severity, elapsed):
        record_event(
            db,
            event_type="ALERT_ESCALATED",
            payload={
                "alert_id": alert.alert_id,
                "severity": alert.severity.value
            }
        )
