-- RC51 announcement schedule integrity
UPDATE announcements SET status='DRAFT' WHERE status='SCHEDULED' AND publish_at IS NULL;
UPDATE announcements SET expires_at=NULL WHERE expires_at IS NOT NULL AND publish_at IS NOT NULL AND expires_at<=publish_at;
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_schedule_publish_at_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_schedule_publish_at_check CHECK (status <> 'SCHEDULED' OR publish_at IS NOT NULL);
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_expiry_after_publish_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_expiry_after_publish_check CHECK (expires_at IS NULL OR publish_at IS NULL OR expires_at > publish_at);
CREATE INDEX IF NOT EXISTS idx_announcements_due_schedule ON announcements(status,publish_at) WHERE status='SCHEDULED';
