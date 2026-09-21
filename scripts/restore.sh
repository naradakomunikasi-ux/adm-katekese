#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
FILE=${1:?Usage: scripts/restore.sh <backup.dump>}
[ -f "$FILE" ] || { echo "Backup file not found: $FILE"; exit 1; }
[ -f "$FILE.sha256" ] && sha256sum -c "$FILE.sha256"
pg_restore --list "$FILE" >/dev/null
if [ "${NODE_ENV:-}" = "production" ] && [ "${RESTORE_CONFIRM:-}" != "RESTORE_ADM_KATEKESE" ]; then
  echo "Production restore blocked. Set RESTORE_CONFIRM=RESTORE_ADM_KATEKESE after verifying target and backup." >&2
  exit 2
fi
pg_restore --exit-on-error --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" "$FILE"
echo "Restore completed: $FILE"
