#!/bin/sh
set -eu

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example and set production secrets."
  exit 1
fi
if [ ! -f VERSION ]; then
  echo "ERROR: VERSION not found."
  exit 1
fi

EXPECTED_VERSION="$(cat VERSION | tr -d '\r\n')"
ENV_VERSION="$(sed -n 's/^APP_VERSION=//p' .env | tail -n 1 | tr -d '\r')"
if [ -z "$ENV_VERSION" ] || [ "$ENV_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "ERROR: APP_VERSION in .env must equal VERSION ($EXPECTED_VERSION)."
  exit 1
fi

docker compose --env-file .env config --quiet

for lock in frontend/package-lock.json backend/package-lock.json; do
  if [ ! -f "$lock" ]; then
    echo "ERROR: reproducible dependency lockfile missing: $lock"
    exit 1
  fi
done

docker compose pull || true
docker compose up -d --build

retry_http() {
  url="$1"
  attempts="${2:-30}"
  i=1
  while [ "$i" -le "$attempts" ]; do
    if curl -fsS "$url" >/tmp/adm-katekese-probe.json 2>/dev/null; then
      cat /tmp/adm-katekese-probe.json
      echo
      return 0
    fi
    sleep 2
    i=$((i+1))
  done
  echo "ERROR: probe failed after $attempts attempts: $url"
  docker compose ps || true
  return 1
}

retry_http http://localhost/api/health
READY_JSON="$(retry_http http://localhost/api/ready)"
RELEASE_JSON="$(retry_http http://localhost/release.json)"

DEPLOYED_VERSION="$(printf '%s' "$READY_JSON" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p' | head -n 1)"
SCHEMA_GENERATION="$(printf '%s' "$READY_JSON" | sed -n 's/.*"schemaGeneration":\([0-9][0-9]*\).*/\1/p' | head -n 1)"
FRONTEND_VERSION="$(printf '%s' "$RELEASE_JSON" | sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' | head -n 1)"
if [ "$DEPLOYED_VERSION" != "$EXPECTED_VERSION" ] || [ "$FRONTEND_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "DEPLOYED_VERSION_MISMATCH: expected=$EXPECTED_VERSION api=${DEPLOYED_VERSION:-missing} frontend=${FRONTEND_VERSION:-missing}"
  exit 1
fi

if [ "$SCHEMA_GENERATION" != "53" ]; then
  echo "SCHEMA_GENERATION_MISMATCH: expected=52 actual=${SCHEMA_GENERATION:-missing}"
  exit 1
fi
EXPECTED_VERSION="$EXPECTED_VERSION" EXPECTED_SCHEMA_GENERATION=53 ./scripts/smoke-deployment.sh
BASE_URL=http://localhost OUT_DIR=evidence/browser-uat-hostinger ./scripts/browser-uat-live.sh
docker compose ps
echo "Deployment candidate ready: version=$DEPLOYED_VERSION schema=$SCHEMA_GENERATION"
echo "DNS/HTTPS and live external UAT must still be verified before Production GO."
