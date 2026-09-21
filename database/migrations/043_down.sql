INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,42,'1.0.0-rc64',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
DROP INDEX IF EXISTS idx_participant_programs_pastoral_status;
ALTER TABLE participant_programs DROP CONSTRAINT IF EXISTS participant_programs_pastoral_status_check;
ALTER TABLE participant_programs DROP COLUMN IF EXISTS pastoral_status;
ALTER TABLE participant_programs DROP COLUMN IF EXISTS current_journey_stage_key;
