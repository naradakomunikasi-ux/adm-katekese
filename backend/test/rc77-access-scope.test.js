import test from 'node:test';
import assert from 'node:assert/strict';
import {canAccessParticipant,scopeParticipantWhere,canReadSensitivePayment} from '../src/access-scope.js';

const participant={id:'11111111-1111-1111-1111-111111111111',userId:'user-1',programId:'22222222-2222-2222-2222-222222222222',batchId:'33333333-3333-3333-3333-333333333333'};

test('participant can access only own record',()=>{
 assert.equal(canAccessParticipant({role:'PESERTA',sub:'user-1'},participant),true);
 assert.equal(canAccessParticipant({role:'PESERTA',sub:'user-2'},participant),false);
});

test('admin program requires assigned program or batch scope',()=>{
 assert.equal(canAccessParticipant({role:'ADMIN_PROGRAM',programIds:[participant.programId]},participant),true);
 assert.equal(canAccessParticipant({role:'ADMIN_PROGRAM',programIds:['other']},participant),false);
 assert.equal(canAccessParticipant({role:'ADMIN_PROGRAM'},participant),false);
});

test('katekis and pastor fail closed without assignment',()=>{
 assert.equal(canAccessParticipant({role:'KATEKIS'},participant),false);
 assert.equal(canAccessParticipant({role:'PASTOR'},participant),false);
 assert.equal(canAccessParticipant({role:'KATEKIS',participantIds:[participant.id]},participant),true);
 assert.equal(canAccessParticipant({role:'PASTOR',pastoralBatchIds:[participant.batchId]},participant),true);
});

test('SQL scope fails closed when no scoped assignments exist',()=>{
 assert.deepEqual(scopeParticipantWhere({role:'ADMIN_PROGRAM'},1),{clause:'FALSE',params:[]});
 const scoped=scopeParticipantWhere({role:'ADMIN_PROGRAM',programIds:[participant.programId]},1);
 assert.match(scoped.clause,/program_id/);
 assert.equal(scoped.params.length,1);
});

test('sensitive payment remains restricted',()=>{
 assert.equal(canReadSensitivePayment({role:'ADMIN_PROGRAM',programIds:[participant.programId]},participant),false);
 assert.equal(canReadSensitivePayment({role:'SUPER_ADMIN'},participant),true);
 assert.equal(canReadSensitivePayment({role:'PESERTA',sub:'user-1'},participant),true);
});
