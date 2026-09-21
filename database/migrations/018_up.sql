-- RC35: align database permission catalog with application RBAC vocabulary.
INSERT INTO permissions(code,description) VALUES
 ('ai:settings:read','Read AI and integration settings'),
 ('ai:settings:write','Update AI and integration settings'),
 ('interview:write','Create and update participant interview records'),
 ('material:read','Read catechesis materials'),
 ('meeting:read','Read assigned meeting details'),
 ('participant:read_assigned','Read participants assigned to the current catechist'),
 ('schedule:read','Read own program and meeting schedule'),
 ('self:read','Read own participant profile'),
 ('self:write','Update allowed own participant profile fields')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON
 (r.code='ADMIN_KATEKESE' AND p.code IN ('ai:settings:read','ai:settings:write')) OR
 (r.code='KATEKIS' AND p.code IN ('participant:read_assigned','meeting:read','material:read')) OR
 (r.code='PASTOR' AND p.code IN ('interview:write')) OR
 (r.code='PESERTA' AND p.code IN ('self:read','self:write','schedule:read'))
ON CONFLICT DO NOTHING;
