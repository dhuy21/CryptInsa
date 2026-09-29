"""Record the current substitution-attack steps.

From backend/:

    ../venv/bin/python tests/tools/record_golden.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tests.attack_cases import cases
from tests.attack_runner import accuracy, run_attack
from tests.support.runtime import BACKEND_DIR, ensure_backend_cwd

OUTPUT = BACKEND_DIR / "tests" / "fixtures" / "attack_golden.json"


def record():
    ensure_backend_cwd()
    recorded = []
    for name, plaintext, cipher in cases():
        key, steps = run_attack(cipher)
        recorded.append(
            {
                "name": name,
                "cipher": cipher,
                "accuracy": accuracy(cipher, plaintext, key),
                "final_key": key,
                "steps": steps,
            }
        )
    OUTPUT.write_text(
        json.dumps(recorded, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    for item in recorded:
        print(f"{item['name']}: {len(item['steps'])} steps, accuracy {item['accuracy']:.3f}")


if __name__ == "__main__":
    record()
