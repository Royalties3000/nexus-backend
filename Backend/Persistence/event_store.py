import json
import datetime
from sqlalchemy.orm import Session # This removes the underline
from sqlalchemy import Column, String, Integer, Float, DateTime
from .database import Base 
from .models import EventLogModel

def record_event(
    db: Session,
    event_type: str,
    payload: dict
):
    event = EventLogModel(
        event_type=event_type,
        payload=json.dumps(payload)
    )
    db.add(event)
    db.commit()
    db.refresh(event) # Optional: updates 'event' with the generated ID from DB
    return event