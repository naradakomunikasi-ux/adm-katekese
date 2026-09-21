ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_profile_photo_url_check;
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_preferred_name_check;
ALTER TABLE participants DROP COLUMN IF EXISTS profile_photo_url;
ALTER TABLE participants DROP COLUMN IF EXISTS preferred_name;
