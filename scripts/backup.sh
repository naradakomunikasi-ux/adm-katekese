#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR=${BACKUP_DIR:-./backups}
mkdir -p "$BACKUP_DIR"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="$BACKUP_DIR/adm_katekese_$STAMP.dump"
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$FILE"
pg_restore --list "$FILE" >/dev/null
sha256sum "$FILE" > "$FILE.sha256"
echo "$FILE"
