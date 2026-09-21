import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../../database/migrations/021_up.sql',import.meta.url),'utf8');

test('attendance write verifies enrollment and scoped participant visibility',()=>{
  assert.match(source,/ATTENDANCE_SCOPE_DENIED/);
  assert.match(source,/JOIN participant_programs pp ON pp\.batch_id=m\.batch_id/);
  assert.match(source,/participantScopeSql\(mode/);
});

test('database trigger independently enforces meeting batch enrollment',()=>{
  assert.match(migration,/enforce_attendance_batch_enrollment/);
  assert.match(migration,/BEFORE INSERT OR UPDATE OF meeting_id, participant_id ON attendance/);
  assert.match(migration,/pp\.status <> 'CANCELLED'/);
});
