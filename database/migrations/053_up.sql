CREATE TABLE IF NOT EXISTS ai_provider_connections (
  code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('OLLAMA','OPENAI_COMPATIBLE','MISTRAL','QWEN','DETERMINISTIC')),
  base_url TEXT,
  api_key_enc TEXT,
  default_model_id TEXT,
  privacy_class TEXT NOT NULL DEFAULT 'INTERNAL' CHECK (privacy_class IN ('LOCAL','PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED','CLOUD')),
  status TEXT NOT NULL DEFAULT 'CONFIGURED' CHECK (status IN ('DISABLED','CONFIGURED','QUALIFIED','DEGRADED','DEPRECATED')),
  last_test_status TEXT CHECK (last_test_status IN ('READY','FAILED','NOT_TESTED')),
  last_tested_at TIMESTAMPTZ,
  last_latency_ms INTEGER CHECK (last_latency_ms IS NULL OR last_latency_ms >= 0),
  last_test_message TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO ai_provider_connections(code,display_name,provider_type,base_url,default_model_id,privacy_class,status,last_test_status) VALUES
 ('ollama-cloud','Ollama Cloud','OLLAMA','https://ollama.com/api','qwen3:14b','INTERNAL','CONFIGURED','NOT_TESTED'),
 ('ollama-local','Ollama Local','OLLAMA','http://localhost:11434/api','qwen3:8b','RESTRICTED','CONFIGURED','NOT_TESTED'),
 ('mistral-compatible','Mistral Compatible','OPENAI_COMPATIBLE',NULL,'mistral-small3.2','INTERNAL','DISABLED','NOT_TESTED'),
 ('qwen-compatible','Qwen Compatible','OPENAI_COMPATIBLE',NULL,'qwen3','INTERNAL','DISABLED','NOT_TESTED'),
 ('deterministic-core','Deterministic Core','DETERMINISTIC',NULL,'rules-v1','RESTRICTED','QUALIFIED','READY')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_capabilities(code,dna,model_group,privacy_class,deterministic_first,human_authority_required,status) VALUES
 ('capture.ingest','CAPTURE','G1','INTERNAL',true,false,'QUALIFIED'),
 ('radar.attention','RADAR','G2','CONFIDENTIAL',true,true,'QUALIFIED'),
 ('companion.assist','COMPANION','G3','CONFIDENTIAL',false,true,'QUALIFIED'),
 ('generate.draft','GENERATE','G4','INTERNAL',false,true,'QUALIFIED'),
 ('engineering.orchestrate','ENGINEERING','G7','INTERNAL',true,true,'QUALIFIED')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_model_engines(code,display_name,provider,model_id,dna,model_group,engine_role,privacy_class,status) VALUES
 ('classnote-capture-g1','ClassNote Capture · G1','CLASSNOTE','qwen3:8b','CAPTURE','G1','CLASSNOTE_MODEL','INTERNAL','QUALIFIED'),
 ('classnote-radar-g2','ClassNote Radar · G2','CLASSNOTE','qwen3:14b','RADAR','G2','CLASSNOTE_MODEL','CONFIDENTIAL','QUALIFIED'),
 ('classnote-evaluate-g0','ClassNote Evaluate · G0','CLASSNOTE','qwen3:14b','EVALUATE','G0','CLASSNOTE_MODEL','CONFIDENTIAL','QUALIFIED'),
 ('classnote-action-g0','ClassNote Action · G0','CLASSNOTE','rules-v1','ACTION','G0','CLASSNOTE_MODEL','RESTRICTED','QUALIFIED'),
 ('classnote-engineering-g7','ClassNote Engineering · G7','CLASSNOTE','qwen3-coder','ENGINEERING','G7','CLASSNOTE_MODEL','INTERNAL','QUALIFIED')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS ai_capability_model_routes (
  capability_code TEXT PRIMARY KEY REFERENCES ai_capabilities(code) ON DELETE CASCADE,
  dna TEXT NOT NULL CHECK (dna IN ('CAPTURE','KNOWLEDGE','RADAR','COMPANION','GENERATE','EVALUATE','ACTION','ENGINEERING')),
  model_group TEXT NOT NULL CHECK (model_group ~ '^G[0-7]$'),
  classnote_model_code TEXT NOT NULL REFERENCES ai_model_engines(code),
  primary_provider_code TEXT NOT NULL REFERENCES ai_provider_connections(code),
  primary_model_id TEXT NOT NULL,
  fallback_provider_code TEXT REFERENCES ai_provider_connections(code),
  fallback_model_id TEXT,
  privacy_class TEXT NOT NULL CHECK (privacy_class IN ('PUBLIC','LOCAL','INTERNAL','CONFIDENTIAL','RESTRICTED','CLOUD')),
  routing_policy TEXT NOT NULL DEFAULT 'PRIMARY_THEN_FALLBACK' CHECK (routing_policy IN ('PRIMARY_ONLY','PRIMARY_THEN_FALLBACK','DETERMINISTIC_ONLY')),
  minimum_confidence NUMERIC(4,3) NOT NULL DEFAULT 0.700 CHECK (minimum_confidence >= 0 AND minimum_confidence <= 1),
  human_authority_required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','READY','DISABLED')),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((fallback_provider_code IS NULL AND fallback_model_id IS NULL) OR (fallback_provider_code IS NOT NULL AND fallback_model_id IS NOT NULL))
);

INSERT INTO ai_capability_model_routes(capability_code,dna,model_group,classnote_model_code,primary_provider_code,primary_model_id,fallback_provider_code,fallback_model_id,privacy_class,routing_policy,minimum_confidence,human_authority_required,status) VALUES
 ('capture.ingest','CAPTURE','G1','classnote-capture-g1','ollama-cloud','qwen3:8b','ollama-local','qwen3:8b','INTERNAL','PRIMARY_THEN_FALLBACK',0.70,false,'DRAFT'),
 ('knowledge.answer','KNOWLEDGE','G2','classnote-knowledge-g2','ollama-cloud','qwen3:14b','ollama-local','qwen3:8b','INTERNAL','PRIMARY_THEN_FALLBACK',0.75,false,'DRAFT'),
 ('radar.attention','RADAR','G2','classnote-radar-g2','ollama-cloud','qwen3:14b','ollama-local','qwen3:8b','CONFIDENTIAL','PRIMARY_THEN_FALLBACK',0.80,true,'DRAFT'),
 ('companion.assist','COMPANION','G3','classnote-companion-g3','ollama-cloud','qwen3:14b','ollama-local','qwen3:8b','CONFIDENTIAL','PRIMARY_THEN_FALLBACK',0.75,true,'DRAFT'),
 ('generate.draft','GENERATE','G4','classnote-generate-g4','ollama-cloud','qwen3:14b','mistral-compatible','mistral-small3.2','INTERNAL','PRIMARY_THEN_FALLBACK',0.70,true,'DRAFT'),
 ('evaluate.pastoral_readiness','EVALUATE','G0','classnote-evaluate-g0','deterministic-core','rules-v1',NULL,NULL,'CONFIDENTIAL','DETERMINISTIC_ONLY',0.90,true,'READY'),
 ('action.pastoral_decision','ACTION','G0','classnote-action-g0','deterministic-core','rules-v1',NULL,NULL,'RESTRICTED','DETERMINISTIC_ONLY',1.00,true,'READY'),
 ('engineering.orchestrate','ENGINEERING','G7','classnote-engineering-g7','ollama-cloud','qwen3-coder','ollama-local','qwen3-coder','INTERNAL','PRIMARY_THEN_FALLBACK',0.80,true,'DRAFT')
ON CONFLICT (capability_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_ai_routes_status ON ai_capability_model_routes(status,dna);
CREATE INDEX IF NOT EXISTS idx_ai_provider_status ON ai_provider_connections(status,provider_type);
UPDATE runtime_schema_contract SET schema_generation=53,release_floor='1.0.0-rc77',updated_at=now() WHERE id=1;
