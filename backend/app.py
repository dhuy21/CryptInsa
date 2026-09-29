import os
import os
from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from collections import Counter
import string
from cryptage.cesar import *
from cryptage.vigenere import *
import json
import threading
from pathlib import Path
from flask import make_response
import cryptage.main as main

DONNEES_PATH = Path(__file__).resolve().parent / "cryptage" / "donnees.json"
_state_lock = threading.Lock()


class AttackSteps(list):
    def __init__(self, initial=()):
        super().__init__(initial)
        self._lock = threading.Lock()

    def append(self, item):
        with self._lock:
            super().append(item)

    def clear(self):
        with self._lock:
            super().clear()

    def snapshot(self):
        with self._lock:
            return list(self)


def _load_saved_steps():
    try:
        return json.loads(DONNEES_PATH.read_text(encoding="utf-8"))
    except Exception as error:
        return {"error": str(error)}


_saved_steps = _load_saved_steps()
attack_steps = AttackSteps(_saved_steps) if isinstance(_saved_steps, list) else _saved_steps 

app = Flask(__name__)
CORS(app)  # autorise les requêtes depuis le frontend

# Route de santé pour vérifier que le backend fonctionne
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "flask-backend",
        "message": "CryptInsa Backend API is running"
    })
analyse_started = False
storedcipher = ""
def analyze_frequencies(text):
    filtered = [c.upper() for c in text if c.upper() in string.ascii_uppercase]
    freq = Counter(filtered)
    total = sum(freq.values())
    return {char: round(count / total, 4) for char, count in freq.items()}

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    message = data.get('message', '')
    frequencies = analyze_frequencies(message)
    return jsonify(frequencies)


@app.route('/cesar', methods=['POST'])
def route_cesar():
    data = request.get_json()
    message = data.get('message', '').lower().replace('\n', ' ')
    result = cesar_encrypt(message, int(data.get('shift', 3)))
    response = {"encrypted" : result}
    # Retourne une réponse standardisée
    return jsonify(response)

@app.route('/cesar/decrypt', methods=['POST'])
def route_cesar_decrypt():
    data = request.get_json()
    message = data.get('message', '').lower().replace('\n', ' ')
    result = cesar_decrypt(message, int(data.get('shift', 3)))
    response = {"decrypted" : result}
    # Retourne une réponse standardisée
    return jsonify(response)

@app.route('/vigenere', methods=['POST'])
def route_vigenere():
    data = request.get_json()
    message = data.get('message', '').lower().replace('\n', ' ')
    key = data.get('key', '').lower().replace('\n', ' ')
    result = vigenere_encrypt(message, key)
    response = {"encrypted": result}
    # Retourne une réponse standardisée
    return jsonify(response)

@app.route('/vigenere/decrypt', methods=['POST'])
def route_vigenere_decrypt():
    data = request.get_json()
    message = data.get('message', '').lower().replace('\n', ' ')
    key = data.get('key', '').lower().replace('\n', ' ')
    result = vigenere_decrypt(message, key)
    response = {"decrypted": result}
    # Retourne une réponse standardisée
    return jsonify(response)


def call_substitution_attack():
    global attack_steps
    steps = AttackSteps()
    with _state_lock:
        attack_steps = steps
    traduction, traduction_sur, message_split, ponctuation = main.etape1(storedcipher, steps)
    main.etape2(storedcipher, traduction, traduction_sur, message_split, ponctuation, steps)


@app.route('/update_attack', methods=['POST'])
def route_update_attack():
    with _state_lock:
        current = attack_steps
    if isinstance(current, AttackSteps):
        payload = current.snapshot()
    else:
        payload = current
    return jsonify(payload)
@app.route('/start_attack', methods=['POST'])
def start_attack():
    global storedcipher
    data = request.get_json()
   
    storedcipher = data.get('cipherText', '').lower().replace('\n', ' ')
    # Démarrer l'attaque dans un thread séparé
    thread = threading.Thread(target=call_substitution_attack)
    thread.daemon = True
    thread.start()
    return jsonify({"message": storedcipher})

if __name__ == '__main__':
    import os
    # En production, debug=False et host=0.0.0.0 pour être accessible depuis l'extérieur
    debug_mode = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
