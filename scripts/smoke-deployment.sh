#!/bin/sh
set -eu
BASE_URL=${BASE_URL:-http://localhost}
API_URL=${API_URL:-$BASE_URL/api}
EXPECTED_VERSION=${EXPECTED_VERSION:-$(cat VERSION 2>/dev/null || true)}
EXPECTED_SCHEMA_GENERATION=${EXPECTED_SCHEMA_GENERATION:-40}

fetch_ok() {
  name=$1; url=$2; out=$3
  code=$(curl -sS -o "$out" -w '%{http_code}' "$url" || true)
  if [ "$code" -lt 200 ] || [ "$code" -ge 300 ]; then
    echo "FAIL $name HTTP $code"; cat "$out" 2>/dev/null || true; exit 1
  fi
  echo "PASS $name HTTP $code"
}
fetch_ok frontend "$BASE_URL/" /tmp/admk-frontend
fetch_ok release "$BASE_URL/release.json" /tmp/admk-release
fetch_ok api-health "$API_URL/health" /tmp/admk-health
fetch_ok api-ready "$API_URL/ready" /tmp/admk-ready
fetch_ok api-metrics "$API_URL/metrics" /tmp/admk-metrics
[ -n "$EXPECTED_VERSION" ] && grep -F "\"version\":\"$EXPECTED_VERSION\"" /tmp/admk-ready >/dev/null
grep -F "\"schemaGeneration\":$EXPECTED_SCHEMA_GENERATION" /tmp/admk-ready >/dev/null
[ -n "$EXPECTED_VERSION" ] && grep -F "\"version\": \"$EXPECTED_VERSION\"" /tmp/admk-release >/dev/null
grep -F "\"schemaGeneration\": $EXPECTED_SCHEMA_GENERATION" /tmp/admk-release >/dev/null
echo "deployment smoke: PASS version=${EXPECTED_VERSION:-unknown} schema=$EXPECTED_SCHEMA_GENERATION"
