import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessParticipant, scopeParticipantWhere, canReadSensitivePayment } from '../src/access-scope.js';

test('participant scope is self-only',()=>{ const actor={sub:'u1',role:'PESERTA'}; assert.equal(canAccessParticipant(actor,{userId:'u1'}),true); assert.equal(canAccessParticipant(actor,{userId:'u2'}),false); assert.deepEqual(scopeParticipantWhere(actor,2),{clause:'user_id = $2',params:['u1']}); });
test('pastoral roles can access participant records',()=>{ for(const role of ['SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','PASTOR']) assert.equal(canAccessParticipant({sub:'x',role},{userId:'u1'}),true); });
test('sensitive payment visibility is limited',()=>{ const p={userId:'u1'}; assert.equal(canReadSensitivePayment({sub:'u1',role:'PESERTA'},p),true); assert.equal(canReadSensitivePayment({sub:'u2',role:'PESERTA'},p),false); assert.equal(canReadSensitivePayment({sub:'x',role:'KATEKIS'},p),false); assert.equal(canReadSensitivePayment({sub:'x',role:'ADMIN_KATEKESE'},p),true); });
