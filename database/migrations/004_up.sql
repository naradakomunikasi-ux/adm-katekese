CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS participant_programs (
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('REGISTERED','ACTIVE','COMPLETED','CANCELLED')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY(participant_id, program_id)
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL CHECK(chunk_index >= 0),
  content TEXT NOT NULL,
  embedding JSONB,
  token_count INTEGER CHECK(token_count IS NULL OR token_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_jti TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_participant_programs_batch ON participant_programs(batch_id,status);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON knowledge_chunks(document_id,chunk_index);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active ON auth_sessions(user_id,expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id,expires_at);

INSERT INTO permissions(code,description) VALUES
 ('participant:read','Read participant records'),
 ('participant:write','Create and update participant records'),
 ('document:verify','Verify participant documents'),
 ('document:upload','Upload own documents'),
 ('payment:verify','Verify payments'),
 ('attendance:write','Record attendance'),
 ('approval:prepare','Prepare approval'),
 ('approval:decide','Decide pastoral approval'),
 ('certificate:approve','Approve certificates'),
 ('task:write','Manage tasks'),
 ('report:read','Read reports'),
 ('knowledge:read','Read knowledge base'),
 ('knowledge:write','Manage knowledge base'),
 ('user:admin','Manage users and roles')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON
 (r.code='ADMIN_KATEKESE' AND p.code IN ('participant:read','participant:write','document:verify','payment:verify','approval:prepare','task:write','report:read','knowledge:read')) OR
 (r.code='ADMIN_PROGRAM' AND p.code IN ('participant:read','participant:write','document:verify','attendance:write','task:write','knowledge:read')) OR
 (r.code='KATEKIS' AND p.code IN ('attendance:write','knowledge:read')) OR
 (r.code='PASTOR' AND p.code IN ('participant:read','approval:decide','certificate:approve','knowledge:read')) OR
 (r.code='PESERTA' AND p.code IN ('document:upload'))
ON CONFLICT DO NOTHING;
