const ALLOWED_ROUTE_STATUS=new Set(['DRAFT','READY','DISABLED']);
const ALLOWED_POLICY=new Set(['PRIMARY_ONLY','PRIMARY_THEN_FALLBACK','DETERMINISTIC_ONLY']);
const QUALIFIED=new Set(['QUALIFIED','CANARY','PRODUCTION']);
const ACTIVE_PROVIDERS=new Set(['CONFIGURED','QUALIFIED']);
const PRIVACY_RANK={PUBLIC:0,CLOUD:1,INTERNAL:2,LOCAL:3,CONFIDENTIAL:4,RESTRICTED:5};
function clean(value,max=300){return String(value??'').trim().slice(0,max);}
export function privacyCompatible(capabilityPrivacy,providerPrivacy){
 const required=PRIVACY_RANK[capabilityPrivacy]; const offered=PRIVACY_RANK[providerPrivacy];
 return Number.isInteger(required)&&Number.isInteger(offered)&&offered>=required;
}
export function validateRouteCompatibility({capability,model,primaryProvider,fallbackProvider=null,route={}}){
 const errors=[];
 if(!capability)errors.push('CAPABILITY_NOT_FOUND');
 if(!model)errors.push('MODEL_NOT_FOUND');
 if(capability&&model&&(capability.dna!==model.dna||capability.model_group!==model.model_group))errors.push('MODEL_CAPABILITY_MISMATCH');
 if(model&&!QUALIFIED.has(model.status))errors.push('MODEL_NOT_QUALIFIED');
 if(!primaryProvider||!ACTIVE_PROVIDERS.has(primaryProvider.status))errors.push('PRIMARY_PROVIDER_INACTIVE');
 if(capability&&primaryProvider&&!privacyCompatible(capability.privacy_class,primaryProvider.privacy_class))errors.push('PRIMARY_PRIVACY_MISMATCH');
 if(route.routingPolicy==='PRIMARY_THEN_FALLBACK'&&!fallbackProvider)errors.push('FALLBACK_REQUIRED');
 if(fallbackProvider&&!ACTIVE_PROVIDERS.has(fallbackProvider.status))errors.push('FALLBACK_PROVIDER_INACTIVE');
 if(capability&&fallbackProvider&&!privacyCompatible(capability.privacy_class,fallbackProvider.privacy_class))errors.push('FALLBACK_PRIVACY_MISMATCH');
 if(capability?.code==='action.pastoral_decision'&&(primaryProvider?.provider_type!=='DETERMINISTIC'||route.routingPolicy!=='DETERMINISTIC_ONLY'))errors.push('PASTORAL_DECISION_AUTONOMY_FORBIDDEN');
 return {ok:errors.length===0,errors};
}

export function providerCompatibleWithCapability(capability,provider){
 if(!capability||!provider||!ACTIVE_PROVIDERS.has(provider.status))return false;
 if(!privacyCompatible(capability.privacy_class,provider.privacy_class))return false;
 if(capability.code==='action.pastoral_decision'&&provider.provider_type!=='DETERMINISTIC')return false;
 if(capability.code!=='action.pastoral_decision'&&provider.provider_type==='DETERMINISTIC'&&!capability.deterministic_first)return false;
 return true;
}
export function buildRouteRecommendation({capability,models=[],providers=[]}){
 if(!capability||!models.length)return null;
 const compatibleProviders=providers.filter(provider=>providerCompatibleWithCapability(capability,provider));
 const deterministic=compatibleProviders.find(x=>x.provider_type==='DETERMINISTIC');
 const preferred=capability.code==='action.pastoral_decision'
  ? deterministic
  : compatibleProviders.find(x=>x.code==='ollama-cloud')||compatibleProviders.find(x=>x.code==='ollama-local')||compatibleProviders.find(x=>x.provider_type!=='DETERMINISTIC')||deterministic;
 if(!preferred)return null;
 const fallback=preferred.provider_type==='DETERMINISTIC'?null:compatibleProviders.find(x=>x.code!==preferred.code&&x.provider_type!=='DETERMINISTIC')||null;
 return {
  capabilityCode:capability.code,
  classNoteModelCode:models[0].code,
  primaryProviderCode:preferred.code,
  primaryModelId:preferred.default_model_id||models[0].model_id,
  fallbackProviderCode:fallback?.code||null,
  fallbackModelId:fallback?.default_model_id||null,
  routingPolicy:preferred.provider_type==='DETERMINISTIC'?'DETERMINISTIC_ONLY':fallback?'PRIMARY_THEN_FALLBACK':'PRIMARY_ONLY',
  minimumConfidence:capability.human_authority_required?0.8:0.7,
  humanAuthorityRequired:Boolean(capability.human_authority_required),
  status:'DRAFT'
 };
}
export function normalizeRoutePatch(body={}){
 const minimumConfidence=Math.min(1,Math.max(0,Number(body.minimumConfidence??0.7)));
 return {capabilityCode:clean(body.capabilityCode,120),classNoteModelCode:clean(body.classNoteModelCode,120),primaryProviderCode:clean(body.primaryProviderCode,120),primaryModelId:clean(body.primaryModelId,300),fallbackProviderCode:clean(body.fallbackProviderCode,120)||null,fallbackModelId:clean(body.fallbackModelId,300)||null,privacyClass:clean(body.privacyClass,30),routingPolicy:ALLOWED_POLICY.has(body.routingPolicy)?body.routingPolicy:'PRIMARY_THEN_FALLBACK',minimumConfidence:Number.isFinite(minimumConfidence)?minimumConfidence:0.7,humanAuthorityRequired:body.humanAuthorityRequired!==false,status:ALLOWED_ROUTE_STATUS.has(body.status)?body.status:'DRAFT'};
}
export async function resolveEffectiveRoute(client,capabilityCode){
 const {rows}=await client.query(`SELECT r.*,c.status AS capability_status,c.dna AS capability_dna,c.model_group AS capability_model_group,c.privacy_class AS capability_privacy,c.human_authority_required AS capability_human_authority,m.status AS model_status,m.dna AS model_dna,m.model_group AS model_model_group,p.status AS primary_provider_status,p.provider_type AS primary_provider_type,p.base_url AS primary_base_url,p.api_key_enc AS primary_api_key_enc,p.privacy_class AS primary_provider_privacy,p.last_test_status AS primary_test_status,f.status AS fallback_provider_status,f.provider_type AS fallback_provider_type,f.base_url AS fallback_base_url,f.api_key_enc AS fallback_api_key_enc,f.privacy_class AS fallback_provider_privacy,f.last_test_status AS fallback_test_status FROM ai_capability_model_routes r JOIN ai_capabilities c ON c.code=r.capability_code JOIN ai_model_engines m ON m.code=r.classnote_model_code JOIN ai_provider_connections p ON p.code=r.primary_provider_code LEFT JOIN ai_provider_connections f ON f.code=r.fallback_provider_code WHERE r.capability_code=$1`,[capabilityCode]);
 const row=rows[0]; if(!row)return null;
 if(row.status!=='READY'||!QUALIFIED.has(row.capability_status)||!QUALIFIED.has(row.model_status)||!ACTIVE_PROVIDERS.has(row.primary_provider_status))return null;
 if(row.dna!==row.capability_dna||row.model_group!==row.capability_model_group||row.capability_dna!==row.model_dna||row.capability_model_group!==row.model_model_group)return null;
 if(!privacyCompatible(row.capability_privacy,row.primary_provider_privacy))return null;
 const primaryDeterministic=row.primary_provider_type==='DETERMINISTIC';
 if(!primaryDeterministic&&row.primary_test_status!=='READY')return null;
 if(row.routing_policy==='PRIMARY_THEN_FALLBACK'){
  if(!row.fallback_provider_code||!row.fallback_model_id||!ACTIVE_PROVIDERS.has(row.fallback_provider_status))return null;
  if(!privacyCompatible(row.capability_privacy,row.fallback_provider_privacy))return null;
  if(row.fallback_provider_type!=='DETERMINISTIC'&&row.fallback_test_status!=='READY')return null;
 }
 if(row.capability_code==='action.pastoral_decision'&&(row.routing_policy!=='DETERMINISTIC_ONLY'||!primaryDeterministic))return null;
 if(row.capability_human_authority&&!row.human_authority_required)return null;
 return row;
}
