"""Record the current substitution-attack steps. Run from backend/:

    ../venv/bin/python tests/tools/record_golden.py
"""

import json
import sys
import tempfile
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

import cryptage.decrypt as decrypt
import cryptage.main as main
from tests.attack_cases import cases

OUTPUT = BACKEND_DIR / "tests" / "fixtures" / "attack_golden.json"


def accuracy(cipher, plaintext, key):
    decoded = decrypt.message_from_key(cipher, key)
    return sum(left == right for left, right in zip(decoded, plaintext)) / len(plaintext)


def record():
    recorded = []
    for name, plaintext, cipher in cases():
        with tempfile.TemporaryDirectory() as directory:
            main.json_file = str(Path(directory) / "donnees.json")
            partial, sure, split, punctuation = main.etape1(cipher)
            key = main.etape2(cipher, partial, sure, split, punctuation)
            steps = json.loads(Path(main.json_file).read_text(encoding="utf-8"))
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
