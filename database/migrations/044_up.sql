CREATE TABLE IF NOT EXISTS attendance_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL DEFAULT 'SELF_CHECK_IN' CHECK (signal_type IN ('SELF_CHECK_IN','QR_CHECK_IN')),
  signal_status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (signal_status IN ('RECEIVED','REVIEWED')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(meeting_id, participant_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_signals_meeting_status ON attendance_signals(meeting_id, signal_status, received_at);
