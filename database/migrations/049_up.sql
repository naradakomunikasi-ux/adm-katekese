CREATE TABLE IF NOT EXISTS public_registration_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK(char_length(trim(full_name)) BETWEEN 3 AND 160),
  email TEXT NOT NULL CHECK(char_length(email) BETWEEN 5 AND 254),
  phone TEXT NOT NULL CHECK(char_length(phone) BETWEEN 8 AND 30),
  notes TEXT CHECK(notes IS NULL OR char_length(notes)<=1000),
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK(status IN ('SUBMITTED','UNDER_REVIEW','ACCEPTED','REVISION_REQUIRED','DECLINED')),
  source_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_public_registration_review ON public_registration_submissions(status,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_public_registration_open_email_program ON public_registration_submissions(program_id,lower(email)) WHERE status IN ('SUBMITTED','UNDER_REVIEW','REVISION_REQUIRED');

CREATE TABLE IF NOT EXISTS communication_campaign_recipients (
  campaign_id UUID NOT NULL REFERENCES communication_campaigns(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(delivery_status IN ('PENDING','QUEUED','DELIVERED','FAILED','CANCELLED')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(campaign_id,participant_id)
);
CREATE INDEX IF NOT EXISTS idx_communication_recipient_history ON communication_campaign_recipients(participant_id,created_at DESC);
