"""Contract of the JSON routes used by the React client.

The substitution attack thread is replaced by an inline call. The real attack
must not run inside this file.
"""

import json

import pytest

import api.attack as attack_state


def json_body(response):
    return json.loads(response.content)


def post_json(client, path, payload):
    return client.post(path, data=payload, content_type="application/json")


class _InlineThread:
    def __init__(self, target=None, args=(), daemon=None):
        self._target = target
        self._args = args

    def start(self):
        self._target(*self._args)


@pytest.fixture
def client():
    from django.test import Client
    return Client(raise_request_exception=False)


def test_health_routes(client):
    expected = {
        "status": "healthy",
        "service": "flask-backend",
        "message": "CryptInsa Backend API is running",
    }
    for path in ("/", "/health"):
        response = client.get(path)
        assert response.status_code == 200
        assert json_body(response) == expected


def test_french_frequencies_match_the_reference_table(client):
    from cryptage.decrypt import freq_francais

    response = client.get("/french-frequencies")
    assert response.status_code == 200
    assert json_body(response) == freq_francais


def test_analyze_counts_letters_only(client):
    response = post_json(client, "/analyze", {"message": "AaB!"})
    assert response.status_code == 200
    assert json_body(response) == {"A": 0.6667, "B": 0.3333}


def test_analyze_empty_message_returns_an_empty_object(client):
    """No letter means the division loop never runs, so the route answers 200."""
    response = post_json(client, "/analyze", {"message": ""})
    assert response.status_code == 200
    assert json_body(response) == {}


def test_cesar_returns_encrypted_and_normalizes_text(client):
    response = post_json(client, "/cesar", {"message": "CRYPTOGRAPHIE", "shift": 3})
    assert response.status_code == 200
    assert json_body(response) == {"encrypted": "fu,swrjudsklh"}

    shifted = post_json(client, "/cesar", {"message": "vive la france", "shift": 13})
    assert shifted.status_code == 200
    assert json_body(shifted) == {"encrypted": "fvfrkynksbn pr"}

    unchanged = post_json(client, "/cesar", {"message": "hello world", "shift": 0})
    assert unchanged.status_code == 200
    assert json_body(unchanged) == {"encrypted": "hello world"}


def test_cesar_encrypts_the_space_that_replaces_a_newline(client):
    """A newline becomes a space, and a space is a letter of the 29-character alphabet."""
    response = post_json(client, "/cesar", {"message": "a\nb"})
    assert response.status_code == 200
    assert json_body(response) == {"encrypted": "dae"}


def test_cesar_decrypt_returns_decrypted(client):
    response = post_json(client, 
        "/cesar/decrypt",
{"message": "fu,swrjudsklh", "shift": 3},
    )
    assert response.status_code == 200
    assert json_body(response) == {"decrypted": "cryptographie"}

    shifted = post_json(client, 
        "/cesar/decrypt",
{"message": "tmtbmwbjyr", "shift": 4},
    )
    assert shifted.status_code == 200
    assert json_body(shifted) == {"decrypted": "pip is fun"}

    unchanged = post_json(client, 
        "/cesar/decrypt",
{"message": "hello world", "shift": 0},
    )
    assert unchanged.status_code == 200
    assert json_body(unchanged) == {"decrypted": "hello world"}


def test_cesar_accented_letter_returns_500(client):
    response = post_json(client, "/cesar", {"message": "é", "shift": 1})
    assert response.status_code == 500


def test_local_frontend_origins_are_echoed(client):
    """CORS echoes the browser Origin. config.js calls the API from port 8000."""
    for origin in ("http://localhost:8000", "http://127.0.0.1:8000"):
        response = client.get("/health", headers={"Origin": origin})
        assert response.status_code == 200
        assert response.headers["Access-Control-Allow-Origin"] == origin
        assert "origin" in response.headers.get("Vary", "").lower()

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
    assert "origin" in preflight.headers.get("Vary", "").lower()


def _record_steps(cipher, steps):
    steps.append({
        "mot_chiffre": cipher,
        "mot_traduit": "t",
        "dictionnaire": {"a": "b"},
    })


def test_two_attacks_keep_separate_steps(client, monkeypatch):
    monkeypatch.setattr(attack_state.threading, "Thread", _InlineThread)
    monkeypatch.setattr(attack_state, "call_substitution_attack", _record_steps)
    monkeypatch.setattr(attack_state, "MAX_ATTACKS", 2)
    with attack_state._state_lock:
        attack_state._attacks.clear()
        attack_state._attack_order.clear()

    first = json_body(post_json(client, "/start_attack", {"cipherText": "Ab\nC"}))
    second = json_body(post_json(client, "/start_attack", {"cipherText": "Xy"}))
    third = json_body(post_json(client, "/start_attack", {"cipherText": "Zz"}))

    assert first["message"] == "ab c"
    assert second["message"] == "xy"
    assert first["attackId"] != second["attackId"]

    first_steps = post_json(client, "/update_attack", {"attackId": first["attackId"]})
    second_steps = post_json(client, "/update_attack", {"attackId": second["attackId"]})
    third_steps = post_json(client, "/update_attack", {"attackId": third["attackId"]})
    missing = post_json(client, "/update_attack", {"attackId": "missing"})

    assert first_steps.status_code == 404
    assert second_steps.status_code == 200
    assert json_body(second_steps)[0]["mot_chiffre"] == "xy"
    assert third_steps.status_code == 200
    assert json_body(third_steps)[0]["mot_chiffre"] == "zz"
    assert missing.status_code == 404
