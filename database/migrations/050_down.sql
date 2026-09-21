DROP INDEX IF EXISTS uq_public_registration_participant;
ALTER TABLE public_registration_submissions DROP CONSTRAINT IF EXISTS public_registration_review_notes_check;
ALTER TABLE public_registration_submissions
  DROP COLUMN IF EXISTS participant_id,
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS reviewed_by,
  DROP COLUMN IF EXISTS review_notes;
