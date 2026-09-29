"""Fail the session if a test rewrites tracked data files, then put the bytes back."""

from pathlib import Path

import pytest

from tests.support.runtime import BACKEND_DIR

DATA_FILES = (
    BACKEND_DIR / "donnees.json",
    BACKEND_DIR / "cryptage" / "donnees.json",
    BACKEND_DIR / "cryptage" / "dict.txt",
    BACKEND_DIR / "cryptage" / "dict_patterns.json",
    BACKEND_DIR / "cryptage" / "miserables.pdf",
)


def _read(path: Path):
    try:
        return path.read_bytes()
    except FileNotFoundError:
        return None


@pytest.fixture(scope="session", autouse=True)
def data_files_unchanged():
    before = {path: path.read_bytes() for path in DATA_FILES}
    yield
    changed = []
    for path, blob in before.items():
        if _read(path) == blob:
            continue
        changed.append(str(path.relative_to(BACKEND_DIR)))
        path.write_bytes(blob)
    assert changed == []
