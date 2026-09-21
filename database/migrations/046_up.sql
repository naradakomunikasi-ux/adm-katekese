CREATE TABLE IF NOT EXISTS communication_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 4000),
  audience_type TEXT NOT NULL CHECK (audience_type IN ('ALL','ROLE','PROGRAM','PARTICIPANT')),
  audience_value TEXT,
  channels TEXT[] NOT NULL DEFAULT ARRAY['IN_APP']::text[],
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SCHEDULED','SENDING','SENT','CANCELLED')),
  scheduled_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (channels <@ ARRAY['IN_APP','EMAIL','WHATSAPP','PUSH']::text[]),
  CHECK (cardinality(channels) > 0),
  CHECK (status <> 'SCHEDULED' OR scheduled_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_status_schedule ON communication_campaigns(status,scheduled_at);
