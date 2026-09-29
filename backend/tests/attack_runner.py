"""Run etape1 and etape2, then score the key the same way the recorder does."""

import json
from pathlib import Path


def run_attack(cipher: str, json_file: Path) -> tuple[dict, list]:
    import cryptage.main as main

    previous = main.json_file
    main.json_file = str(json_file)
    try:
        partial, sure, split, punctuation = main.etape1(cipher)
        key = main.etape2(cipher, partial, sure, split, punctuation)
        steps = json.loads(Path(main.json_file).read_text(encoding="utf-8"))
        return key, steps
    finally:
        main.json_file = previous


def accuracy(cipher: str, plaintext: str, key: dict) -> float:
    import cryptage.decrypt as decrypt

    decoded = decrypt.message_from_key(cipher, key)
    return sum(left == right for left, right in zip(decoded, plaintext)) / len(plaintext)
