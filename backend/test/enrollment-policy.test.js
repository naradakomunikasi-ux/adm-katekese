import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEnrollmentInput,canTransitionEnrollment,isActiveEnrollment} from '../src/enrollment-policy.js';

test('normalize enrollment canonical input',()=>{
  assert.deepEqual(normalizeEnrollmentInput({programId:'p',batchId:'b',status:'active'}),{programId:'p',batchId:'b',status:'ACTIVE'});
  assert.throws(()=>normalizeEnrollmentInput({programId:'',status:'ACTIVE'}),/programId/);
  assert.throws(()=>normalizeEnrollmentInput({programId:'p',status:'UNKNOWN'}),/Invalid enrollment status/);
});

test('enrollment lifecycle is fail closed',()=>{
  assert.equal(canTransitionEnrollment('REGISTERED','ACTIVE'),true);
  assert.equal(canTransitionEnrollment('ACTIVE','COMPLETED'),true);
  assert.equal(canTransitionEnrollment('COMPLETED','ACTIVE'),false);
  assert.equal(canTransitionEnrollment('CANCELLED','REGISTERED'),true);
  assert.equal(isActiveEnrollment('REGISTERED'),true);
  assert.equal(isActiveEnrollment('COMPLETED'),false);
});
