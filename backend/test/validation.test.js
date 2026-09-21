import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, validatePasswordPolicy, validateParticipantCreate, normalizeSort } from '../src/validation.js';

test('email validation normalizes safe address',()=> assert.equal(validateEmail(' Admin@Example.com '),'admin@example.com'));
test('email validation rejects invalid input',()=> assert.throws(()=>validateEmail('not-an-email')));
test('password policy requires production complexity',()=>{
 assert.equal(validatePasswordPolicy('StrongPass!2026'),true);
 assert.throws(()=>validatePasswordPolicy('weak'));
});
test('participant create sanitizes markup',()=>{
 assert.deepEqual(validateParticipantCreate({fullName:'<Maria>',programName:'Krisma'}),{fullName:'Maria',programId:null,programName:'Krisma',batchId:null});
 assert.equal(validateParticipantCreate({fullName:'Maria',programId:'00000000-0000-4000-8000-000000000001'}).programId,'00000000-0000-4000-8000-000000000001');
 assert.throws(()=>validateParticipantCreate({fullName:'Maria',programId:'not-a-uuid'}));
});
test('sort allowlist rejects arbitrary SQL identifiers',()=> assert.equal(normalizeSort('DROP TABLE users'),'created_at'));
