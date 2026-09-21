BEGIN;
CREATE TABLE IF NOT EXISTS runtime_schema_contract (
  id smallint PRIMARY KEY CHECK (id = 1),
  schema_generation integer NOT NULL CHECK (schema_generation > 0),
  release_floor text NOT NULL CHECK (release_floor ~ '^1\.0\.0-rc[0-9]+$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,40,'1.0.0-rc61',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
COMMIT;
