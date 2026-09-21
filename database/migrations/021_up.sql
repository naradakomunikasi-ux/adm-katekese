CREATE OR REPLACE FUNCTION enforce_attendance_batch_enrollment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM meetings m
    JOIN participant_programs pp
      ON pp.batch_id = m.batch_id
     AND pp.participant_id = NEW.participant_id
     AND pp.status <> 'CANCELLED'
    WHERE m.id = NEW.meeting_id
  ) THEN
    RAISE EXCEPTION 'participant is not actively enrolled in meeting batch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendance_batch_enrollment ON attendance;
CREATE TRIGGER trg_attendance_batch_enrollment
BEFORE INSERT OR UPDATE OF meeting_id, participant_id ON attendance
FOR EACH ROW EXECUTE FUNCTION enforce_attendance_batch_enrollment();
