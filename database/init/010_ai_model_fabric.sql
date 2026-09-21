CREATE TABLE IF NOT EXISTS ai_model_engines (
  code TEXT PRIMARY KEY, display_name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('CLASSNOTE','OPENAI_COMPATIBLE')),
  model_id TEXT NOT NULL,
  dna TEXT NOT NULL CHECK (dna IN ('CAPTURE','KNOWLEDGE','RADAR','COMPANION','GENERATE','EVALUATE','ACTION','ENGINEERING')),
  model_group TEXT NOT NULL CHECK (model_group ~ '^G[0-7]$'),
  engine_role TEXT NOT NULL CHECK (engine_role IN ('CLASSNOTE_MODEL','PRIMARY_ENGINE')),
  privacy_class TEXT NOT NULL CHECK (privacy_class IN ('LOCAL','INTERNAL','CONFIDENTIAL','RESTRICTED','CLOUD')),
  status TEXT NOT NULL DEFAULT 'QUALIFIED' CHECK (status IN ('CANDIDATE','BENCHMARKING','QUALIFIED','CANARY','PRODUCTION','DEPRECATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO ai_model_engines(code,display_name,provider,model_id,dna,model_group,engine_role,privacy_class,status) VALUES
 ('classnote-knowledge-g2','ClassNote Knowledge · G2','CLASSNOTE','classnote-knowledge-g2','KNOWLEDGE','G2','CLASSNOTE_MODEL','INTERNAL','QUALIFIED'),
 ('classnote-companion-g3','ClassNote Companion · G3','CLASSNOTE','classnote-companion-g3','COMPANION','G3','CLASSNOTE_MODEL','CONFIDENTIAL','QUALIFIED'),
 ('classnote-generate-g4','ClassNote Generate · G4','CLASSNOTE','classnote-generate-g4','GENERATE','G4','CLASSNOTE_MODEL','INTERNAL','QUALIFIED'),
 ('engine-classnote','ClassNote AI Engine','CLASSNOTE','classnote-router-v1','ENGINEERING','G7','PRIMARY_ENGINE','INTERNAL','QUALIFIED'),
 ('engine-local-compatible','Local OpenAI-Compatible','OPENAI_COMPATIBLE','configured-primary-model','ENGINEERING','G7','PRIMARY_ENGINE','LOCAL','QUALIFIED'),
 ('engine-cloud-compatible','Cloud OpenAI-Compatible','OPENAI_COMPATIBLE','configured-cloud-model','ENGINEERING','G7','PRIMARY_ENGINE','CLOUD','QUALIFIED')
ON CONFLICT (code) DO NOTHING;
ALTER TABLE system_ai_settings ADD COLUMN IF NOT EXISTS selected_capability_code TEXT REFERENCES ai_capabilities(code);
ALTER TABLE system_ai_settings ADD COLUMN IF NOT EXISTS classnote_model_code TEXT REFERENCES ai_model_engines(code);
ALTER TABLE system_ai_settings ADD COLUMN IF NOT EXISTS primary_engine_code TEXT REFERENCES ai_model_engines(code);
UPDATE runtime_schema_contract SET schema_generation=52,release_floor='1.0.0-rc76',updated_at=now() WHERE id=1;
UPDATE system_ai_settings SET selected_capability_code=COALESCE(selected_capability_code,'knowledge.answer'),classnote_model_code=COALESCE(classnote_model_code,'classnote-knowledge-g2'),primary_engine_code=COALESCE(primary_engine_code,'engine-classnote') WHERE id=1;
