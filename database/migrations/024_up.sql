BEGIN;
-- RC45: certificate identity is participant + program + certificate type.
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_participant_id_certificate_type_key;
DROP INDEX IF EXISTS uq_certificates_participant_program_type;
CREATE UNIQUE INDEX uq_certificates_participant_program_type
  ON certificates(participant_id, program_id, certificate_type);
COMMIT;
