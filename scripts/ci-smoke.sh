#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:8000}"

echo "Waiting for ${BASE}/api/health"
ready=0
for _ in $(seq 1 60); do
  if curl -fsS "${BASE}/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "API did not become ready" >&2
  exit 1
fi

python3 - "$BASE" << 'PY'
import json
import re
import sys
import urllib.error
import urllib.request

base = sys.argv[1]


def request(path, method="GET", payload=None):
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    call = urllib.request.Request(
        base + path, data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(call) as response:
            return response.status, response.headers.get_content_type(), response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers.get_content_type(), error.read()


status, content_type, body = request("/api/health")
health = json.loads(body)
if status != 200 or health.get("status") != "healthy":
    raise SystemExit(f"health failed: {status} {body[:200]!r}")

status, content_type, body = request(
    "/api/cesar", "POST", {"message": "abc", "shift": 1}
)
if json.loads(body).get("encrypted") != "bcd":
    raise SystemExit(f"cesar failed: {status} {body[:200]!r}")

status, content_type, body = request("/cesar")
if status != 200 or content_type != "text/html" or b"<!doctype" not in body.lower():
    raise SystemExit(f"page failed: {status} {content_type}")

status, content_type, home = request("/")
match = re.search(r'src="(/assets/[^"]+\.js)"', home.decode())
if not match:
    raise SystemExit("built page has no hashed script")
status, content_type, script = request(match.group(1))
if content_type != "application/javascript" or script.lstrip().lower().startswith(b"<!doctype"):
    raise SystemExit(f"asset failed: {status} {content_type}")

status, content_type, body = request(
    "/api/start_attack", "POST", {"cipherText": "abc"}
)
started = json.loads(body)
attack_id = started.get("attackId")
if status != 200 or not attack_id:
    raise SystemExit(f"start_attack failed: {status} {body[:200]!r}")

status, content_type, body = request(
    "/api/update_attack", "POST", {"attackId": attack_id}
)
if status != 200 or not isinstance(json.loads(body), list):
    raise SystemExit(f"update_attack failed: {status} {body[:200]!r}")

status, content_type, body = request(
    "/api/update_attack", "POST", {"attackId": "missing"}
)
if status != 404 or json.loads(body).get("error") != "unknown attack":
    raise SystemExit(f"unknown attack was not JSON 404: {status} {body[:200]!r}")

print("smoke ok")
PY
