ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_extension TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sha256 TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content BYTEA;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_binary_all_or_none_check;
ALTER TABLE documents ADD CONSTRAINT documents_binary_all_or_none_check CHECK (
  (file_name IS NULL AND file_extension IS NULL AND mime_type IS NULL AND size_bytes IS NULL AND sha256 IS NULL AND content IS NULL)
  OR
  (file_name IS NOT NULL AND file_extension IS NOT NULL AND mime_type IS NOT NULL AND size_bytes > 0 AND size_bytes <= 62914560 AND sha256 IS NOT NULL AND content IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_documents_participant_requirement_created ON documents(participant_id,requirement_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_documents_participant_requirement_sha256 ON documents(participant_id,requirement_id,sha256) WHERE sha256 IS NOT NULL;
