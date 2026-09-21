BEGIN;
ALTER TABLE pastoral_notes ADD COLUMN IF NOT EXISTS author_role TEXT;
UPDATE pastoral_notes pn
SET author_role = role_pick.code
FROM LATERAL (
  SELECT r.code
  FROM user_roles ur
  JOIN roles r ON r.id=ur.role_id
  WHERE ur.user_id=pn.author_user_id
  ORDER BY CASE r.code WHEN 'PASTOR' THEN 0 WHEN 'SUPER_ADMIN' THEN 1 WHEN 'ADMIN_KATEKESE' THEN 2 ELSE 9 END
  LIMIT 1
) role_pick
WHERE pn.author_role IS NULL;

ALTER TABLE pastoral_notes DROP CONSTRAINT IF EXISTS pastoral_notes_author_role_check;
ALTER TABLE pastoral_notes ADD CONSTRAINT pastoral_notes_author_role_check
CHECK(author_role IS NULL OR author_role IN('SUPER_ADMIN','ADMIN_KATEKESE','PASTOR'));

CREATE OR REPLACE FUNCTION enforce_pastoral_note_visibility() RETURNS trigger AS $$
BEGIN
  IF NEW.author_role IS NULL THEN
    RAISE EXCEPTION 'PASTORAL_NOTE_AUTHOR_ROLE_REQUIRED';
  END IF;
  IF NEW.author_role='ADMIN_KATEKESE' AND NEW.visibility='PASTOR_ONLY' THEN
    RAISE EXCEPTION 'PASTORAL_NOTE_VISIBILITY_DENIED';
  END IF;
  IF NEW.author_role NOT IN('SUPER_ADMIN','ADMIN_KATEKESE','PASTOR') THEN
    RAISE EXCEPTION 'PASTORAL_NOTE_AUTHOR_ROLE_DENIED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_pastoral_note_visibility ON pastoral_notes;
CREATE TRIGGER trg_pastoral_note_visibility BEFORE INSERT OR UPDATE OF visibility,author_role ON pastoral_notes
FOR EACH ROW EXECUTE FUNCTION enforce_pastoral_note_visibility();
CREATE INDEX IF NOT EXISTS idx_pastoral_notes_participant_visibility ON pastoral_notes(participant_id,visibility,created_at DESC);
COMMIT;
