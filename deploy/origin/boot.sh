#!/bin/bash
# First boot of a new instance. Packages and scripts are already on the AMI.
# Secrets stay in SSM. A missing Let's Encrypt account is created here.
set -eu

systemctl enable --now docker
bash /opt/cryptinsa/start.sh
bash /opt/cryptinsa/issue-cert.sh
systemctl daemon-reload
systemctl enable --now cryptinsa-origin-renew.timer
