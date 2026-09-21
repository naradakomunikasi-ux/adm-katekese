ALTER TABLE knowledge_documents
  DROP CONSTRAINT IF EXISTS knowledge_documents_scope_check;
ALTER TABLE knowledge_documents
  ADD CONSTRAINT knowledge_documents_scope_check
  CHECK (scope IN ('PUBLIC','PARTICIPANT','PASTORAL','INTERNAL')) NOT VALID;
CREATE INDEX IF NOT EXISTS idx_knowledge_scope_status_updated
  ON knowledge_documents(scope,status,updated_at DESC);
