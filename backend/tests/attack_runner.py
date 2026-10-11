"""Run etape1 and etape2, then score the key the same way the recorder does."""


def run_attack(cipher: str) -> tuple[dict, list]:
    import cryptage.main as main

    steps = []
    partial, sure, split, punctuation = main.etape1(cipher, steps)
    key = main.etape2(cipher, partial, sure, split, punctuation, steps)
    return key, steps


def accuracy(cipher: str, plaintext: str, key: dict) -> float:
    import cryptage.decrypt as decrypt

    decoded = decrypt.message_from_key(cipher, key)
    return sum(left == right for left, right in zip(decoded, plaintext)) / len(plaintext)
