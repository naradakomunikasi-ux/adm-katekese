ALTER TABLE public_registration_submissions
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE public_registration_submissions DROP CONSTRAINT IF EXISTS public_registration_review_notes_check;
ALTER TABLE public_registration_submissions ADD CONSTRAINT public_registration_review_notes_check
  CHECK(review_notes IS NULL OR char_length(review_notes)<=1000);

CREATE UNIQUE INDEX IF NOT EXISTS uq_public_registration_participant
  ON public_registration_submissions(participant_id) WHERE participant_id IS NOT NULL;
