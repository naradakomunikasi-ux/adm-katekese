import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePagination, participantPatch, taskPriorityRank, exceptionScore } from '../src/domain.js';

test('pagination is bounded', () => {
  assert.deepEqual(normalizePagination({limit:'999',offset:'-5'}), {limit:100,offset:0});
  assert.deepEqual(normalizePagination({}), {limit:25,offset:0});
  assert.deepEqual(normalizePagination({limit:'0',offset:'999999999'}), {limit:25,offset:1000000});
  assert.deepEqual(normalizePagination({limit:'abc',offset:'abc'}), {limit:25,offset:0});
});

test('participant patch validates controlled status and percentages', () => {
  assert.deepEqual(participantPatch({status:'active',progressPercent:75}), {status:'ACTIVE',progress_percent:75});
  assert.throws(() => participantPatch({status:'UNKNOWN'}), /Invalid participant status/);
  assert.throws(() => participantPatch({progressPercent:101}), /Invalid progress percent/);
});

test('task priorities sort P0 before P1 before P2', () => {
  assert.ok(taskPriorityRank('P0') < taskPriorityRank('P1'));
  assert.ok(taskPriorityRank('P1') < taskPriorityRank('P2'));
});

test('exception score prioritizes overdue and incomplete records', () => {
  const urgent = exceptionScore({overdue:true,progressPercent:40,attendancePercent:70,documentPending:true});
  const normal = exceptionScore({overdue:false,progressPercent:95,attendancePercent:95});
  assert.ok(urgent > normal);
});
