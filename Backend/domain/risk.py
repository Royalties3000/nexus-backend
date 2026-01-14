from .asset import RiskLevel


RISK_WEIGHTS = {
    RiskLevel.CRITICAL: 100,
    RiskLevel.HIGH: 50,
    RiskLevel.MEDIUM: 20,
    RiskLevel.LOW: 5,
}


def risk_score(asset_risk: RiskLevel, health_score: float) -> float:
    """
    Higher score = higher priority
    """
    base = RISK_WEIGHTS[asset_risk]
    degradation = (1.0 - health_score) * 100
    return base + degradation

