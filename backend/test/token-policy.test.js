import test from 'node:test';
import assert from 'node:assert/strict';
import { attachTokenClaims, validateTokenClaims } from '../src/token-policy.js';

const policy={issuer:'issuer-x',audience:'web-x'};
test('token policy attaches issuer and audience',()=>{
 const p=attachTokenClaims({sub:'u1',jti:'j1'},policy); assert.equal(p.iss,'issuer-x'); assert.equal(p.aud,'web-x');
});
test('token policy accepts required claims',()=>{
 assert.deepEqual(validateTokenClaims({sub:'u1',jti:'j1',iss:'issuer-x',aud:'web-x'},policy),{valid:true});
});
test('token policy rejects issuer, audience, subject, and jti mismatches',()=>{
 assert.equal(validateTokenClaims({sub:'u1',jti:'j1',iss:'bad',aud:'web-x'},policy).valid,false);
 assert.equal(validateTokenClaims({sub:'u1',jti:'j1',iss:'issuer-x',aud:'bad'},policy).valid,false);
 assert.equal(validateTokenClaims({jti:'j1',iss:'issuer-x',aud:'web-x'},policy).valid,false);
 assert.equal(validateTokenClaims({sub:'u1',iss:'issuer-x',aud:'web-x'},policy).valid,false);
});
