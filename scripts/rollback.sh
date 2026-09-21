#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"

for file in $(ls database/migrations/*_down.sql | sort -r); do
  down_name=$(basename "$file")
  up_name=$(printf '%s' "$down_name" | sed 's/_down\.sql$/_up.sql/')
  applied=$(psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1 -v migration_name="$up_name" -c "SELECT 1 FROM schema_migrations WHERE migration_name = :'migration_name'" 2>/dev/null || true)
  if [ "$applied" != "1" ]; then
    echo "Skipping unapplied $down_name"
    continue
  fi
  echo "Rolling back $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v migration_name="$up_name" -c "DELETE FROM schema_migrations WHERE migration_name = :'migration_name'"
done
