BEGIN;
CREATE OR REPLACE FUNCTION enforce_payment_enrollment() RETURNS trigger AS $$
BEGIN
  IF NEW.program_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM participant_programs pp
    WHERE pp.participant_id=NEW.participant_id
      AND pp.program_id=NEW.program_id
      AND pp.status<>'CANCELLED'
  ) THEN
    RAISE EXCEPTION 'PAYMENT_ENROLLMENT_INVARIANT' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_payment_enrollment ON payments;
CREATE TRIGGER trg_payment_enrollment
BEFORE INSERT OR UPDATE OF participant_id,program_id ON payments
FOR EACH ROW EXECUTE FUNCTION enforce_payment_enrollment();
CREATE INDEX IF NOT EXISTS idx_payments_participant_program_status ON payments(participant_id,program_id,status,created_at DESC);
COMMIT;
