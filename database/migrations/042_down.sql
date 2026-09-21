DROP TABLE IF EXISTS program_journey_stages;
ALTER TABLE programs DROP COLUMN IF EXISTS program_type_id;
DROP TABLE IF EXISTS program_types;
UPDATE runtime_schema_contract SET schema_generation=41,release_floor='1.0.0-rc63',updated_at=now() WHERE id=1;
