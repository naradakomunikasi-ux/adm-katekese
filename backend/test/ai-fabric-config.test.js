import test from 'node:test';
import assert from 'node:assert/strict';
import {aiFabricConfig,safeAiFabricConfig,selectAiRoute} from '../src/ai-fabric-config.js';

test('safe config never returns API keys',()=>{
 const safe=safeAiFabricConfig({LLM_API_BASE_URL:'https://llm.local/v1',LLM_API_KEY:'secret',LLM_MODEL:'qwen',EMBEDDING_API_BASE_URL:'https://embed.local/v1',EMBEDDING_API_KEY:'embedsecret',EMBEDDING_MODEL:'embed',CLOUD_LLM_ENABLED:'true',CLOUD_LLM_API_BASE_URL:'https://cloud.example/v1',CLOUD_LLM_API_KEY:'cloudsecret',CLOUD_LLM_MODEL:'frontier'});
 assert.equal(JSON.stringify(safe).includes('secret'),false);
 assert.equal(safe.primary.apiKeyConfigured,true); assert.equal(safe.cloud.configured,true);
});

test('primary route wins when configured',()=>{
 const config=aiFabricConfig({LLM_API_BASE_URL:'https://local/v1',LLM_API_KEY:'x',LLM_MODEL:'m',CLOUD_LLM_ENABLED:'true',CLOUD_LLM_API_BASE_URL:'https://cloud/v1',CLOUD_LLM_API_KEY:'y',CLOUD_LLM_MODEL:'c'});
 assert.equal(selectAiRoute({confidence:'high',config}).route,'primary');
});

test('cloud escalation can serve knowledge.answer when primary unavailable',()=>{
 const config=aiFabricConfig({CLOUD_LLM_ENABLED:'true',CLOUD_LLM_ESCALATION:'complex_only',CLOUD_LLM_API_BASE_URL:'https://cloud/v1',CLOUD_LLM_API_KEY:'y',CLOUD_LLM_MODEL:'c'});
 assert.equal(selectAiRoute({confidence:'medium',config}).route,'cloud');
 assert.equal(selectAiRoute({confidence:'low',config}).route,'fallback');
});
