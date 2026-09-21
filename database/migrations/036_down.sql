DROP INDEX IF EXISTS idx_notifications_user_unread_created;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_read_at_check;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_read_channel_check;
ALTER TABLE notifications DROP COLUMN IF EXISTS read_at;
