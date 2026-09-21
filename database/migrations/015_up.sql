ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoke_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_certificates_program_status ON certificates(program_id,status);
