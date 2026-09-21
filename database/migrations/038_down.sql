DROP INDEX IF EXISTS uq_documents_participant_requirement_sha256;
DROP INDEX IF EXISTS idx_documents_participant_requirement_created;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_binary_all_or_none_check;
ALTER TABLE documents DROP COLUMN IF EXISTS content;
ALTER TABLE documents DROP COLUMN IF EXISTS sha256;
ALTER TABLE documents DROP COLUMN IF EXISTS size_bytes;
ALTER TABLE documents DROP COLUMN IF EXISTS mime_type;
ALTER TABLE documents DROP COLUMN IF EXISTS file_extension;
ALTER TABLE documents DROP COLUMN IF EXISTS file_name;
