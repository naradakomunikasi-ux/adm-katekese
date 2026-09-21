ALTER TABLE library_files
  ADD COLUMN IF NOT EXISTS program_scope TEXT NOT NULL DEFAULT 'ALL'
  CHECK(program_scope IN ('ALL','SELECTED_PROGRAMS'));

CREATE TABLE IF NOT EXISTS library_file_programs (
  library_file_id UUID NOT NULL REFERENCES library_files(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(library_file_id,program_id)
);

CREATE INDEX IF NOT EXISTS idx_library_file_programs_program
  ON library_file_programs(program_id,library_file_id);
CREATE INDEX IF NOT EXISTS idx_library_files_filters
  ON library_files(status,access_role,category,program_scope,created_at DESC);
