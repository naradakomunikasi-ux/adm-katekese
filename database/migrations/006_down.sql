DROP INDEX IF EXISTS idx_audit_events_event_hash;
ALTER TABLE audit_events DROP COLUMN IF EXISTS event_hash;
ALTER TABLE audit_events DROP COLUMN IF EXISTS previous_hash;
