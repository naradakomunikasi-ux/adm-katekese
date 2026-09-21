import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRequestId, apiCachePolicy, createRuntimeState } from '../src/request-policy.js';

test('request id accepts canonical UUID only',()=>{
 const valid='123e4567-e89b-42d3-a456-426614174000';
 assert.equal(normalizeRequestId(valid,()=> 'generated'),valid);
 assert.equal(normalizeRequestId('evil\r\nX-Test: yes',()=> 'generated'),'generated');
 assert.equal(normalizeRequestId('abc',()=> 'generated'),'generated');
});

test('sensitive API responses are no-store',()=>{
 assert.equal(apiCachePolicy('/api/auth/login'),'no-store');
 assert.equal(apiCachePolicy('/api/participants'),'no-store');
 assert.equal(apiCachePolicy('/api/health'),'no-cache');
});

test('runtime readiness transitions are explicit',()=>{
 const state=createRuntimeState(); assert.equal(state.isReady(),false);
 state.markReady(); assert.equal(state.isReady(),true);
 state.markShuttingDown(); assert.equal(state.isReady(),false);
});

test('degraded runtime can recover when dependencies recover',()=>{
 const state=createRuntimeState();
 state.markReady(); state.markDegraded();
 assert.equal(state.phase,'degraded');
 assert.equal(state.canProbeDependencies(),true);
 state.markReady();
 assert.equal(state.phase,'ready');
});

test('shutdown state is terminal for readiness probing',()=>{
 const state=createRuntimeState(); state.markReady(); state.markShuttingDown(); state.markReady();
 assert.equal(state.phase,'shutting_down');
 assert.equal(state.canProbeDependencies(),false);
});
