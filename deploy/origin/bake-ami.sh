#!/bin/bash
# Build an AMI that can boot a new origin. The production instance is not touched.
# Secrets are not copied into the image.
set -eu

region=eu-west-3
subnet=subnet-0860e4dd2028ae734
sg=sg-0804f8a2d506707ac
profile=cryptinsa-ec2
base_ami=ami-023896849c294db68
root=$(cd "$(dirname "$0")/../.." && pwd)
stamp=$(date -u +%Y%m%d%H%M)
name="cryptinsa-origin-${stamp}"

user_data=$(mktemp)
python3 - "$root" "$user_data" <<'PY'
import base64, pathlib, sys
root, dest = sys.argv[1:]
files = {
    "/opt/cryptinsa/start.sh": "deploy/origin/start.sh",
    "/opt/cryptinsa/renew-cert.sh": "deploy/origin/renew-cert.sh",
    "/opt/cryptinsa/issue-cert.sh": "deploy/origin/issue-cert.sh",
    "/opt/cryptinsa/boot.sh": "deploy/origin/boot.sh",
    "/etc/systemd/system/cryptinsa-origin-renew.service": "deploy/origin/cryptinsa-origin-renew.service",
    "/etc/systemd/system/cryptinsa-origin-renew.timer": "deploy/origin/cryptinsa-origin-renew.timer",
}
lines = [
    "#!/bin/bash",
    "set -eux",
    "dnf install -y docker awscli-2 python3",
    "systemctl enable docker",
    "install -d -m 755 /opt/cryptinsa",
]
for dest_path, src in files.items():
    payload = base64.b64encode((pathlib.Path(root) / src).read_bytes()).decode()
    mode = "755" if dest_path.endswith(".sh") else "644"
    lines.append(f"printf '%s' '{payload}' | base64 -d > {dest_path}")
    lines.append(f"chmod {mode} {dest_path}")
lines += [
    "cloud-init clean --logs",
    "shutdown -h now",
]
pathlib.Path(dest).write_text("\n".join(lines) + "\n")
PY
size=$(wc -c < "$user_data")
if [ "$size" -gt 16000 ]; then
  echo "user data is ${size} bytes" >&2
  exit 1
fi

instance=$(aws ec2 run-instances --region "$region" \
  --image-id "$base_ami" \
  --instance-type t4g.micro \
  --subnet-id "$subnet" \
  --security-group-ids "$sg" \
  --iam-instance-profile "Name=${profile}" \
  --associate-public-ip-address \
  --instance-initiated-shutdown-behavior stop \
  --user-data "file://${user_data}" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${name}}]" \
  --query 'Instances[0].InstanceId' --output text)
rm -f "$user_data"
echo "builder ${instance}"
aws ec2 wait instance-running --region "$region" --instance-ids "$instance"

cleanup() {
  aws ec2 terminate-instances --region "$region" --instance-ids "$instance" >/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  state=$(aws ec2 describe-instances --region "$region" --instance-ids "$instance" \
    --query 'Reservations[0].Instances[0].State.Name' --output text)
  if [ "$state" = stopped ]; then
    break
  fi
  if [ "$state" = terminated ] || [ "$state" = shutting-down ]; then
    echo "builder entered ${state}" >&2
    aws ec2 get-console-output --region "$region" --instance-id "$instance" \
      --query Output --output text | tail -n 40 >&2 || true
    exit 1
  fi
  sleep 15
done
if [ "$state" != stopped ]; then
  echo "builder did not stop" >&2
  aws ec2 get-console-output --region "$region" --instance-id "$instance" \
    --query Output --output text | tail -n 40 >&2 || true
  exit 1
fi
ami=$(aws ec2 create-image --region "$region" \
  --instance-id "$instance" \
  --name "$name" \
  --tag-specifications "ResourceType=image,Tags=[{Key=Name,Value=${name}},{Key=Role,Value=cryptinsa-origin}]" \
  --query ImageId --output text)
echo "ami ${ami}"
aws ec2 wait image-available --region "$region" --image-ids "$ami"
echo "ready ${ami}"
