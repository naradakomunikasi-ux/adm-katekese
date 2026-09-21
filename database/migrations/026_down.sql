DROP INDEX IF EXISTS idx_documents_participant_requirement_status;
DROP TRIGGER IF EXISTS trg_document_requirement_enrollment ON documents;
DROP FUNCTION IF EXISTS enforce_document_requirement_enrollment();
