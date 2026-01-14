"""SQLAlchemy models for persistence.

These models use the application's `Base` declared in `database.py`.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    Text,
    ForeignKey,
    Boolean,
    func,
)
from sqlalchemy import JSON
from sqlalchemy.types import TypeDecorator
from .database import Base

class AssetModel(Base):
    __tablename__ = "assets"
    asset_id = Column(String, primary_key=True, index=True)
    asset_type = Column(String, nullable=False)
    model_class = Column(String, nullable=True)
    serial_key = Column(String, nullable=True)
    required_certifications = Column(JSON, nullable=True, default=None)
    health_score = Column(Float, nullable=False, default=100.0)
    risk_level = Column(Float, nullable=False, default=1.0)
    last_inspection = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    responsible_teams = Column(JSON, default=[])
class EngineerModel(Base):
    __tablename__ = "engineers"
    
    engineer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    team = Column(String, nullable=True)
    certifications = Column(JSON, nullable=True, default=None)
    skill_matrix = Column(JSON, nullable=True, default=None)
    availability = Column(String, nullable=True, default="Day")
    created_at = Column(DateTime, server_default=func.now())
    
    # --- NEW INTELLIGENT TRACKING COLUMNS ---
    # Stores the exact moment the engineer started their current shift
    last_shift_start = Column(DateTime, nullable=True, server_default=func.now())
    
    # Stores the end of the previous shift to calculate "Days Off"
    last_shift_end = Column(DateTime, nullable=True, server_default=func.now())
    
    # Total hours worked in the previous 24h cycle
    hours_worked_yesterday = Column(Float, default=0.0)
    
    # We keep the column for DB compatibility, but we will overwrite it with logic
    fatigue = Column(Float, nullable=False, default=0.0)

class EventLogModel(Base):
    __tablename__ = "event_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False) # e.g., "CRITICAL_GAP" or "SCHEDULE_RUN"
    payload = Column(JSON, nullable=False)     # Store complex decision data
    created_at = Column(DateTime, server_default=func.now())

class MaintenanceModel(Base):
    __tablename__ = "maintenance_orders"
    order_id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.asset_id"))
    assigned_engineer_id = Column(String, ForeignKey("engineers.engineer_id"), nullable=True)
    status = Column(String, default="PENDING") # PENDING, ASSIGNED, COMPLETED
    priority = Column(Integer, default=1)
    scheduled_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    end_time = Column(DateTime, nullable=True)