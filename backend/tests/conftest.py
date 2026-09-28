"""Session setup for the current cryptage package.

Imports open files relative to the process working directory, so every test
run starts from backend/. Attack output is redirected to a temp file, and
tracked data files must be unchanged at the end of the session.
"""

import hashlib
import os
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
os.chdir(BACKEND_DIR)

DATA_FILES = (
    BACKEND_DIR / "donnees.json",
    BACKEND_DIR / "cryptage" / "donnees.json",
    BACKEND_DIR / "cryptage" / "dict.txt",
    BACKEND_DIR / "cryptage" / "dict_patterns.json",
    BACKEND_DIR / "cryptage" / "miserables.pdf",
)


def _fingerprint(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _snapshot() -> dict[str, str]:
    return {str(path.relative_to(BACKEND_DIR)): _fingerprint(path) for path in DATA_FILES}


@pytest.fixture(scope="session", autouse=True)
def data_files_unchanged():
    before = _snapshot()
    yield before
    after = _snapshot()
    changed = [name for name, digest in before.items() if after[name] != digest]
    assert changed == []


@pytest.fixture(autouse=True)
def isolate_attack_output(tmp_path, monkeypatch):
    import cryptage.main as main

    monkeypatch.setattr(main, "json_file", str(tmp_path / "donnees.json"))
