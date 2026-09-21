import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');

test('dashboard applies participant and batch scope instead of global aggregates',()=>{
  const start=source.indexOf("app.get('/api/dashboard'");
  const end=source.indexOf("app.get('/api/participants'",start);
  const block=source.slice(start,end);
  assert.match(block,/participantScopeSql\(mode/);
  assert.match(block,/batchScopeSql\(mode/);
  assert.match(block,/WHERE \$\{participantScope\.clause\}/);
  assert.match(block,/AND \$\{batchScope\.clause\}/);
  assert.match(block,/scope:mode/);
});
