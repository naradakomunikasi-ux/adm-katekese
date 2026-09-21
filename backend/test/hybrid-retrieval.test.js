import test from 'node:test';
import assert from 'node:assert/strict';
import {hybridScore, retrieveHybrid, parseEmbedding, normalizeWeights} from '../src/hybrid-retrieval.js';

test('parseEmbedding accepts arrays and json strings safely',()=>{
 assert.deepEqual(parseEmbedding([1,0]),[1,0]);
 assert.deepEqual(parseEmbedding('[0,1]'),[0,1]);
 assert.deepEqual(parseEmbedding('bad'),[]);
});

test('hybrid retrieval prefers semantic match when vectors are available',()=>{
 const items=[
  {id:'lex',title:'Baptis bayi',content:'jadwal baptis bayi',embedding:[0,1]},
  {id:'sem',title:'Dokumen',content:'administrasi umum',embedding:[1,0]},
 ];
 const results=retrieveHybrid('jadwal baptis bayi',items,{queryVector:[1,0],semanticWeight:.8,lexicalWeight:.2,threshold:0});
 assert.equal(results[0].id,'sem');
 assert.equal(results[0].retrievalMode,'hybrid');
});

test('hybrid retrieval falls back to lexical when query vector is unavailable',()=>{
 const items=[{id:'a',title:'Absensi',content:'cara mengisi absensi peserta',embedding:[1,0]},{id:'b',title:'Pembayaran',content:'status pembayaran',embedding:[0,1]}];
 const results=retrieveHybrid('absensi peserta',items,{queryVector:[],threshold:0});
 assert.equal(results[0].id,'a');
 assert.equal(results[0].retrievalMode,'lexical');
});

test('dimension mismatch cannot create semantic score',()=>{
 const scored=hybridScore('dokumen',{title:'Dokumen',content:'dokumen',embedding:[1,0,0]},{queryVector:[1,0]});
 assert.equal(scored.semanticScore,0);
 assert.equal(scored.retrievalMode,'lexical');
});

test('weights normalize and zero weights choose lexical fallback',()=>{
 assert.deepEqual(normalizeWeights({semanticWeight:7,lexicalWeight:3}),{semanticWeight:.7,lexicalWeight:.3});
 assert.deepEqual(normalizeWeights({semanticWeight:0,lexicalWeight:0}),{semanticWeight:0,lexicalWeight:1});
});
