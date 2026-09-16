import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeRoutePatch,privacyCompatible,validateRouteCompatibility} from '../src/ai-routing-store.js';

const capability={code:'knowledge.answer',dna:'KNOWLEDGE',model_group:'G2',privacy_class:'INTERNAL'};
const model={code:'classnote-knowledge-g2',dna:'KNOWLEDGE',model_group:'G2',status:'QUALIFIED'};
const ollama={code:'ollama-local',provider_type:'OLLAMA',privacy_class:'LOCAL',status:'QUALIFIED'};

test('RC77 privacy compatibility fails closed',()=>{
 assert.equal(privacyCompatible('CONFIDENTIAL','CLOUD'),false);
 assert.equal(privacyCompatible('INTERNAL','LOCAL'),true);
});
test('RC77 compatible route validates',()=>{
 const route=normalizeRoutePatch({capabilityCode:'knowledge.answer',classNoteModelCode:'classnote-knowledge-g2',primaryProviderCode:'ollama-local',primaryModelId:'qwen3:14b',routingPolicy:'PRIMARY_ONLY',status:'READY'});
 assert.equal(validateRouteCompatibility({capability,model,primaryProvider:ollama,route}).ok,true);
});
test('RC77 rejects DNA/model group mismatch',()=>{
 const bad={...model,dna:'GENERATE',model_group:'G4'};
 const route=normalizeRoutePatch({routingPolicy:'PRIMARY_ONLY'});
 assert.ok(validateRouteCompatibility({capability,model:bad,primaryProvider:ollama,route}).errors.includes('MODEL_CAPABILITY_MISMATCH'));
});
test('RC77 forbids autonomous pastoral decision',()=>{
 const cap={code:'action.pastoral_decision',dna:'ACTION',model_group:'G0',privacy_class:'RESTRICTED'};
 const actionModel={dna:'ACTION',model_group:'G0',status:'QUALIFIED'};
 const cloud={provider_type:'OLLAMA',privacy_class:'RESTRICTED',status:'QUALIFIED'};
 const route=normalizeRoutePatch({routingPolicy:'PRIMARY_ONLY'});
 assert.ok(validateRouteCompatibility({capability:cap,model:actionModel,primaryProvider:cloud,route}).errors.includes('PASTORAL_DECISION_AUTONOMY_FORBIDDEN'));
});
test('RC77 migration defines provider, route, 8DNA mapping and no plaintext key seed',()=>{
 const sql=fs.readFileSync(new URL('../../database/migrations/053_up.sql',import.meta.url),'utf8');
 for(const marker of ['ai_provider_connections','ai_capability_model_routes','ollama-cloud','qwen3:14b','mistral-small3.2','DETERMINISTIC_ONLY','schema_generation=53']) assert.ok(sql.includes(marker),marker);
 assert.equal(sql.includes('INSERT INTO ai_provider_connections(code,display_name,provider_type,base_url,api_key_enc'),false);
});

test('RC77 effective route requires tested provider and preserves human authority',async()=>{
 const {resolveEffectiveRoute}=await import('../src/ai-routing-store.js');
 const base={capability_code:'companion.assist',dna:'COMPANION',model_group:'G3',routing_policy:'PRIMARY_ONLY',status:'READY',human_authority_required:true,capability_status:'QUALIFIED',capability_dna:'COMPANION',capability_model_group:'G3',capability_privacy:'CONFIDENTIAL',capability_human_authority:true,model_status:'QUALIFIED',model_dna:'COMPANION',model_model_group:'G3',primary_provider_status:'QUALIFIED',primary_provider_type:'OLLAMA',primary_provider_privacy:'CONFIDENTIAL',primary_test_status:'READY'};
 const ready=await resolveEffectiveRoute({query:async()=>({rows:[base]})},'companion.assist');
 assert.equal(ready?.capability_code,'companion.assist');
 const untested=await resolveEffectiveRoute({query:async()=>({rows:[{...base,primary_test_status:'NOT_TESTED'}]})},'companion.assist');
 assert.equal(untested,null);
 const authorityDowngrade=await resolveEffectiveRoute({query:async()=>({rows:[{...base,human_authority_required:false}]})},'companion.assist');
 assert.equal(authorityDowngrade,null);
});

import { providerCompatibleWithCapability, buildRouteRecommendation } from '../src/ai-routing-store.js';

test('routing options exclude provider privacy mismatch and recommend compatible provider',()=>{
 const capability={code:'radar.attention',dna:'RADAR',model_group:'G2',privacy_class:'CONFIDENTIAL',deterministic_first:true,human_authority_required:true};
 const models=[{code:'classnote-radar-g2',model_id:'qwen3:14b'}];
 const cloud={code:'ollama-cloud',provider_type:'OLLAMA',default_model_id:'qwen3:14b',privacy_class:'INTERNAL',status:'CONFIGURED'};
 const local={code:'ollama-local',provider_type:'OLLAMA',default_model_id:'qwen3:14b',privacy_class:'RESTRICTED',status:'CONFIGURED'};
 assert.equal(providerCompatibleWithCapability(capability,cloud),false);
 assert.equal(providerCompatibleWithCapability(capability,local),true);
 const recommendation=buildRouteRecommendation({capability,models,providers:[cloud,local]});
 assert.equal(recommendation.primaryProviderCode,'ollama-local');
 assert.equal(recommendation.humanAuthorityRequired,true);
 assert.equal(recommendation.status,'DRAFT');
});
