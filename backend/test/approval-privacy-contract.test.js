import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
test('approval list requires approval permissions, not generic participant read',()=>{
  assert.match(source,/\/api\/approvals',authenticate,anyPermission\('approval:prepare','approval:decide'\)/);
  assert.doesNotMatch(source,/\/api\/approvals',authenticate,anyPermission\('approval:prepare','approval:decide','participant:read'\)/);
});
test('approval list returns participant and program context',()=>{
  assert.match(source,/participant_name/);
  assert.match(source,/program_name/);
});
test('duplicate submitted approval fails closed',()=>{
  assert.match(source,/APPROVAL_ALREADY_SUBMITTED/);
  assert.match(source,/status='SUBMITTED'/);
  assert.match(source,/error\.code==='23505'/);
});
