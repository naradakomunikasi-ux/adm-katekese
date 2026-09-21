import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const up=fs.readFileSync(new URL('../../database/migrations/026_up.sql',import.meta.url),'utf8');
const init=fs.readFileSync(new URL('../../database/init/007_rc23_service_modules.sql',import.meta.url),'utf8');
test('self upload context resolves canonical enrollment requirements',()=>{
  assert.match(src,/\/api\/documents\/upload-context/);
  assert.match(src,/participant_programs pp/);
  assert.match(src,/document_requirements dr ON dr\.program_id=pp\.program_id/);
});
test('participant cannot upload for arbitrary participant id',()=>{
  assert.match(src,/own!==participantId/);
  assert.match(src,/DOCUMENT_UPLOAD_SCOPE_DENIED/);
});
test('document requirement must match active enrollment',()=>{
  assert.match(src,/DOCUMENT_REQUIREMENT_SCOPE_DENIED/);
  assert.match(src,/pp\.participant_id=\$2 AND pp\.program_id=dr\.program_id AND pp\.status<>'CANCELLED'/);
});
test('database enforces requirement enrollment invariant',()=>{
  for(const text of [up,init]){
    assert.match(text,/enforce_document_requirement_enrollment/);
    assert.match(text,/DOCUMENT_REQUIREMENT_ENROLLMENT_INVARIANT/);
    assert.match(text,/trg_document_requirement_enrollment/);
  }
});
