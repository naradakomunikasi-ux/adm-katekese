import test from 'node:test';
import assert from 'node:assert/strict';
import {citedIndexes,validateAnswerGrounding} from '../src/answer-grounding.js';

test('extracts unique sorted citation indexes',()=>{
  assert.deepEqual(citedIndexes('Satu [2], dua [1], ulang [2].'),[1,2]);
});

test('accepts answers with valid evidence citations',()=>{
  const out=validateAnswerGrounding('Jawaban berdasarkan sumber [1].',[{id:'a'}]);
  assert.equal(out.valid,true); assert.equal(out.reason,null);
});

test('rejects missing and out-of-range citations',()=>{
  assert.equal(validateAnswerGrounding('Tanpa sumber',[{id:'a'}]).reason,'MISSING_CITATIONS');
  const invalid=validateAnswerGrounding('Salah [2].',[{id:'a'}]);
  assert.equal(invalid.valid,false); assert.deepEqual(invalid.invalidCitations,[2]);
});
