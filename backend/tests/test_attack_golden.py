"""Full substitution-attack traces for the three sample texts.

Regenerate the fixture from backend/:

    ../venv/bin/python tests/tools/record_golden.py
"""

import json
from pathlib import Path

import pytest

from tests.attack_cases import cases
from tests.attack_runner import accuracy, run_attack

FIXTURE = Path(__file__).parent / "fixtures" / "attack_golden.json"
CASES = list(cases())


@pytest.fixture(scope="module")
def recorded_attacks():
    payload = json.loads(FIXTURE.read_text(encoding="utf-8"))
    names = [item["name"] for item in payload]
    assert names == [name for name, _, _ in CASES]
    return {item["name"]: item for item in payload}


@pytest.mark.slow
@pytest.mark.parametrize(
    ("name", "plaintext", "cipher"),
    CASES,
    ids=[name for name, _, _ in CASES],
)
def test_attack_matches_recorded_steps(name, plaintext, cipher, recorded_attacks, tmp_path):
    expected = recorded_attacks[name]
    assert len(cipher) == len(plaintext)
    assert cipher == expected["cipher"]

    key, steps = run_attack(cipher, tmp_path / "donnees.json")

    assert steps == expected["steps"]
    assert key == expected["final_key"]
    assert accuracy(cipher, plaintext, key) == pytest.approx(expected["accuracy"])
