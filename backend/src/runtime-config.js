import { URL } from 'node:url';

function isHttpUrl(value,{httpsOnly=false}={}) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return httpsOnly ? url.protocol === 'https:' : ['http:','https:'].includes(url.protocol);
  } catch { return false; }
}

function isRedisUrl(value) {
  if (!value) return false;
  try { return ['redis:','rediss:'].includes(new URL(value).protocol); } catch { return false; }
}

function isPostgresUrl(value) {
  if (!value) return false;
  try { return ['postgres:','postgresql:'].includes(new URL(value).protocol); } catch { return false; }
}

function isPlaceholder(value='') {
  return /change_me|replace_me|example|dummy|your[_-]/i.test(String(value));
}

function finiteInt(value, fallback) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) ? parsed : NaN;
}

export function validateRuntimeConfig(env, { expectedVersion, allowPlaceholders=false } = {}) {
  const errors=[]; const warnings=[];
  const production=(env.NODE_ENV||'development')==='production';
  const authSecret=String(env.AUTH_SECRET||'');
  const appVersion=String(env.APP_VERSION||expectedVersion||'');
  const topK=finiteInt(env.RETRIEVAL_TOP_K,5);
  const score=Number(env.RETRIEVAL_SCORE_THRESHOLD ?? 0.2);
  const llmConfigured=[env.LLM_API_BASE_URL,env.LLM_API_KEY,env.LLM_MODEL].filter(Boolean).length;
  const embeddingConfigured=[env.EMBEDDING_API_BASE_URL,env.EMBEDDING_API_KEY,env.EMBEDDING_MODEL].filter(Boolean).length;
  const cloudConfigured=[env.CLOUD_LLM_API_BASE_URL,env.CLOUD_LLM_API_KEY,env.CLOUD_LLM_MODEL].filter(Boolean).length;
  const cloudEnabled=String(env.CLOUD_LLM_ENABLED||'false').toLowerCase()==='true';

  if (!isPostgresUrl(env.DATABASE_URL)) errors.push('DATABASE_URL_INVALID');
  if (!isRedisUrl(env.REDIS_URL)) errors.push('REDIS_URL_INVALID');
  if (production && !isHttpUrl(env.FRONTEND_ORIGIN,{httpsOnly:true})) errors.push('FRONTEND_ORIGIN_HTTPS_REQUIRED');
  if (!production && env.FRONTEND_ORIGIN && !isHttpUrl(env.FRONTEND_ORIGIN)) errors.push('FRONTEND_ORIGIN_INVALID');
  if (authSecret.length < 32) errors.push('AUTH_SECRET_TOO_SHORT');
  if (!allowPlaceholders && isPlaceholder(authSecret)) errors.push('AUTH_SECRET_PLACEHOLDER');
  if (expectedVersion && appVersion !== expectedVersion) errors.push('APP_VERSION_MISMATCH');
  if (!Number.isInteger(topK) || topK < 1 || topK > 20) errors.push('RETRIEVAL_TOP_K_INVALID');
  if (!Number.isFinite(score) || score < 0 || score > 1) errors.push('RETRIEVAL_SCORE_THRESHOLD_INVALID');
  if (![0,3].includes(llmConfigured)) errors.push('LLM_CONFIG_PARTIAL');
  if (![0,3].includes(embeddingConfigured)) errors.push('EMBEDDING_CONFIG_PARTIAL');
  if (![0,3].includes(cloudConfigured)) errors.push('CLOUD_LLM_CONFIG_PARTIAL');
  if (cloudEnabled && cloudConfigured!==3) errors.push('CLOUD_LLM_ENABLED_BUT_UNCONFIGURED');
  if (env.LLM_API_BASE_URL && !isHttpUrl(env.LLM_API_BASE_URL,{httpsOnly:production})) errors.push('LLM_API_BASE_URL_INVALID');
  if (env.EMBEDDING_API_BASE_URL && !isHttpUrl(env.EMBEDDING_API_BASE_URL,{httpsOnly:production})) errors.push('EMBEDDING_API_BASE_URL_INVALID');
  if (env.CLOUD_LLM_API_BASE_URL && !isHttpUrl(env.CLOUD_LLM_API_BASE_URL,{httpsOnly:production})) errors.push('CLOUD_LLM_API_BASE_URL_INVALID');
  if (env.DRIVE_STORAGE_URL && !isHttpUrl(env.DRIVE_STORAGE_URL,{httpsOnly:production})) errors.push('DRIVE_STORAGE_URL_INVALID');
  if (llmConfigured===0) warnings.push('LLM_PROVIDER_UNCONFIGURED');
  if (embeddingConfigured===0) warnings.push('EMBEDDING_PROVIDER_UNCONFIGURED');

  return {
    ok: errors.length===0,
    errors,
    warnings,
    diagnostics:{
      environment:production?'production':'non-production',
      appVersion,
      databaseConfigured:Boolean(env.DATABASE_URL),
      redisConfigured:Boolean(env.REDIS_URL),
      frontendOriginConfigured:Boolean(env.FRONTEND_ORIGIN),
      llmProviderConfigured:llmConfigured===3,
      embeddingProviderConfigured:embeddingConfigured===3,
      cloudProviderEnabled:cloudEnabled,
      cloudProviderConfigured:cloudConfigured===3,
      driveStorageConfigured:Boolean(env.DRIVE_STORAGE_URL||env.DRIVE_STORAGE_FOLDER_ID),
      retrievalTopK:Number.isFinite(topK)?topK:null,
      retrievalScoreThreshold:Number.isFinite(score)?score:null,
    }
  };
}
