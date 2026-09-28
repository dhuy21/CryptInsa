"""Contract of the seven JSON routes used by frontend/public/js/flask.js.

The substitution attack thread is replaced by an inline call. The real attack
writes cryptage/donnees.json and must not run inside this file.
"""

import json
from pathlib import Path

import pytest

import app as flask_app

DATA_FILE = Path("cryptage/donnees.json")


class _InlineThread:
    def __init__(self, target=None, daemon=None):
        self._target = target

    def start(self):
        self._target()


@pytest.fixture
def client():
    flask_app.app.config.update(TESTING=True, PROPAGATE_EXCEPTIONS=False)
    with flask_app.app.test_client() as test_client:
        yield test_client


def test_health_routes():
    expected = {
        "status": "healthy",
        "service": "flask-backend",
        "message": "CryptInsa Backend API is running",
    }
    with flask_app.app.test_client() as test_client:
        for path in ("/", "/health"):
            response = test_client.get(path)
            assert response.status_code == 200
            assert response.get_json() == expected


def test_analyze_counts_letters_only(client):
    response = client.post("/analyze", json={"message": "AaB!"})
    assert response.status_code == 200
    assert response.get_json() == {"A": 0.6667, "B": 0.3333}


def test_analyze_empty_message_returns_an_empty_object(client):
    """No letter means the division loop never runs, so the route answers 200."""
    response = client.post("/analyze", json={"message": ""})
    assert response.status_code == 200
    assert response.get_json() == {}


def test_cesar_returns_encrypted_and_normalizes_text(client):
    response = client.post("/cesar", json={"message": "CRYPTOGRAPHIE", "shift": 3})
    assert response.status_code == 200
    assert response.get_json() == {"encrypted": "fu,swrjudsklh"}


def test_cesar_encrypts_the_space_that_replaces_a_newline(client):
    """A newline becomes a space, and a space is a letter of the 29-character alphabet."""
    response = client.post("/cesar", json={"message": "a\nb"})
    assert response.status_code == 200
    assert response.get_json() == {"encrypted": "dae"}


def test_cesar_decrypt_returns_decrypted(client):
    response = client.post(
        "/cesar/decrypt",
        json={"message": "fu,swrjudsklh", "shift": 3},
    )
    assert response.status_code == 200
    assert response.get_json() == {"decrypted": "cryptographie"}


def test_cesar_accented_letter_returns_500(client):
    response = client.post("/cesar", json={"message": "é", "shift": 1})
    assert response.status_code == 500


def test_vigenere_returns_encrypted(client):
    response = client.post(
        "/vigenere",
        json={"message": "Cryptographie", "key": "MATHWEB"},
    )
    assert response.status_code == 200
    assert response.get_json() == {"encrypted": "orqwoshcahodi"}


def test_vigenere_decrypt_returns_decrypted(client):
    response = client.post(
        "/vigenere/decrypt",
        json={"message": "orqwoshcahodi", "key": "mathweb"},
    )
    assert response.status_code == 200
    assert response.get_json() == {"decrypted": "cryptographie"}


def test_vigenere_empty_key_returns_500(client):
    response = client.post("/vigenere", json={"message": "ab", "key": ""})
    assert response.status_code == 500


def test_update_attack_returns_the_on_disk_json(client):
    response = client.post("/update_attack", json={"message": "update"})
    assert response.status_code == 200
    assert response.get_json() == json.loads(DATA_FILE.read_text(encoding="utf-8"))


def test_start_attack_normalizes_text_without_running_the_attack(client, monkeypatch):
    calls = []
    monkeypatch.setattr(flask_app.threading, "Thread", _InlineThread)
    monkeypatch.setattr(
        flask_app,
        "call_substitution_attack",
        lambda: calls.append(flask_app.storedcipher),
    )

    response = client.post("/start_attack", json={"cipherText": "Ab\nC"})

    assert response.status_code == 200
    assert response.get_json() == {"message": "ab c"}
    assert calls == ["ab c"]
    assert flask_app.storedcipher == "ab c"
