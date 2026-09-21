import crypto from 'node:crypto';

export function normalizeIdempotencyKey(value) {
  const key = String(value || '').trim();
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(key)) throw new Error('INVALID_IDEMPOTENCY_KEY');
  return key;
}

export function requestFingerprint({ method = 'POST', path = '/', actorId = '', body = {} } = {}) {
  const normalized = JSON.stringify({
    method: String(method).toUpperCase(),
    path: String(path),
    actorId: String(actorId),
    body,
  });
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function replayDecision(existing, fingerprint) {
  if (!existing) return { type: 'NEW' };
  if (existing.request_hash !== fingerprint) return { type: 'CONFLICT' };
  if (existing.response_body && existing.response_status) {
    return { type: 'REPLAY', status: existing.response_status, body: existing.response_body };
  }
  return { type: 'IN_PROGRESS' };
}
