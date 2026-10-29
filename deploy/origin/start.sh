#!/bin/bash
# Pull the pinned Nginx and Django images, then start them.
# Image URIs and secrets come from SSM. Nothing secret is printed.
set -eu

install -d -m 700 /opt/cryptinsa/certs
cd /opt/cryptinsa

python3 - <<'PY'
import json
import pathlib
import subprocess

def param(name):
    raw = subprocess.check_output([
        "aws", "ssm", "get-parameter",
        "--name", name,
        "--with-decryption",
        "--region", "eu-west-3",
        "--output", "json",
    ])
    return json.loads(raw)["Parameter"]["Value"]

root = pathlib.Path("/opt/cryptinsa")
(root / "certs/fullchain.pem").write_text(param("/cryptinsa/prod/origin-tls-fullchain"))
(root / "certs/privkey.pem").write_text(param("/cryptinsa/prod/origin-tls-key"))
(root / "backend.env").write_text(
    "DJANGO_SECRET_KEY=" + param("/cryptinsa/prod/django-secret-key") + "\n"
)
(root / "verify").write_text(param("/cryptinsa/prod/origin-verify"))
(root / "images.env").write_text(
    "BACKEND_IMAGE=" + param("/cryptinsa/prod/backend-image") + "\n"
    "NGINX_IMAGE=" + param("/cryptinsa/prod/nginx-image") + "\n"
)
for name in ("certs/fullchain.pem", "certs/privkey.pem", "backend.env", "verify", "images.env"):
    (root / name).chmod(0o600)
PY

set -a
. /opt/cryptinsa/images.env
set +a

registry="${BACKEND_IMAGE%%/*}"
aws ecr get-login-password --region eu-west-3 \
  | docker login --username AWS --password-stdin "$registry" >/dev/null

docker pull "$BACKEND_IMAGE" >/dev/null
docker pull "$NGINX_IMAGE" >/dev/null

docker network create cryptinsa >/dev/null 2>&1 || true
docker rm -f cryptinsa-nginx cryptinsa-backend >/dev/null 2>&1 || true
docker run -d --name cryptinsa-backend --network cryptinsa --restart unless-stopped \
  --env-file /opt/cryptinsa/backend.env \
  "$BACKEND_IMAGE" >/dev/null
docker run -d --name cryptinsa-nginx --network cryptinsa --restart unless-stopped \
  -p 443:443 \
  -e ORIGIN_VERIFY="$(cat /opt/cryptinsa/verify)" \
  -v /opt/cryptinsa/certs:/etc/nginx/certs:ro \
  "$NGINX_IMAGE" >/dev/null

sleep 3
docker exec cryptinsa-nginx nginx -t

python3 - <<'PY'
import pathlib
import ssl
import time
import urllib.error
import urllib.request

secret = pathlib.Path("/opt/cryptinsa/verify").read_text().strip()
context = ssl._create_unverified_context()
request = urllib.request.Request(
    "https://127.0.0.1/api/health",
    headers={"Host": "origin.cryptinsa.com", "X-Origin-Verify": secret},
)
for _ in range(20):
    try:
        with urllib.request.urlopen(request, context=context, timeout=3) as response:
            print("health", response.status)
            break
    except urllib.error.HTTPError as error:
        print("health", error.code)
        raise SystemExit(1)
    except Exception as error:
        print("waiting", type(error).__name__)
        time.sleep(3)
else:
    raise SystemExit(1)

bare = urllib.request.Request(
    "https://127.0.0.1/api/health",
    headers={"Host": "origin.cryptinsa.com"},
)
try:
    urllib.request.urlopen(bare, context=context, timeout=3)
    print("noheader-open")
    raise SystemExit(1)
except urllib.error.HTTPError as error:
    print("noheader", error.code)
    if error.code != 403:
        raise SystemExit(1)
PY
