BEGIN;
DROP INDEX IF EXISTS uq_certificates_participant_program_type;
-- Rollback is safe only when cross-program duplicates have not yet been created.
ALTER TABLE certificates
  ADD CONSTRAINT certificates_participant_id_certificate_type_key UNIQUE(participant_id, certificate_type);
COMMIT;
