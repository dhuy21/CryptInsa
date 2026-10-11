"""Loaded before test modules. cryptage opens files relative to the process cwd."""

from tests.support.runtime import ensure_backend_cwd

ensure_backend_cwd()

pytest_plugins = [
    "tests.support.data_guard",
]
