import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/index.js', import.meta.url),'utf8');

test('listen callback does not mark application ready before dependency probe',()=>{
  const listenChunk=source.slice(source.indexOf('const server=app.listen'), source.indexOf('async function gracefulShutdown'));
  assert.ok(!listenChunk.includes('runtimeState.markReady()'));
});

test('readiness endpoint is responsible for dependency probe and ready transition',()=>{
  assert.match(source,/app\.get\('\/api\/ready'[\s\S]*ensureConnections\(\)[\s\S]*runtimeState\.markReady\(\)/);
});

test('login has dedicated brute-force rate limit',()=>{
  assert.match(source,/scope:'login'[\s\S]*limit:10[\s\S]*15\*60_000/);
  assert.match(source,/LOGIN_RATE_LIMIT/);
});
