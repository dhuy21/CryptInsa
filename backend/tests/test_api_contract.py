"""Contract of the seven JSON routes used by frontend/public/js/flask.js.

The substitution attack thread is replaced by an inline call. The real attack
must not run inside this file.
"""

import json

import pytest

import app as flask_app
from tests.support.runtime import BACKEND_DIR

DATA_FILE = BACKEND_DIR / "cryptage" / "donnees.json"


class _InlineThread:
    def __init__(self, target=None, daemon=None):
        self._target = target

    def start(self):
        self._target()


@pytest.fixture
def client():
    application = flask_app.app
    previous = {
        "TESTING": application.config["TESTING"],
        "PROPAGATE_EXCEPTIONS": application.config["PROPAGATE_EXCEPTIONS"],
    }
    application.config.update(TESTING=True, PROPAGATE_EXCEPTIONS=False)
    with application.test_client() as test_client:
        yield test_client
    application.config.update(previous)


def test_health_routes(client):
    expected = {
        "status": "healthy",
        "service": "flask-backend",
        "message": "CryptInsa Backend API is running",
    }
    for path in ("/", "/health"):
        response = client.get(path)
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

    shifted = client.post("/cesar", json={"message": "vive la france", "shift": 13})
    assert shifted.status_code == 200
    assert shifted.get_json() == {"encrypted": "fvfrkynksbn pr"}

    unchanged = client.post("/cesar", json={"message": "hello world", "shift": 0})
    assert unchanged.status_code == 200
    assert unchanged.get_json() == {"encrypted": "hello world"}


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

    shifted = client.post(
        "/cesar/decrypt",
        json={"message": "tmtbmwbjyr", "shift": 4},
    )
    assert shifted.status_code == 200
    assert shifted.get_json() == {"decrypted": "pip is fun"}

    unchanged = client.post(
        "/cesar/decrypt",
        json={"message": "hello world", "shift": 0},
    )
    assert unchanged.status_code == 200
    assert unchanged.get_json() == {"decrypted": "hello world"}


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

    other_key = client.post("/vigenere", json={"message": "ab c", "key": "b"})
    assert other_key.status_code == 200
    assert other_key.get_json() == {"encrypted": "bcad"}

    with_newline = client.post("/vigenere", json={"message": "a\nb", "key": "b"})
    assert with_newline.status_code == 200
    assert with_newline.get_json() == {"encrypted": "bac"}


def test_vigenere_decrypt_returns_decrypted(client):
    response = client.post(
        "/vigenere/decrypt",
        json={"message": "orqwoshcahodi", "key": "mathweb"},
    )
    assert response.status_code == 200
    assert response.get_json() == {"decrypted": "cryptographie"}

    other_key = client.post("/vigenere/decrypt", json={"message": "bcad", "key": "B"})
    assert other_key.status_code == 200
    assert other_key.get_json() == {"decrypted": "ab c"}


def test_vigenere_empty_key_returns_500(client):
    response = client.post("/vigenere", json={"message": "ab", "key": ""})
    assert response.status_code == 500


def test_local_frontend_origins_are_echoed(client):
    """CORS(app) echoes the browser Origin. config.js calls Flask from port 8000."""
    for origin in ("http://localhost:8000", "http://127.0.0.1:8000"):
        response = client.get("/health", headers={"Origin": origin})
        assert response.status_code == 200
        assert response.headers["Access-Control-Allow-Origin"] == origin
        assert "Origin" in response.headers.get("Vary", "")

    preflight = client.options(
        "/cesar",
        headers={
            "Origin": "http://localhost:8000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers["Access-Control-Allow-Origin"] == "http://localhost:8000"
    assert "POST" in preflight.headers["Access-Control-Allow-Methods"]
    assert "Content-Type" in preflight.headers["Access-Control-Allow-Headers"]
    assert "Origin" in preflight.headers.get("Vary", "")


def test_update_attack_returns_the_in_memory_steps(client):
    assert flask_app.DONNEES_PATH.resolve() == DATA_FILE
    response = client.post("/update_attack", json={"message": "update"})
    assert response.status_code == 200
    body = response.get_json()
    assert body == json.loads(DATA_FILE.read_text(encoding="utf-8"))
    assert isinstance(body, list) and body
    for step in body:
        assert set(step) == {"mot_chiffre", "mot_traduit", "dictionnaire"}
        assert isinstance(step["dictionnaire"], dict)

    sentinel = [{"mot_chiffre": "x", "mot_traduit": "y", "dictionnaire": {"a": "b"}}]
    with flask_app._state_lock:
        previous = flask_app.attack_steps
        flask_app.attack_steps = sentinel
    try:
        again = client.post("/update_attack", json={"message": "update"})
        assert again.status_code == 200
        assert again.get_json() == sentinel
    finally:
        with flask_app._state_lock:
            flask_app.attack_steps = previous


def test_start_attack_normalizes_text_without_running_the_attack(client, monkeypatch):
    calls = []
    started = []

    class _RecordingThread(_InlineThread):
        def __init__(self, target=None, daemon=None):
            super().__init__(target=target, daemon=daemon)
            started.append(self)

    monkeypatch.setattr(flask_app, "storedcipher", "")
    monkeypatch.setattr(flask_app.threading, "Thread", _RecordingThread)
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
    assert started[0].daemon is True
