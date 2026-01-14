import importlib.util
import pathlib
import sys
import traceback


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run_tests_for_file(path, mod_name):
    mod = load_module(path, mod_name)
    failures = 0
    for attr in dir(mod):
        if attr.startswith("test_"):
            fn = getattr(mod, attr)
            try:
                fn()
                print(f"PASS {mod_name}.{attr}")
            except Exception:
                print(f"FAIL {mod_name}.{attr}")
                traceback.print_exc()
                failures += 1
    return failures


def main():
    base = pathlib.Path(__file__).resolve().parent
    files = [
        (base / "test_risk.py", "test_risk"),
        (base / "test_event_store.py", "test_event_store"),
    ]
    total_failures = 0
    for path, name in files:
        if not path.exists():
            print(f"MISSING {path}")
            total_failures += 1
            continue
        total_failures += run_tests_for_file(path, name)

    if total_failures:
        print(f"{total_failures} test(s) failed")
        sys.exit(1)
    print("All tests passed")


if __name__ == "__main__":
    main()
