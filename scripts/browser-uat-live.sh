#!/bin/sh
set -eu
BASE_URL=${BASE_URL:-http://localhost}
OUT_DIR=${OUT_DIR:-evidence/browser-uat-live}
mkdir -p "$OUT_DIR"
BROWSER=""
for candidate in google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then BROWSER=$(command -v "$candidate"); break; fi
done
if [ -z "$BROWSER" ]; then echo "ERROR: Chrome/Chromium not available"; exit 2; fi
run_viewport() {
  label=$1; size=$2
  "$BROWSER" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size="$size"     --virtual-time-budget=6000 --screenshot="$OUT_DIR/$label.png" --dump-dom "$BASE_URL/" > "$OUT_DIR/$label.html" 2>"$OUT_DIR/$label.browser.log"
  grep -Eiq 'ADM[[:space:]]+Katekese|Katekese' "$OUT_DIR/$label.html" || { echo "FAIL $label: app identity not rendered"; exit 1; }
  ! grep -Eiq 'application error|uncaught exception|internal server error' "$OUT_DIR/$label.html" || { echo "FAIL $label: error page rendered"; exit 1; }
  test -s "$OUT_DIR/$label.png"
  echo "PASS browser $label ($size)"
}
run_viewport desktop 1440,900
run_viewport mobile 390,844
curl -fsS "$BASE_URL/release.json" > "$OUT_DIR/release.json"
curl -fsS "$BASE_URL/api/ready" > "$OUT_DIR/ready.json"
echo "browser UAT live: PASS"
