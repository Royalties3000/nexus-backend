import importlib.util
import pathlib

spec_alert = pathlib.Path(__file__).resolve().parents[1] / "Services" / "alert_services.py"
spec_audit = pathlib.Path(__file__).resolve().parents[1] / "Services" / "audit_service.py"

spec = importlib.util.spec_from_file_location("alert_services", spec_alert)
alert_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alert_mod)

spec2 = importlib.util.spec_from_file_location("audit_service", spec_audit)
audit_mod = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(audit_mod)

AlertService = alert_mod.AlertService
AuditService = audit_mod.AuditService


def test_alert_and_audit_recording():
    a = AlertService()
    a.trigger_critical("unit-test-alert", {"k": "v"})

    au = AuditService()
    decision = {"asset_id": "A1", "engineer_id": "E1"}
    au.record_decision(decision)

    # basic smoke: read from event store via audit.replay()
    events = au.replay()
    assert any(e.get("type") == "DECISION" and e.get("decision") == decision for e in events)
