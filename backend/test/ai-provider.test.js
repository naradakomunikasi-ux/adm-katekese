import test from 'node:test';
import assert from 'node:assert/strict';
import { aiConfig,isAiConfigured,buildGroundedMessages,answerWithProvider,chunkDocument } from '../src/ai-provider.js';

test('AI config is disabled without all secrets',()=> assert.equal(isAiConfigured(aiConfig({})),false));
test('grounded messages include evidence and pastoral boundary',()=>{const m=buildGroundedMessages('syarat?',[{title:'SOP',content:'Dokumen A'}]);assert.match(m[0].content,/Jangan membuat keputusan pastoral/);assert.match(m[1].content,/Dokumen A/);});
test('document chunking is bounded and overlapping',()=>{const chunks=chunkDocument('a'.repeat(2500),{maxChars:1000,overlap:100});assert.equal(chunks.length,3);assert.ok(chunks.every(c=>c.length<=1000));});
test('external provider contract returns citations',async()=>{const config={baseUrl:'https://llm.example',apiKey:'secret',model:'model',timeoutMs:1000};const evidence=[{id:'1',title:'SOP',content:'Syarat dokumen',score:1}];const fetchImpl=async()=>({ok:true,json:async()=>({choices:[{message:{content:'Jawaban [1]'}}]})});const out=await answerWithProvider({query:'Apa syarat?',evidence,config,fetchImpl});assert.equal(out.grounded,true);assert.equal(out.citations.length,1);});

test('provider failure degrades to grounded fallback instead of API failure',async()=>{
 const config={baseUrl:'https://provider.example',apiKey:'secret',model:'model',timeoutMs:1000};
 const fetchImpl=async()=>({ok:false,status:503,json:async()=>({})});
 const result=await answerWithProvider({query:'syarat baptis',evidence:[{id:'1',title:'Pedoman',content:'Dokumen wajib.',score:1}],config,fetchImpl});
 assert.equal(result.provider,'fallback');
 assert.equal(result.degraded,true);
 assert.equal(result.degradedReason,'PROVIDER_ERROR');
 assert.equal(result.grounded,true);
});

test('provider answer without valid citation degrades instead of claiming grounded',async()=>{
 const config={baseUrl:'https://llm.example',apiKey:'secret',model:'model',timeoutMs:1000};
 const evidence=[{id:'1',title:'SOP',content:'Syarat dokumen',score:1}];
 const fetchImpl=async()=>({ok:true,json:async()=>({choices:[{message:{content:'Jawaban tanpa penanda sumber'}}]})});
 const out=await answerWithProvider({query:'Apa syarat?',evidence,config,fetchImpl});
 assert.equal(out.grounded,true);
 assert.equal(out.provider,'fallback');
 assert.match(out.degradedReason,/UNGROUNDED_PROVIDER_ANSWER:MISSING_CITATIONS/);
});

test('provider answer with out-of-range citation degrades safely',async()=>{
 const config={baseUrl:'https://llm.example',apiKey:'secret',model:'model',timeoutMs:1000};
 const evidence=[{id:'1',title:'SOP',content:'Syarat dokumen',score:1}];
 const fetchImpl=async()=>({ok:true,json:async()=>({choices:[{message:{content:'Jawaban [9]'}}]})});
 const out=await answerWithProvider({query:'Apa syarat?',evidence,config,fetchImpl});
 assert.equal(out.provider,'fallback');
 assert.match(out.degradedReason,/UNGROUNDED_PROVIDER_ANSWER:INVALID_CITATIONS/);
});
