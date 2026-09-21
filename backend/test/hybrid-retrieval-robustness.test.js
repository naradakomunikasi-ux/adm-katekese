import test from 'node:test';
import assert from 'node:assert/strict';
import {diversifyResults,retrievalDiagnostics,retrieveHybrid} from '../src/hybrid-retrieval.js';

test('diversity cap prevents one document from crowding all evidence slots',()=>{
 const rows=[
  {id:'a1',document_id:'A',score:.9},{id:'a2',document_id:'A',score:.85},{id:'a3',document_id:'A',score:.8},
  {id:'b1',document_id:'B',score:.7},{id:'c1',document_id:'C',score:.6}
 ];
 const out=diversifyResults(rows,{topK:5,maxChunksPerDocument:2});
 assert.deepEqual(out.map(x=>x.id),['a1','a2','b1','c1']);
});

test('diagnostics classify no, medium and high confidence',()=>{
 assert.equal(retrievalDiagnostics([]).confidence,'none');
 assert.equal(retrievalDiagnostics([{id:'a',document_id:'A',score:.45}]).confidence,'medium');
 assert.equal(retrievalDiagnostics([{id:'a',document_id:'A',score:.82},{id:'b',document_id:'B',score:.61}]).confidence,'high');
});

test('retrieveHybrid enforces document diversity while preserving ranking',()=>{
 const rows=[
  {id:'a1',document_id:'A',title:'baptis',content:'syarat baptis bayi'},
  {id:'a2',document_id:'A',title:'baptis',content:'syarat baptis bayi dokumen'},
  {id:'a3',document_id:'A',title:'baptis',content:'syarat baptis bayi orang tua'},
  {id:'b1',document_id:'B',title:'baptis',content:'jadwal baptis bayi'}
 ];
 const out=retrieveHybrid('baptis bayi',rows,{topK:4,threshold:0,maxChunksPerDocument:2});
 assert.equal(out.filter(x=>x.document_id==='A').length,2);
 assert.ok(out.some(x=>x.document_id==='B'));
});
