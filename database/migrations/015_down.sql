DROP INDEX IF EXISTS idx_certificates_program_status;
ALTER TABLE certificates DROP COLUMN IF EXISTS revoke_reason;
ALTER TABLE certificates DROP COLUMN IF EXISTS revoked_at;
ALTER TABLE certificates DROP COLUMN IF EXISTS revoked_by;
ALTER TABLE certificates DROP COLUMN IF EXISTS issued_by;
