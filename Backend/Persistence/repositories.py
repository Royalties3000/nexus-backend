from sqlalchemy.orm import Session
from domain.asset import Asset, RiskLevel
from .models import AssetModel

def load_assets(db: Session):
    records = db.query(AssetModel).all()
    return [
        Asset(
            asset_id=r.asset_id,
            asset_type=r.asset_type,
            health_score=r.health_score,
            risk_level=RiskLevel(int(r.risk_level)),
            is_operational=r.health_score > 20,
            # MAP THE PERSISTENCE PLURAL TO THE DOMAIN SINGULAR
            required_certification=r.required_certifications[0] if (r.required_certifications and len(r.required_certifications) > 0) else None
        )
        for r in records
    ]