-- Reverse RC35 permission-catalog alignment without touching permissions introduced earlier.
DELETE FROM role_permissions rp
USING roles r, permissions p
WHERE rp.role_id=r.id AND rp.permission_id=p.id AND (
 (r.code='ADMIN_KATEKESE' AND p.code IN ('ai:settings:read','ai:settings:write')) OR
 (r.code='KATEKIS' AND p.code IN ('participant:read_assigned','meeting:read','material:read')) OR
 (r.code='PASTOR' AND p.code IN ('interview:write')) OR
 (r.code='PESERTA' AND p.code IN ('self:read','self:write','schedule:read'))
);

DELETE FROM permissions p
WHERE p.code IN ('ai:settings:read','ai:settings:write','interview:write','material:read','meeting:read','participant:read_assigned','schedule:read','self:read','self:write')
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.permission_id=p.id);
