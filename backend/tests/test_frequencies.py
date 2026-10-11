import json
from importlib.metadata import version
from pathlib import Path

import pytest

import cryptage.frequences_lettres as freq

FIXTURE = Path(__file__).parent / "fixtures" / "reference_frequencies.json"


def test_letter_count_includes_the_last_character():
    result = freq.get_letter_frequencies("ab")
    assert result["a"] == 50.0
    assert result["b"] == 50.0


def test_single_character_text_is_one_hundred_percent():
    result = freq.get_letter_frequencies("a")
    assert result["a"] == 100.0
    assert sum(result.values()) == 100.0


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


def test_reference_frequencies_open_when_cwd_is_not_backend(tmp_path, monkeypatch):
    import cryptage.decrypt as decrypt

    monkeypatch.chdir(tmp_path)
    assert decrypt.FREQ_PATH.is_file()
    assert decrypt.load_freq_francais() == decrypt.freq_francais


def test_french_reference_matches_the_recorded_pdf_extraction():
    import cryptage.decrypt as decrypt

    recorded = json.loads(FIXTURE.read_text(encoding="utf-8"))
    assert version("pymupdf") == recorded["pymupdf"]
    assert decrypt.freq_francais == recorded["letter_frequencies"]
