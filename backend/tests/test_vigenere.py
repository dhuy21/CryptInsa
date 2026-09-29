import pytest

from cryptage.vigenere import vigenere_decrypt, vigenere_encrypt


def test_known_pair_roundtrips():
    import cryptage.vigenere as vigenere

    assert "jsonify" not in vars(vigenere)
    cipher = vigenere_encrypt("cryptographie", "mathweb")
    assert cipher == "orqwoshcahodi"
    assert vigenere_decrypt(cipher, "mathweb") == "cryptographie"


def test_space_is_part_of_the_alphabet():
    assert vigenere_encrypt("ab c", "b") == "bcad"


def test_comma_is_rejected():
    """The Vigenère alphabet is letters plus space. Comma and period are not included."""
    with pytest.raises(ValueError, match="substring not found"):
        vigenere_encrypt("a,", "b")


def test_empty_key_divides_by_zero():
    with pytest.raises(ZeroDivisionError):
        vigenere_encrypt("ab", "")
