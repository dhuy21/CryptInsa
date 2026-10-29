#!/bin/sh
# Substitute the origin header at start. The value comes from the container
# environment, which the host read from SSM. It is not baked into the image.
set -eu

if [ -z "${ORIGIN_VERIFY:-}" ]; then
  echo "ORIGIN_VERIFY is required" >&2
  exit 1
fi

sed "s/__ORIGIN_VERIFY__/${ORIGIN_VERIFY}/" \
  /opt/cryptinsa/origin.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
