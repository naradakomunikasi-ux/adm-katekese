CREATE TABLE IF NOT EXISTS ai_capabilities (
  code TEXT PRIMARY KEY,
  dna TEXT NOT NULL CHECK (dna IN ('CAPTURE','KNOWLEDGE','RADAR','COMPANION','GENERATE','EVALUATE','ACTION','ENGINEERING')),
  model_group TEXT NOT NULL CHECK (model_group ~ '^G[0-7]$'),
  privacy_class TEXT NOT NULL DEFAULT 'INTERNAL' CHECK (privacy_class IN ('PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED')),
  deterministic_first BOOLEAN NOT NULL DEFAULT true,
  human_authority_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE','BENCHMARKING','QUALIFIED','CANARY','PRODUCTION','DEPRECATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO ai_capabilities(code,dna,model_group,privacy_class,deterministic_first,human_authority_required,status) VALUES
 ('knowledge.answer','KNOWLEDGE','G2','INTERNAL',false,false,'QUALIFIED'),
 ('evaluate.pastoral_readiness','EVALUATE','G0','CONFIDENTIAL',true,true,'QUALIFIED'),
 ('action.pastoral_decision','ACTION','G0','RESTRICTED',true,true,'QUALIFIED')
ON CONFLICT (code) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_ai_capabilities_dna_status ON ai_capabilities(dna,status);
