-- RC55 certificate scoped-read support
CREATE INDEX IF NOT EXISTS idx_certificates_participant_status_created ON certificates(participant_id, status, created_at DESC);
