import importlib.util
import pathlib

base = pathlib.Path(__file__).resolve().parents[1]
spec_repo = base / "Persistence" / "repositories.py"
spec_orch = base / "Services" / "orchestrator.py"

spec = importlib.util.spec_from_file_location("repositories", spec_repo)
repo_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(repo_mod)

spec2 = importlib.util.spec_from_file_location("orchestrator", spec_orch)
orch_mod = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(orch_mod)

Repositories = repo_mod.Repositories
Orchestrator = orch_mod.Orchestrator


class DummyAsset:
    def __init__(self, asset_id, health_score=1.0, risk_level=1.0):
        self.asset_id = asset_id
        self.health_score = health_score
        self.risk_level = risk_level


class DummyEngineer:
    def __init__(self, engineer_id):
        self.engineer_id = engineer_id


def test_orchestrator_runs_and_persists():
    # Monkeypatch repositories to return simple data and capture saves
    repos = Repositories()

    def fetch_assets():
        return [DummyAsset("A1", health_score=0.2, risk_level=2.0)]

    def fetch_engineers():
        return [DummyEngineer("E1")]

    saved = {}

    def save_schedule(decisions):
        saved["decisions"] = decisions

    repos.fetch_assets = fetch_assets
    repos.fetch_engineers = fetch_engineers
    repos.save_schedule = save_schedule

    orch = Orchestrator()
    orch.repos = repos
    # run synchronous run() which is async — call via asyncio
    import asyncio

    asyncio.run(orch.run())
    assert "decisions" in saved
