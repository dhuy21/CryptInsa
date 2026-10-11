import pytest

from cryptage.cesar import cesar_cipher, cesar_decrypt, cesar_encrypt


def test_shift_zero_keeps_text():
    assert cesar_encrypt("hello world", 0) == "hello world"


def test_examples_shown_on_the_cesar_page():
    assert cesar_encrypt("cryptographie", 3) == "fu,swrjudsklh"
    assert cesar_encrypt("vive la france", 13) == "fvfrkynksbn pr"


def test_decrypt_reverses_encrypt():
    cipher = cesar_encrypt("pip is fun", 4)
    assert cipher == "tmtbmwbjyr"
    assert cesar_decrypt(cipher, 4) == "pip is fun"


def test_shift_wraps_around_the_29_character_alphabet():
    assert cesar_encrypt("a", 29) == "a"


def test_cesar_cipher_keeps_case_and_symbols_outside_a_z():
    assert cesar_cipher({"text": "Ab!", "shift": 1}) == {
        "encrypted": "Bc!",
        "steps": [
            {"original": "A", "code": "B"},
            {"original": "b", "code": "c"},
            {"original": "!", "code": "!"},
        ],
    }


def test_accented_letter_is_rejected():
    """Current behavior: é is not in the alphabet, so the call fails."""
    with pytest.raises(ValueError, match="substring not found"):
        cesar_encrypt("é", 1)
