import crypto from 'node:crypto';
import { verifyAuditChain } from './audit-integrity.js';

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function canonicalAuditExportPayload(events = []) {
  return JSON.stringify(stable(events));
}

export function createAuditExport(events = [], { exportedAt = new Date(), version = '1' } = {}) {
  const chain = verifyAuditChain(events);
  if (!chain.valid) throw new Error('AUDIT_CHAIN_INVALID');
  const payload = canonicalAuditExportPayload(events);
  return {
    format: 'adm-katekese-audit-export',
    version: String(version),
    exportedAt: exportedAt instanceof Date ? exportedAt.toISOString() : String(exportedAt),
    eventCount: events.length,
    chainHead: chain.head,
    payloadSha256: crypto.createHash('sha256').update(payload).digest('hex'),
    events,
  };
}

export function verifyAuditExport(bundle = {}) {
  const events = Array.isArray(bundle.events) ? bundle.events : [];
  const chain = verifyAuditChain(events);
  const actualDigest = crypto.createHash('sha256').update(canonicalAuditExportPayload(events)).digest('hex');
  const failures = [];
  if (bundle.format !== 'adm-katekese-audit-export') failures.push('INVALID_FORMAT');
  if (Number(bundle.eventCount) !== events.length) failures.push('EVENT_COUNT_MISMATCH');
  if (bundle.payloadSha256 !== actualDigest) failures.push('PAYLOAD_DIGEST_MISMATCH');
  if ((bundle.chainHead || null) !== (chain.head || null)) failures.push('CHAIN_HEAD_MISMATCH');
  if (!chain.valid) failures.push('AUDIT_CHAIN_INVALID');
  return { valid: failures.length === 0, failures, eventCount: events.length, chainValid: chain.valid, payloadSha256: actualDigest, chainHead: chain.head };
}
