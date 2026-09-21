ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
UPDATE notifications SET read_at=COALESCE(read_at,sent_at,created_at) WHERE status='READ' AND read_at IS NULL;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_read_channel_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_read_channel_check CHECK (status <> 'READ' OR channel='IN_APP');
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_read_at_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_read_at_check CHECK ((status='READ' AND read_at IS NOT NULL) OR (status<>'READ' AND read_at IS NULL));
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created ON notifications(user_id,created_at DESC) WHERE channel='IN_APP' AND read_at IS NULL;
