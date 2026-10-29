#!/usr/bin/env python3
"""Copy origin scripts and the renewal timer onto the EC2 instance."""

import base64
import json
import os
import pathlib
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parent
FILES = (
    (ROOT / "start.sh", "/opt/cryptinsa/start.sh", "755"),
    (ROOT / "renew-cert.sh", "/opt/cryptinsa/renew-cert.sh", "755"),
    (
        ROOT / "cryptinsa-origin-renew.service",
        "/etc/systemd/system/cryptinsa-origin-renew.service",
        "644",
    ),
    (
        ROOT / "cryptinsa-origin-renew.timer",
        "/etc/systemd/system/cryptinsa-origin-renew.timer",
        "644",
    ),
)


def commands(restart):
    lines = ["install -d -m 755 /opt/cryptinsa"]
    for src, dest, mode in FILES:
        payload = base64.b64encode(src.read_bytes()).decode()
        lines.append(f"printf '%s' '{payload}' | base64 -d > {dest}")
        lines.append(f"chmod {mode} {dest}")
    lines.append("systemctl daemon-reload")
    lines.append("systemctl enable --now cryptinsa-origin-renew.timer")
    if restart:
        lines.append("bash /opt/cryptinsa/start.sh")
    return lines


def main():
    region = os.environ["AWS_REGION"]
    instance = os.environ["INSTANCE_ID"]
    restart = os.environ.get("RESTART") == "true"
    payload = {
        "InstanceIds": [instance],
        "DocumentName": "AWS-RunShellScript",
        "TimeoutSeconds": 900,
        "Comment": "cryptinsa origin",
        "Parameters": {"commands": commands(restart)},
    }
    request = pathlib.Path("/tmp/cryptinsa-ssm.json")
    request.write_text(json.dumps(payload))
    request.chmod(0o600)
    try:
        command_id = subprocess.check_output(
            [
                "aws", "ssm", "send-command",
                "--region", region,
                "--cli-input-json", f"file://{request}",
                "--query", "Command.CommandId",
                "--output", "text",
            ],
            text=True,
        ).strip()
    finally:
        request.unlink(missing_ok=True)

    for _ in range(90):
        result = subprocess.run(
            [
                "aws", "ssm", "get-command-invocation",
                "--region", region,
                "--command-id", command_id,
                "--instance-id", instance,
                "--output", "json",
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            if "InvocationDoesNotExist" in result.stderr:
                time.sleep(10)
                continue
            raise SystemExit(result.stderr.strip() or "get-command-invocation failed")
        body = json.loads(result.stdout)
        status = body.get("Status", "")
        if status == "Success":
            return
        if status in {"Failed", "Cancelled", "TimedOut"}:
            detail = (body.get("StandardErrorContent") or status).strip()
            raise SystemExit(detail)
        time.sleep(10)
    raise SystemExit("origin command still running")


if __name__ == "__main__":
    main()
