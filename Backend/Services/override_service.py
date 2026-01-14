import uuid
from datetime import datetime
from Persistence.event_store import record_event


AUTHORIZED_ROLES = {
    "PLANT_MANAGER",
    "SAFETY_OFFICER",
    "OPERATIONS_DIRECTOR"
}


def approve_override(
    db,
    constraint,
    target_id,
    justification,
    approved_by,
    role,
    expires_at
):
    if role not in AUTHORIZED_ROLES:
        raise PermissionError("Unauthorized override attempt")

    if len(justification) < 20:
        raise ValueError("Justification too short")

    override_id = str(uuid.uuid4())

    record_event(
        db,
        event_type="OVERRIDE_APPROVED",
        payload={
            "override_id": override_id,
            "constraint": constraint,
            "target_id": target_id,
            "approved_by": approved_by,
            "expires_at": expires_at.isoformat()
        }
    )

    return override_id

