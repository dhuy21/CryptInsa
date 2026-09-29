import json
from importlib.metadata import version
from pathlib import Path

import pytest

import cryptage.frequences_lettres as freq

FIXTURE = Path(__file__).parent / "fixtures" / "reference_frequencies.json"


def test_letter_count_skips_the_last_character():
    """range(len(text) - 1) drops the final character, then divides by the full length."""
    result = freq.get_letter_frequencies("ab")
    assert result["a"] == 50.0
    assert result["b"] == 0.0


def test_single_character_text_has_every_frequency_at_zero():
    result = freq.get_letter_frequencies("a")
    assert result["a"] == 0.0
    assert sum(result.values()) == 0.0


def test_empty_text_divides_by_zero():
    with pytest.raises(ZeroDivisionError):
        freq.get_letter_frequencies("")


def test_combination_frequency_of_one_pair():
    result = freq.get_combination_frequencies("ab")
    assert result["ab"] == 100.0
    assert sum(1 for value in result.values() if value) == 1


def test_combination_frequency_of_one_character_divides_by_zero():
    with pytest.raises(ZeroDivisionError):
        freq.get_combination_frequencies("a")


def test_french_reference_matches_the_recorded_pdf_extraction():
    import cryptage.decrypt as decrypt

    recorded = json.loads(FIXTURE.read_text(encoding="utf-8"))
    assert version("pymupdf") == recorded["pymupdf"]
    assert len(freq.text) == recorded["pdf_text_length"]
    assert decrypt.miserable == freq.text == decrypt.text
    assert set(decrypt.freq_francais) == set(recorded["letter_frequencies"])
    for letter, expected in recorded["letter_frequencies"].items():
        assert decrypt.freq_francais[letter] == pytest.approx(expected)
