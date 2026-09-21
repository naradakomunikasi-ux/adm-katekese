import test from 'node:test';
import assert from 'node:assert/strict';
import { auditEventHash } from '../src/audit-integrity.js';
import { createAuditExport, verifyAuditExport } from '../src/audit-export.js';

function chainEvent(id, previous_hash, metadata={}) {
  const event = { id, actor_user_id:'u1', action:'READ', entity_type:'participant', entity_id:String(id), metadata, ip_address:'127.0.0.1', created_at:`2026-08-11T00:00:0${id}.000Z`, previous_hash };
  event.event_hash = auditEventHash({ actorUserId:event.actor_user_id, action:event.action, entityType:event.entity_type, entityId:event.entity_id, metadata:event.metadata, ipAddress:event.ip_address, createdAt:event.created_at, previousHash:event.previous_hash });
  return event;
}

const first = chainEvent(1, null, {a:1});
const second = chainEvent(2, first.event_hash, {b:2});

test('audit export round trip verifies digest and chain', () => {
  const bundle = createAuditExport([first, second], { exportedAt:new Date('2026-08-11T01:00:00Z') });
  const result = verifyAuditExport(bundle);
  assert.equal(result.valid, true);
  assert.equal(result.eventCount, 2);
});

test('audit export detects payload tampering', () => {
  const bundle = createAuditExport([first, second]);
  bundle.events[1] = {...bundle.events[1], metadata:{tampered:true}};
  const result = verifyAuditExport(bundle);
  assert.equal(result.valid, false);
  assert.ok(result.failures.includes('PAYLOAD_DIGEST_MISMATCH'));
  assert.ok(result.failures.includes('AUDIT_CHAIN_INVALID'));
});

test('audit export detects count/head tampering', () => {
  const bundle = createAuditExport([first, second]);
  bundle.eventCount = 99;
  bundle.chainHead = 'bad';
  const result = verifyAuditExport(bundle);
  assert.equal(result.valid, false);
  assert.ok(result.failures.includes('EVENT_COUNT_MISMATCH'));
  assert.ok(result.failures.includes('CHAIN_HEAD_MISMATCH'));
});
