UPDATE library_files SET access_role='PESERTA' WHERE access_role IS NULL OR access_role NOT IN ('PUBLIC','PESERTA','KATEKIS','ADMIN','PASTOR');
ALTER TABLE library_files ALTER COLUMN access_role SET DEFAULT 'PESERTA';
ALTER TABLE library_files ALTER COLUMN access_role SET NOT NULL;
ALTER TABLE library_files DROP CONSTRAINT IF EXISTS library_files_access_role_check;
ALTER TABLE library_files ADD CONSTRAINT library_files_access_role_check CHECK(access_role IN ('PUBLIC','PESERTA','KATEKIS','ADMIN','PASTOR'));
CREATE INDEX IF NOT EXISTS idx_library_role_status_created ON library_files(access_role,status,created_at DESC);
