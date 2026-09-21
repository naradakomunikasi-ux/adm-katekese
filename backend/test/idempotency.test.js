import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIdempotencyKey, requestFingerprint, replayDecision } from '../src/idempotency.js';

test('idempotency key requires bounded safe token',()=>{
  assert.equal(normalizeIdempotencyKey('payment-verify-2026-0001'),'payment-verify-2026-0001');
  assert.throws(()=>normalizeIdempotencyKey('short'),/INVALID_IDEMPOTENCY_KEY/);
});

test('request fingerprint is stable and actor-specific',()=>{
  const a=requestFingerprint({method:'POST',path:'/api/payments/x/verify',actorId:'u1',body:{status:'VERIFIED'}});
  const b=requestFingerprint({method:'POST',path:'/api/payments/x/verify',actorId:'u1',body:{status:'VERIFIED'}});
  const c=requestFingerprint({method:'POST',path:'/api/payments/x/verify',actorId:'u2',body:{status:'VERIFIED'}});
  assert.equal(a,b); assert.notEqual(a,c);
});

test('replay decision rejects same key with changed request and replays completed response',()=>{
  assert.deepEqual(replayDecision(null,'a'),{type:'NEW'});
  assert.deepEqual(replayDecision({request_hash:'b'},'a'),{type:'CONFLICT'});
  assert.deepEqual(replayDecision({request_hash:'a'},'a'),{type:'IN_PROGRESS'});
  assert.deepEqual(replayDecision({request_hash:'a',response_status:200,response_body:{ok:true}},'a'),{type:'REPLAY',status:200,body:{ok:true}});
});
