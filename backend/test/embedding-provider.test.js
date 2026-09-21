import test from 'node:test'; import assert from 'node:assert/strict';
import {contentHash,cosineSimilarity,embedTexts} from '../src/embedding-provider.js';
import {normalizeKnowledgeDocument,prepareKnowledgeChunks,ingestionFingerprint} from '../src/knowledge-ingestion.js';

test('content hash deterministic and cosine similarity works',()=>{assert.equal(contentHash('abc'),contentHash('abc'));assert.ok(cosineSimilarity([1,0],[1,0])>0.99);assert.equal(cosineSimilarity([1,0],[0,1]),0);});
test('embedding provider preserves provider index order',async()=>{const fetchImpl=async()=>({ok:true,json:async()=>({data:[{index:1,embedding:[0,1]},{index:0,embedding:[1,0]}]})});const r=await embedTexts(['a','b'],{config:{baseUrl:'https://x',apiKey:'k',model:'m',timeoutMs:1000},fetchImpl});assert.deepEqual(r.vectors,[[1,0],[0,1]]);assert.equal(r.provider,'external');});
test('embedding provider degrades safely when unconfigured',async()=>{const r=await embedTexts(['a'],{config:{baseUrl:'',apiKey:'',model:'',timeoutMs:1000}});assert.equal(r.degraded,true);assert.deepEqual(r.vectors,[]);});
test('knowledge ingestion validates scope and creates stable chunks',()=>{const doc={title:'Panduan Baptis',content:'A'.repeat(2600),scope:'participant',version:'2'};const n=normalizeKnowledgeDocument(doc);assert.equal(n.scope,'PARTICIPANT');const chunks=prepareKnowledgeChunks(doc,{maxChars:1000,overlap:100});assert.equal(chunks.length,3);assert.equal(chunks[0].scope,'PARTICIPANT');assert.equal(ingestionFingerprint(doc),ingestionFingerprint(doc));});
test('knowledge ingestion rejects invalid scope',()=>assert.throws(()=>normalizeKnowledgeDocument({title:'Valid title',content:'A'.repeat(30),scope:'SECRET'}),/INVALID_SCOPE/));
