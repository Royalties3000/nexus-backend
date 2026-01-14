import importlib.util
import pathlib


spec_path = pathlib.Path(__file__).resolve().parents[1] / "domain" / "risk.py"
spec = importlib.util.spec_from_file_location("risk", spec_path)
risk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(risk)


class DummyAsset:
    def __init__(self, health_score=None, risk_level=None):
        if health_score is not None:
            self.health_score = health_score
        if risk_level is not None:
            self.risk_level = risk_level


def test_score_asset_risk_basic():
    a = DummyAsset(health_score=0.8, risk_level=1.5)
    s = risk.score_asset_risk(a)
    assert isinstance(s, float)
    assert abs(s - ((1.0 - 0.8) * 1.5)) < 1e-9


def test_score_asset_risk_defaults():
    a = DummyAsset()
    s = risk.score_asset_risk(a)
    # default health == 1.0 and default severity == 1.0 -> score == 0.0
    assert s == 0.0
