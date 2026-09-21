DELETE FROM role_permissions rp USING roles r, permissions p
WHERE rp.role_id=r.id AND rp.permission_id=p.id AND p.code='knowledge:write' AND r.code IN ('SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM');
DELETE FROM permissions WHERE code='knowledge:write';
DROP INDEX IF EXISTS idx_knowledge_chunks_content_hash;
DROP INDEX IF EXISTS uq_knowledge_documents_content_hash;
ALTER TABLE knowledge_chunks DROP COLUMN IF EXISTS embedding_model, DROP COLUMN IF EXISTS content_hash;
ALTER TABLE knowledge_documents DROP COLUMN IF EXISTS indexed_at, DROP COLUMN IF EXISTS ingestion_fingerprint, DROP COLUMN IF EXISTS content_hash;
