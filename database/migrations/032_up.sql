-- RC53: canonical enrollment lifecycle integrity.
CREATE OR REPLACE FUNCTION enforce_participant_program_enrollment()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  batch_program UUID;
  batch_capacity INTEGER;
  batch_status TEXT;
  enrolled_count INTEGER;
BEGIN
  IF NEW.status='COMPLETED' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  ELSE
    NEW.completed_at := NULL;
  END IF;

  IF NEW.batch_id IS NOT NULL THEN
    SELECT program_id,capacity,status INTO batch_program,batch_capacity,batch_status
      FROM batches WHERE id=NEW.batch_id FOR UPDATE;
    IF batch_program IS NULL OR batch_program<>NEW.program_id THEN
      RAISE EXCEPTION 'ENROLLMENT_BATCH_PROGRAM_MISMATCH' USING ERRCODE='23514';
    END IF;
    IF NEW.status IN ('REGISTERED','ACTIVE') AND batch_status IN ('CLOSED','ARCHIVED') THEN
      RAISE EXCEPTION 'ENROLLMENT_BATCH_CLOSED' USING ERRCODE='23514';
    END IF;
    IF NEW.status IN ('REGISTERED','ACTIVE') AND batch_capacity IS NOT NULL THEN
      SELECT count(*) INTO enrolled_count FROM participant_programs pp
       WHERE pp.batch_id=NEW.batch_id AND pp.status IN ('REGISTERED','ACTIVE')
         AND pp.participant_id<>NEW.participant_id;
      IF enrolled_count>=batch_capacity THEN
        RAISE EXCEPTION 'ENROLLMENT_BATCH_CAPACITY_EXCEEDED' USING ERRCODE='23514';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_participant_program_enrollment ON participant_programs;
CREATE TRIGGER trg_participant_program_enrollment
BEFORE INSERT OR UPDATE OF program_id,batch_id,status ON participant_programs
FOR EACH ROW EXECUTE FUNCTION enforce_participant_program_enrollment();

CREATE INDEX IF NOT EXISTS idx_participant_programs_program_status_enrolled
  ON participant_programs(program_id,status,enrolled_at DESC);
