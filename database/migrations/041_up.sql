ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_lower ON users(lower(username)) WHERE username IS NOT NULL;

INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,41,'1.0.0-rc62',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
