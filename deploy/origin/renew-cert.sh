#!/bin/bash
# Runs on the EC2 instance, twice a day, without anyone logged in.
# The Cloudflare token is read from SSM for the DNS check, then the file is removed.
# Django is not restarted.
set -eu

install -d -m 700 /opt/cryptinsa/letsencrypt /run/cryptinsa
ini=/run/cryptinsa/cloudflare.ini

python3 - <<'PY'
import json
import pathlib
import subprocess

raw = subprocess.check_output([
    "aws", "ssm", "get-parameter",
    "--name", "/cryptinsa/prod/cloudflare-api-token",
    "--with-decryption",
    "--region", "eu-west-3",
    "--output", "json",
])
token = json.loads(raw)["Parameter"]["Value"].strip()
path = pathlib.Path("/run/cryptinsa/cloudflare.ini")
path.write_text(f"dns_cloudflare_api_token = {token}\n")
path.chmod(0o600)
PY

cleanup() {
  rm -f "$ini"
}
trap cleanup EXIT

docker run --rm -v /opt/cryptinsa/letsencrypt:/etc/letsencrypt alpine:3.22 \
  rm -f /etc/letsencrypt/renewed
docker run --rm \
  -v /opt/cryptinsa/letsencrypt:/etc/letsencrypt \
  -v "${ini}:/cloudflare.ini:ro" \
  certbot/dns-cloudflare renew \
  --non-interactive \
  --quiet \
  --no-random-sleep-on-renew \
  --deploy-hook "touch /etc/letsencrypt/renewed"

if ! docker run --rm -v /opt/cryptinsa/letsencrypt:/etc/letsencrypt:ro alpine:3.22 \
  test -f /etc/letsencrypt/renewed; then
  echo "not due"
  exit 0
fi

python3 - <<'PY'
import json
import pathlib
import subprocess

live = pathlib.Path("/opt/cryptinsa/letsencrypt/live/origin.cryptinsa.com")
certs = pathlib.Path("/opt/cryptinsa/certs")

def put(name, value):
    payload = pathlib.Path(f"/run/cryptinsa/{name.split('/')[-1]}.json")
    payload.write_text(json.dumps({
        "Name": name,
        "Type": "SecureString",
        "Tier": "Advanced",
        "Value": value,
        "Overwrite": True,
    }))
    payload.chmod(0o600)
    subprocess.check_call([
        "aws", "ssm", "put-parameter",
        "--region", "eu-west-3",
        "--cli-input-json", f"file://{payload}",
    ], stdout=subprocess.DEVNULL)
    payload.unlink()

fullchain = (live / "fullchain.pem").read_text()
key = (live / "privkey.pem").read_text()
(certs / "fullchain.pem").write_text(fullchain)
(certs / "privkey.pem").write_text(key)
for name in ("fullchain.pem", "privkey.pem"):
    (certs / name).chmod(0o600)
put("/cryptinsa/prod/origin-tls-fullchain", fullchain)
put("/cryptinsa/prod/origin-tls-key", key)
PY

docker run --rm -v /opt/cryptinsa/letsencrypt:/etc/letsencrypt alpine:3.22 \
  rm -f /etc/letsencrypt/renewed
docker exec cryptinsa-nginx nginx -s reload
echo "renewed"
