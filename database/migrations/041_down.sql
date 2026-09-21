UPDATE runtime_schema_contract SET schema_generation=40, release_floor='1.0.0-rc61', updated_at=now() WHERE id=1;
DROP INDEX IF EXISTS uq_users_username_lower;
ALTER TABLE users DROP COLUMN IF EXISTS username;
