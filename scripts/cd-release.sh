#!/bin/bash
# Publish this commit to production. The arm64 images are already built and scanned.
# API goes first, then the frontend. A failed live check restores the previous release.
set -euo pipefail

: "${AWS_REGION:?}"
: "${INSTANCE_ID:?}"
: "${FRONTEND_BUCKET:?}"
: "${CLOUDFRONT_DISTRIBUTION:?}"

changed_api=false
changed_frontend=false
old_backend=""
old_nginx=""
backup=""
cert_dir=""

cleanup_local() {
  docker rm -f cryptinsa-ci-nginx cryptinsa-ci-backend >/dev/null 2>&1 || true
  docker network rm cryptinsa-ci >/dev/null 2>&1 || true
  if [ -n "$cert_dir" ]; then
    rm -rf "$cert_dir"
    cert_dir=""
  fi
}

restore_api() {
  aws ssm put-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/backend-image --type String --overwrite \
    --value "$old_backend" >/dev/null
  aws ssm put-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/nginx-image --type String --overwrite \
    --value "$old_nginx" >/dev/null
  RESTART=true python3 deploy/origin/install_remote.py
}

restore_frontend() {
  aws s3 sync "$backup/" "s3://${FRONTEND_BUCKET}/" --delete >/dev/null
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION" --paths "/*" >/dev/null
}

rollback() {
  code=$?
  trap - ERR
  cleanup_local
  if [ "$changed_api" = true ]; then
    restore_api || echo "api rollback failed" >&2
  fi
  if [ "$changed_frontend" = true ]; then
    restore_frontend || echo "frontend rollback failed" >&2
  fi
  exit "$code"
}

smoke_built_images() {
  cleanup_local
  cert_dir=$(mktemp -d)
  openssl req -x509 -newkey rsa:2048 \
    -keyout "$cert_dir/privkey.pem" -out "$cert_dir/fullchain.pem" \
    -days 1 -nodes -subj /CN=origin.cryptinsa.com >/dev/null 2>&1
  docker network create cryptinsa-ci >/dev/null
  docker run -d --name cryptinsa-ci-backend --network cryptinsa-ci \
    -e DJANGO_SECRET_KEY=ci cryptinsa-backend:ci >/dev/null
  docker run -d --name cryptinsa-ci-nginx --network cryptinsa-ci \
    -p 127.0.0.1:8443:443 \
    -e ORIGIN_VERIFY=citest \
    -v "$cert_dir:/etc/nginx/certs:ro" \
    cryptinsa-nginx:ci >/dev/null

  ok=false
  for _ in $(seq 1 30); do
    code=$(curl -k -s -o /dev/null -w '%{http_code}' \
      -H 'X-Origin-Verify: citest' https://127.0.0.1:8443/api/health || true)
    if [ "$code" = 200 ]; then
      ok=true
      break
    fi
    sleep 2
  done
  test "$ok" = true
  curl -k -fsS -H 'X-Origin-Verify: citest' -H 'Content-Type: application/json' \
    -d '{"message":"abc","shift":1}' https://127.0.0.1:8443/api/cesar \
    | python3 -c 'import json,sys; assert json.load(sys.stdin)["encrypted"]=="bcd"'
  denied=$(curl -k -s -o /dev/null -w '%{http_code}' https://127.0.0.1:8443/api/health || true)
  test "$denied" = 403
  cleanup_local
}

push_digest() {
  local_tag=$1
  name=$2
  remote="${REGISTRY}/${name}:${IMAGE_TAG}"
  docker tag "$local_tag" "$remote"
  # docker push writes "digest: sha256:..." on stderr, not stdout.
  digest=$(docker push "$remote" 2>&1 | tee /dev/stderr | sed -n 's/.*digest: \(sha256:[0-9a-f][0-9a-f]*\).*/\1/p' | tail -1)
  test -n "$digest"
  printf '%s' "${REGISTRY}/${name}@${digest}"
}

upload_frontend() {
  aws s3 sync "${DIST_DIR}/" "s3://${FRONTEND_BUCKET}/" \
    --delete \
    --exclude "index.html" \
    --exclude "assets/*" \
    --cache-control "no-cache" >/dev/null
  aws s3 sync "${DIST_DIR}/assets/" "s3://${FRONTEND_BUCKET}/assets/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" >/dev/null
  aws s3 cp "${DIST_DIR}/index.html" "s3://${FRONTEND_BUCKET}/index.html" \
    --cache-control "no-cache" \
    --content-type "text/html; charset=utf-8" >/dev/null
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION" \
    --paths "/index.html" "/" >/dev/null
}

trap rollback ERR

if [ "${CHANGED_IMAGES}" = true ]; then
  : "${REGISTRY:?}"
  : "${IMAGE_TAG:?}"
  smoke_built_images
  backend_image=$(push_digest cryptinsa-backend:ci cryptinsa-backend)
  nginx_image=$(push_digest cryptinsa-nginx:ci cryptinsa-nginx)
  old_backend=$(aws ssm get-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/backend-image --query Parameter.Value --output text)
  old_nginx=$(aws ssm get-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/nginx-image --query Parameter.Value --output text)
  aws ssm put-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/backend-image --type String --overwrite \
    --value "$backend_image" >/dev/null
  if ! aws ssm put-parameter --region "$AWS_REGION" \
    --name /cryptinsa/prod/nginx-image --type String --overwrite \
    --value "$nginx_image" >/dev/null; then
    aws ssm put-parameter --region "$AWS_REGION" \
      --name /cryptinsa/prod/backend-image --type String --overwrite \
      --value "$old_backend" >/dev/null
    exit 1
  fi
  changed_api=true
  RESTART=true python3 deploy/origin/install_remote.py
elif [ "${CHANGED_SCRIPTS}" = true ]; then
  RESTART=false python3 deploy/origin/install_remote.py
fi

if [ "${CHANGED_FRONTEND}" = true ]; then
  : "${DIST_DIR:?}"
  test -f "${DIST_DIR}/index.html"
  backup=$(mktemp -d)
  aws s3 sync "s3://${FRONTEND_BUCKET}/" "$backup/" >/dev/null
  changed_frontend=true
  upload_frontend
fi

if [ "${CHANGED_IMAGES}" = true ] || [ "${CHANGED_FRONTEND}" = true ]; then
  BASE_URL=https://cryptinsa.com bash scripts/ci-smoke.sh
fi

trap - ERR
cleanup_local
