DELETE FROM role_permissions rp USING roles r, permissions p
WHERE rp.role_id=r.id AND rp.permission_id=p.id AND p.code IN ('library:read','library:write');
DELETE FROM permissions WHERE code IN ('library:read','library:write');
DROP INDEX IF EXISTS idx_library_files_status_created;
DROP INDEX IF EXISTS uq_library_files_sha256;
DROP TABLE IF EXISTS library_files;
