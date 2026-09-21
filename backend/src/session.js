import crypto from 'node:crypto';

export function newJti() { return crypto.randomUUID(); }
export function resetToken() { return crypto.randomBytes(32).toString('base64url'); }
export function tokenHash(token) { return crypto.createHash('sha256').update(String(token)).digest('hex'); }
export function isSessionActive(session, now = new Date()) {
  if (!session || session.revoked_at) return false;
  return new Date(session.expires_at).getTime() > now.getTime();
}
