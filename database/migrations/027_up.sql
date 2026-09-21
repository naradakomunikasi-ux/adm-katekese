BEGIN;
UPDATE announcements SET audience='ALL' WHERE upper(audience) NOT IN ('ALL','PESERTA','KATEKIS','PASTOR','ADMIN');
UPDATE announcements SET audience=upper(audience);
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_audience_check CHECK (audience IN ('ALL','PESERTA','KATEKIS','PASTOR','ADMIN'));
CREATE INDEX IF NOT EXISTS idx_announcements_public_audience_publish ON announcements(audience,status,publish_at DESC);
COMMIT;
