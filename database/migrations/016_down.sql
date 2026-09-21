BEGIN;
DROP INDEX IF EXISTS idx_library_public_catalog;
ALTER TABLE library_files DROP CONSTRAINT IF EXISTS library_files_status_check;
COMMIT;
