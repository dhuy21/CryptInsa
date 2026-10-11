"""Working directory required by cryptage's relative file paths."""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]


def ensure_backend_cwd() -> Path:
    os.chdir(BACKEND_DIR)
    return BACKEND_DIR
