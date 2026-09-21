BEGIN;
DROP INDEX IF EXISTS idx_pastoral_notes_participant_visibility;
DROP TRIGGER IF EXISTS trg_pastoral_note_visibility ON pastoral_notes;
DROP FUNCTION IF EXISTS enforce_pastoral_note_visibility();
ALTER TABLE pastoral_notes DROP CONSTRAINT IF EXISTS pastoral_notes_author_role_check;
ALTER TABLE pastoral_notes DROP COLUMN IF EXISTS author_role;
COMMIT;
