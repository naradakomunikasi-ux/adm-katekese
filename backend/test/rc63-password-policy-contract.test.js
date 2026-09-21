import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordPolicy } from '../src/validation.js';

test('RC63 accepts 8+ chars when uppercase lowercase digit symbol are present',()=>{
  assert.equal(validatePasswordPolicy('Abcd123!'),true);
  assert.equal(validatePasswordPolicy('Longer9@Pass'),true);
});

test('RC63 rejects short or incomplete combinations',()=>{
  assert.throws(()=>validatePasswordPolicy('Ab1!xyz'));
  assert.throws(()=>validatePasswordPolicy('abcdefgh'));
  assert.throws(()=>validatePasswordPolicy('ABCDEFG1'));
  assert.throws(()=>validatePasswordPolicy('Abcdefg!'));
  assert.throws(()=>validatePasswordPolicy('Abcdef12'));
});
