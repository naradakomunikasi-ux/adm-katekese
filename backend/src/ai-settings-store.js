import crypto from 'node:crypto';
import { aiFabricConfig } from './ai-fabric-config.js';

function keyFromSecret(secret){ return crypto.createHash('sha256').update(String(secret||'')).digest(); }
export function encryptSetting(value,secret){
 if(!value)return null;
 const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv('aes-256-gcm',keyFromSecret(secret),iv);
 const encrypted=Buffer.concat([cipher.update(String(value),'utf8'),cipher.final()]); const tag=cipher.getAuthTag();
 return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`;
}
export function decryptSetting(value,secret){
 if(!value)return '';
 const [version,ivB64,tagB64,dataB64]=String(value).split(':'); if(version!=='v1'||!ivB64||!tagB64||!dataB64)throw new Error('INVALID_ENCRYPTED_SETTING');
 const decipher=crypto.createDecipheriv('aes-256-gcm',keyFromSecret(secret),Buffer.from(ivB64,'base64url')); decipher.setAuthTag(Buffer.from(tagB64,'base64url'));
 return Buffer.concat([decipher.update(Buffer.from(dataB64,'base64url')),decipher.final()]).toString('utf8');
}
function clean(value,max=2000){ return String(value??'').trim().slice(0,max); }
export function mergeAiSettings({row=null,env=process.env,secret=''}){
 const base=aiFabricConfig(env); if(!row)return base;
 const readKey=(column,fallback)=>row[column]?decryptSetting(row[column],secret):fallback;
 return {
  ...base,
  capability:clean(row.selected_capability_code,120)||base.capability,
  classNote:{modelCode:clean(row.classnote_model_code,120)||'classnote-knowledge-g2'},
  engine:{primaryCode:clean(row.primary_engine_code,120)||'engine-classnote'},
  primary:{...base.primary,baseUrl:clean(row.primary_base_url)||base.primary.baseUrl,model:clean(row.primary_model,300)||base.primary.model,apiKey:readKey('primary_api_key_enc',base.primary.apiKey)},
  cloud:{...base.cloud,enabled:row.cloud_enabled===null||row.cloud_enabled===undefined?base.cloud.enabled:Boolean(row.cloud_enabled),baseUrl:clean(row.cloud_base_url)||base.cloud.baseUrl,model:clean(row.cloud_model,300)||base.cloud.model,apiKey:readKey('cloud_api_key_enc',base.cloud.apiKey)},
  embedding:{...base.embedding,baseUrl:clean(row.embedding_base_url)||base.embedding.baseUrl,model:clean(row.embedding_model,300)||base.embedding.model,apiKey:readKey('embedding_api_key_enc',base.embedding.apiKey)},
  storage:{...base.storage,driveUrl:clean(row.drive_storage_url)||base.storage.driveUrl,driveFolderId:clean(row.drive_folder_id,500)||base.storage.driveFolderId},
  routing:{...base.routing,cloudEscalation:clean(row.cloud_escalation,50)||base.routing.cloudEscalation,requireCitations:row.require_citations===null||row.require_citations===undefined?base.routing.requireCitations:Boolean(row.require_citations)},
 };
}
export function safeAiSettings(config){
 const yes=(provider)=>Boolean(provider?.baseUrl&&provider?.apiKey&&provider?.model);
 return {capability:config.capability,classNote:{modelCode:config.classNote?.modelCode||'classnote-knowledge-g2'},engine:{primaryCode:config.engine?.primaryCode||'engine-classnote'},primary:{baseUrl:config.primary.baseUrl,model:config.primary.model,privacy:config.primary.privacy,apiKeyConfigured:Boolean(config.primary.apiKey),configured:yes(config.primary)},cloud:{enabled:config.cloud.enabled,baseUrl:config.cloud.baseUrl,model:config.cloud.model,privacy:config.cloud.privacy,apiKeyConfigured:Boolean(config.cloud.apiKey),configured:config.cloud.enabled&&yes(config.cloud)},embedding:{baseUrl:config.embedding.baseUrl,model:config.embedding.model,apiKeyConfigured:Boolean(config.embedding.apiKey),configured:yes(config.embedding)},storage:{...config.storage,configured:Boolean(config.storage.driveUrl||config.storage.driveFolderId)},routing:{...config.routing}};
}
export async function loadAiSettings(pool,{env=process.env,secret='' }={}){
 const {rows}=await pool.query(`SELECT * FROM system_ai_settings WHERE id=1`); return mergeAiSettings({row:rows[0]||null,env,secret});
}
export function normalizeAiSettingsPatch(body={}){
 return {
  selectedCapabilityCode:clean(body.selectedCapabilityCode,120), classNoteModelCode:clean(body.classNoteModelCode,120), primaryEngineCode:clean(body.primaryEngineCode,120),
  primaryBaseUrl:clean(body.primaryBaseUrl), primaryModel:clean(body.primaryModel,300), primaryApiKey:clean(body.primaryApiKey,4000),
  cloudEnabled:Boolean(body.cloudEnabled), cloudBaseUrl:clean(body.cloudBaseUrl), cloudModel:clean(body.cloudModel,300), cloudApiKey:clean(body.cloudApiKey,4000),
  embeddingBaseUrl:clean(body.embeddingBaseUrl), embeddingModel:clean(body.embeddingModel,300), embeddingApiKey:clean(body.embeddingApiKey,4000),
  driveStorageUrl:clean(body.driveStorageUrl), driveFolderId:clean(body.driveFolderId,500),
  cloudEscalation:['never','complex_only','always'].includes(clean(body.cloudEscalation,50))?clean(body.cloudEscalation,50):'complex_only', requireCitations:body.requireCitations!==false,
 };
}
