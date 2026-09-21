ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS previous_hash CHAR(64);
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS event_hash CHAR(64);
CREATE INDEX IF NOT EXISTS idx_audit_events_event_hash ON audit_events(event_hash) WHERE event_hash IS NOT NULL;
COMMENT ON COLUMN audit_events.event_hash IS 'SHA-256 tamper-evident chain hash for newly written audit events';
COMMENT ON COLUMN audit_events.previous_hash IS 'Hash of prior audit event in append chain';
