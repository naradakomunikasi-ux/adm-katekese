-- RC47 document requirement/enrollment invariant.
CREATE OR REPLACE FUNCTION enforce_document_requirement_enrollment() RETURNS trigger AS $$
DECLARE requirement_program UUID;
BEGIN
  IF NEW.requirement_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT program_id INTO requirement_program FROM document_requirements WHERE id=NEW.requirement_id;
  IF requirement_program IS NULL OR NOT EXISTS (
    SELECT 1 FROM participant_programs pp
    WHERE pp.participant_id=NEW.participant_id AND pp.program_id=requirement_program AND pp.status<>'CANCELLED'
  ) THEN
    RAISE EXCEPTION 'DOCUMENT_REQUIREMENT_ENROLLMENT_INVARIANT' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_document_requirement_enrollment ON documents;
CREATE TRIGGER trg_document_requirement_enrollment BEFORE INSERT OR UPDATE OF participant_id,requirement_id ON documents FOR EACH ROW EXECUTE FUNCTION enforce_document_requirement_enrollment();
CREATE INDEX IF NOT EXISTS idx_documents_participant_requirement_status ON documents(participant_id,requirement_id,verification_status,created_at DESC);
