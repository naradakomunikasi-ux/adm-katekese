-- RC65: separate participant journey status from pastoral status on canonical enrollment.
ALTER TABLE participant_programs ADD COLUMN IF NOT EXISTS current_journey_stage_key TEXT;
ALTER TABLE participant_programs ADD COLUMN IF NOT EXISTS pastoral_status TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE participant_programs DROP CONSTRAINT IF EXISTS participant_programs_pastoral_status_check;
ALTER TABLE participant_programs ADD CONSTRAINT participant_programs_pastoral_status_check
CHECK (pastoral_status IN ('NORMAL','NEEDS_ATTENTION','NEEDS_ACCOMPANIMENT','PASTORAL_REVIEW','APPROVED'));
CREATE INDEX IF NOT EXISTS idx_participant_programs_pastoral_status ON participant_programs(program_id,pastoral_status,status);

INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,43,'1.0.0-rc65',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
