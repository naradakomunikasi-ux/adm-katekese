DROP INDEX IF EXISTS idx_library_role_status_created;
ALTER TABLE library_files DROP CONSTRAINT IF EXISTS library_files_access_role_check;
ALTER TABLE library_files ADD CONSTRAINT library_files_access_role_check CHECK(access_role IN ('PUBLIC','PESERTA','KATEKIS','ADMIN','PASTOR'));
