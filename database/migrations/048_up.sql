ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS preferred_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_preferred_name_check;
ALTER TABLE participants ADD CONSTRAINT participants_preferred_name_check
  CHECK(preferred_name IS NULL OR char_length(trim(preferred_name)) BETWEEN 1 AND 100);
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_profile_photo_url_check;
ALTER TABLE participants ADD CONSTRAINT participants_profile_photo_url_check
  CHECK(profile_photo_url IS NULL OR (char_length(profile_photo_url)<=500 AND profile_photo_url ~ '^https://'));
