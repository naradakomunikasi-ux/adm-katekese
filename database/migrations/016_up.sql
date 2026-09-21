BEGIN;
ALTER TABLE library_files DROP CONSTRAINT IF EXISTS library_files_status_check;
ALTER TABLE library_files ADD CONSTRAINT library_files_status_check CHECK(status IN('DRAFT','PUBLISHED','ARCHIVED'));
CREATE INDEX IF NOT EXISTS idx_library_public_catalog ON library_files(status,access_role,published_at DESC) WHERE status='PUBLISHED';
COMMIT;
