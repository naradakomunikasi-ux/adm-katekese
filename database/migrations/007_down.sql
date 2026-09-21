DROP INDEX IF EXISTS idx_knowledge_scope_status_updated;
ALTER TABLE knowledge_documents DROP CONSTRAINT IF EXISTS knowledge_documents_scope_check;
