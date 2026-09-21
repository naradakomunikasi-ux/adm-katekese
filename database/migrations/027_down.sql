BEGIN;
DROP INDEX IF EXISTS idx_announcements_public_audience_publish;
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
COMMIT;
