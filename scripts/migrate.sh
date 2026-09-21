#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_name text PRIMARY KEY,
  checksum_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

for file in database/migrations/*_up.sql; do
  name=$(basename "$file")
  checksum=$(sha256sum "$file" | awk '{print $1}')
  stored=$(psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1 -v migration_name="$name" -c "SELECT checksum_sha256 FROM schema_migrations WHERE migration_name = :'migration_name'" || true)
  if [ -n "$stored" ]; then
    if [ "$stored" != "$checksum" ]; then
      echo "Migration drift detected for $name" >&2
      exit 2
    fi
    echo "Skipping already applied $name"
    continue
  fi
  echo "Applying $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v migration_name="$name" -v checksum="$checksum" -c "INSERT INTO schema_migrations(migration_name,checksum_sha256) VALUES (:'migration_name', :'checksum')"
done
