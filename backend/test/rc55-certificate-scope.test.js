import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const api=fs.readFileSync(path.join(root,'src/index.js'),'utf8');
const migration=fs.readFileSync(path.resolve(root,'../database/migrations/034_up.sql'),'utf8');
test('RC55 certificate list uses canonical participant scope',()=>{
  assert.match(api,/participant:read_assigned/);
  assert.match(api,/participantScopeSql\(mode,\{alias:'pa'/);
  assert.match(api,/c\.status IN \('ISSUED','REVOKED'\)/);
});
test('RC55 certificate PDF remains self-or-approver only',()=>{
  assert.match(api,/CERTIFICATE_DOWNLOAD_SCOPE_DENIED/);
  assert.match(api,/mode!=='SELF'/);
  assert.match(migration,/idx_certificates_participant_status_created/);
});
