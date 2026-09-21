CREATE TABLE IF NOT EXISTS communication_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES communication_campaigns(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK(channel IN ('IN_APP','EMAIL','WHATSAPP','PUSH')),
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED','PROCESSING','DELIVERED','FAILED','CANCELLED')),
  attempt_no INTEGER NOT NULL DEFAULT 1 CHECK(attempt_no BETWEEN 1 AND 10),
  provider_reference TEXT,
  error_code TEXT,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id,participant_id,channel,attempt_no)
);
CREATE INDEX IF NOT EXISTS idx_communication_delivery_queue ON communication_delivery_attempts(status,queued_at);
CREATE INDEX IF NOT EXISTS idx_communication_delivery_campaign ON communication_delivery_attempts(campaign_id,status);
