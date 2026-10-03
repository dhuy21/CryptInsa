import json
import string
from collections import Counter

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from cryptage.cesar import cesar_decrypt, cesar_encrypt
from cryptage.decrypt import freq_francais

import api.attack as attack


def _body(request):
    if not request.body:
        return {}
    data = json.loads(request.body)
    return data or {}


def analyze_frequencies(text):
    filtered = [c.upper() for c in text if c.upper() in string.ascii_uppercase]
    freq = Counter(filtered)
    total = sum(freq.values())
    return {char: round(count / total, 4) for char, count in freq.items()}


@require_GET
def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "flask-backend",
        "message": "CryptInsa Backend API is running",
    })


@require_POST
def analyze(request):
    data = _body(request)
    message = data.get("message", "")
    return JsonResponse(analyze_frequencies(message))


@require_POST
def route_cesar(request):
    data = _body(request)
    message = data.get("message", "").lower().replace("\n", " ")
    result = cesar_encrypt(message, int(data.get("shift", 3)))
    return JsonResponse({"encrypted": result})


@require_POST
def route_cesar_decrypt(request):
    data = _body(request)
    message = data.get("message", "").lower().replace("\n", " ")
    result = cesar_decrypt(message, int(data.get("shift", 3)))
    return JsonResponse({"decrypted": result})


@require_GET
def french_frequencies(request):
    return JsonResponse(freq_francais)


@require_POST
def route_update_attack(request):
    data = _body(request)
    steps = attack.snapshot(data.get("attackId", ""))
    if steps is None:
        return JsonResponse({"error": "unknown attack"}, status=404)
    return JsonResponse(steps, safe=False)


@require_POST
def start_attack(request):
    data = _body(request)
    cipher = data.get("cipherText", "").lower().replace("\n", " ")
    attack_id = attack.start(cipher)
    return JsonResponse({"message": cipher, "attackId": attack_id})
