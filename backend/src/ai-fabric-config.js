function cleanUrl(value=''){ return String(value||'').trim().replace(/\/$/,''); }
function configured(...values){ return values.every((value)=>Boolean(String(value||'').trim())); }

export function aiFabricConfig(env=process.env){
  return {
    capability:'knowledge.answer',
    primary:{
      baseUrl:cleanUrl(env.LLM_API_BASE_URL),
      apiKey:String(env.LLM_API_KEY||''),
      model:String(env.LLM_MODEL||''),
      timeoutMs:Math.max(1000,Math.min(60000,Number(env.LLM_TIMEOUT_MS||15000))),
      privacy:String(env.LLM_PRIVACY_CLASS||'LOCAL').toUpperCase(),
    },
    cloud:{
      enabled:String(env.CLOUD_LLM_ENABLED||'false').toLowerCase()==='true',
      baseUrl:cleanUrl(env.CLOUD_LLM_API_BASE_URL),
      apiKey:String(env.CLOUD_LLM_API_KEY||''),
      model:String(env.CLOUD_LLM_MODEL||''),
      timeoutMs:Math.max(1000,Math.min(60000,Number(env.CLOUD_LLM_TIMEOUT_MS||20000))),
      privacy:String(env.CLOUD_LLM_PRIVACY_CLASS||'CLOUD').toUpperCase(),
    },
    embedding:{
      baseUrl:cleanUrl(env.EMBEDDING_API_BASE_URL||env.LLM_API_BASE_URL),
      apiKey:String(env.EMBEDDING_API_KEY||env.LLM_API_KEY||''),
      model:String(env.EMBEDDING_MODEL||''),
      timeoutMs:Math.max(1000,Math.min(60000,Number(env.EMBEDDING_TIMEOUT_MS||15000))),
    },
    storage:{
      provider:String(env.KNOWLEDGE_STORAGE_PROVIDER||'GOOGLE_DRIVE').toUpperCase(),
      driveUrl:String(env.DRIVE_STORAGE_URL||''),
      driveFolderId:String(env.DRIVE_STORAGE_FOLDER_ID||''),
    },
    routing:{
      cloudEscalation:String(env.CLOUD_LLM_ESCALATION||'complex_only').toLowerCase(),
      requireCitations:String(env.ASK_MIYU_REQUIRE_CITATIONS||'true').toLowerCase()!=='false',
    }
  };
}

export function safeAiFabricConfig(env=process.env){
  const config=aiFabricConfig(env);
  return {
    capability:config.capability,
    primary:{baseUrl:config.primary.baseUrl,model:config.primary.model,privacy:config.primary.privacy,apiKeyConfigured:Boolean(config.primary.apiKey),configured:configured(config.primary.baseUrl,config.primary.apiKey,config.primary.model)},
    cloud:{enabled:config.cloud.enabled,baseUrl:config.cloud.baseUrl,model:config.cloud.model,privacy:config.cloud.privacy,apiKeyConfigured:Boolean(config.cloud.apiKey),configured:config.cloud.enabled&&configured(config.cloud.baseUrl,config.cloud.apiKey,config.cloud.model)},
    embedding:{baseUrl:config.embedding.baseUrl,model:config.embedding.model,apiKeyConfigured:Boolean(config.embedding.apiKey),configured:configured(config.embedding.baseUrl,config.embedding.apiKey,config.embedding.model)},
    storage:{...config.storage,configured:Boolean(config.storage.driveUrl||config.storage.driveFolderId)},
    routing:{...config.routing}
  };
}

export function selectAiRoute({confidence='none',config=aiFabricConfig()}={}){
  const primaryReady=config.primary.baseUrl&&config.primary.apiKey&&config.primary.model;
  const cloudReady=config.cloud.enabled&&config.cloud.baseUrl&&config.cloud.apiKey&&config.cloud.model;
  if(primaryReady) return {route:'primary',provider:config.primary};
  if(cloudReady && config.routing.cloudEscalation==='always') return {route:'cloud',provider:config.cloud};
  if(cloudReady && ['medium','high'].includes(confidence) && config.routing.cloudEscalation==='complex_only') return {route:'cloud',provider:config.cloud};
  return {route:'fallback',provider:null};
}
