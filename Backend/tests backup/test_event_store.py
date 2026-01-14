import importlib.util
import pathlib
from pathlib import Path


spec_path = pathlib.Path(__file__).resolve().parents[1] / "Persistence" / "event_store.py"
spec = importlib.util.spec_from_file_location("event_store", spec_path)
esmod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(esmod)
EventStore = esmod.EventStore


def test_event_store_append_and_read():
    # Use a file name that will be created under the real Persistence folder
    filename = "test_event_store.log"
    store = EventStore(path_override=filename)
    # append a simple event
    ev = {"type": "TEST_EVENT", "value": 123}
    store.append(ev)
    items = store.read_all()
    assert any(x.get("type") == "TEST_EVENT" and x.get("value") == 123 for x in items)

    # cleanup file created under Persistence
    persistence_dir = pathlib.Path(spec_path).parent
    created = persistence_dir / filename
    if created.exists():
        try:
            created.unlink()
        except Exception:
            pass
