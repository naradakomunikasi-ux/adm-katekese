CREATE TABLE IF NOT EXISTS library_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT,
  file_name TEXT NOT NULL, file_extension TEXT NOT NULL, mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK(size_bytes > 0 AND size_bytes <= 15728640),
  sha256 TEXT NOT NULL, content BYTEA NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ARCHIVED')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_library_files_sha256 ON library_files(sha256) WHERE status='ACTIVE';
CREATE INDEX IF NOT EXISTS idx_library_files_status_created ON library_files(status,created_at DESC);
INSERT INTO permissions(code,description) VALUES ('library:read','Read and download library files'),('library:write','Upload and manage library files') ON CONFLICT(code) DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE (p.code='library:read' AND r.code IN ('SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','PASTOR','PESERTA')) OR (p.code='library:write' AND r.code IN ('SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM')) ON CONFLICT DO NOTHING;
