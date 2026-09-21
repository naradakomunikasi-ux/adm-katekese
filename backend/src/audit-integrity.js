import crypto from 'node:crypto';

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function canonicalAuditEvent(event = {}) {
  return JSON.stringify(stable({
    actorUserId: event.actorUserId || null,
    action: String(event.action || ''),
    entityType: String(event.entityType || ''),
    entityId: event.entityId == null ? null : String(event.entityId),
    metadata: event.metadata || {},
    ipAddress: event.ipAddress || null,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt || ''),
    previousHash: event.previousHash || null
  }));
}

export function auditEventHash(event) {
  return crypto.createHash('sha256').update(canonicalAuditEvent(event)).digest('hex');
}

export function verifyAuditChain(events = []) {
  let previousHash = null;
  const failures = [];
  for (const event of events) {
    if ((event.previous_hash || null) !== previousHash) {
      failures.push({ id: event.id, reason: 'PREVIOUS_HASH_MISMATCH' });
    }
    const expected = auditEventHash({
      actorUserId: event.actor_user_id,
      action: event.action,
      entityType: event.entity_type,
      entityId: event.entity_id,
      metadata: event.metadata,
      ipAddress: event.ip_address,
      createdAt: event.created_at,
      previousHash: event.previous_hash || null
    });
    if (event.event_hash !== expected) failures.push({ id: event.id, reason: 'EVENT_HASH_MISMATCH' });
    previousHash = event.event_hash || null;
  }
  return { valid: failures.length === 0, checked: events.length, failures, head: previousHash };
}

export function verifyAuditChainWindow(events = [], {maxEvents = 10000} = {}) {
  const limit = Math.max(1, Number(maxEvents) || 10000);
  const truncated = events.length > limit;
  const checkedEvents = truncated ? events.slice(0, limit) : events;
  const result = verifyAuditChain(checkedEvents);
  return {
    ...result,
    complete: !truncated,
    truncated,
    ...(truncated ? {failures:[...result.failures,{id:null,reason:'AUDIT_CHAIN_TRUNCATED'}],valid:false} : {}),
  };
}
