ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS ingestion_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ;

ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS embedding_model TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_knowledge_documents_content_hash
  ON knowledge_documents(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_content_hash
  ON knowledge_chunks(content_hash) WHERE content_hash IS NOT NULL;

INSERT INTO permissions(code,description)
VALUES ('knowledge:write','Manage and ingest knowledge base documents')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE p.code='knowledge:write' AND r.code IN ('SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM')
ON CONFLICT DO NOTHING;
