BEGIN;
CREATE OR REPLACE FUNCTION enforce_approval_enrollment() RETURNS trigger AS $$
BEGIN
  IF NEW.program_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM participant_programs pp
    WHERE pp.participant_id=NEW.participant_id
      AND pp.program_id=NEW.program_id
      AND pp.status<>'CANCELLED'
  ) THEN
    RAISE EXCEPTION 'APPROVAL_ENROLLMENT_INVARIANT' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_approval_enrollment ON approvals;
CREATE TRIGGER trg_approval_enrollment
BEFORE INSERT OR UPDATE OF participant_id,program_id ON approvals
FOR EACH ROW EXECUTE FUNCTION enforce_approval_enrollment();
CREATE INDEX IF NOT EXISTS idx_approvals_participant_program_status ON approvals(participant_id,program_id,status,created_at DESC);
COMMIT;
