DROP INDEX IF EXISTS idx_library_files_filters;
DROP INDEX IF EXISTS idx_library_file_programs_program;
DROP TABLE IF EXISTS library_file_programs;
ALTER TABLE library_files DROP COLUMN IF EXISTS program_scope;
