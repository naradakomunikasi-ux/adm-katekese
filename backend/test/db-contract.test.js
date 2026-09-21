import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDashboardRow, validateParticipantRow, migrationSequence } from '../src/db-contract.js';

test('dashboard DB result contract accepts non-negative counters', () => {
  assert.deepEqual(validateDashboardRow({active_participants:12,pending_documents:3,pending_payments:2,pending_approvals:1}), {ok:true});
});

test('dashboard DB result contract rejects incomplete rows', () => {
  assert.equal(validateDashboardRow({active_participants:1}).ok, false);
});

test('participant DB result contract enforces percentage bounds', () => {
  assert.equal(validateParticipantRow({id:'x',full_name:'A',program_name:'B',status:'ACTIVE',progress_percent:101,attendance_percent:90}).ok, false);
  assert.equal(validateParticipantRow({id:'x',full_name:'A',program_name:'B',status:'ACTIVE',progress_percent:80,attendance_percent:90}).ok, true);
});

test('migration sequence requires paired up/down files', () => {
  assert.equal(migrationSequence(['001_up.sql','001_down.sql','002_up.sql','002_down.sql']).paired, true);
  assert.equal(migrationSequence(['001_up.sql']).paired, false);
});
