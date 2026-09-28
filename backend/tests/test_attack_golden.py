"""Full substitution-attack traces for the three sample texts.

Regenerate the fixture, from backend/, with:

    ../venv/bin/python tests/tools/record_golden.py
"""

import json
from pathlib import Path

import pytest

import cryptage.decrypt as decrypt
import cryptage.main as main
from tests.attack_cases import cases

FIXTURE = Path(__file__).parent / "fixtures" / "attack_golden.json"


def _accuracy(cipher, plaintext, key):
    decoded = decrypt.message_from_key(cipher, key)
    return sum(left == right for left, right in zip(decoded, plaintext)) / len(plaintext)


@pytest.mark.slow
@pytest.mark.parametrize(
    ("name", "plaintext", "cipher"),
    list(cases()),
    ids=[name for name, _, _ in cases()],
)
def test_attack_matches_recorded_steps(name, plaintext, cipher):
    recorded = {item["name"]: item for item in json.loads(FIXTURE.read_text(encoding="utf-8"))}
    expected = recorded[name]
    assert cipher == expected["cipher"]

    partial, sure, split, punctuation = main.etape1(cipher)
    key = main.etape2(cipher, partial, sure, split, punctuation)
    steps = json.loads(Path(main.json_file).read_text(encoding="utf-8"))

    assert steps == expected["steps"]
    assert key == expected["final_key"]
    assert _accuracy(cipher, plaintext, key) == pytest.approx(expected["accuracy"])
