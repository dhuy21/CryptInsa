"""Pytest settings. The dev secret exists only here, not in the running app."""

import os

os.environ.setdefault("DJANGO_SECRET_KEY", "cryptinsa-dev-only")

from config.settings import *  # noqa: F403
