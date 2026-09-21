import crypto from 'node:crypto';

const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 3600);

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 10) {
    throw new Error('Password must be at least 10 characters');
  }
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

export function signToken(payload, secret, ttlSeconds = TOKEN_TTL_SECONDS) {
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds };
  const encoded = b64url(JSON.stringify(body));
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyToken(token, secret) {
  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature || !secret) return null;
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export const rolePermissions = {
  SUPER_ADMIN: ['*'],
  ADMIN_KATEKESE: ['ai:settings:read','ai:settings:write','participant:read','participant:write','document:verify','payment:verify','approval:prepare','task:write','report:read','knowledge:read','library:read','library:write','program:read','program:write','meeting:write'],
  ADMIN_PROGRAM: ['participant:read','participant:write','document:verify','attendance:write','task:write','knowledge:read','library:read','library:write','program:read','program:write','meeting:write'],
  KATEKIS: ['participant:read_assigned','attendance:write','meeting:read','material:read','knowledge:read','library:read'],
  PASTOR: ['participant:read','approval:decide','interview:write','certificate:approve','knowledge:read','report:read','library:read'],
  PESERTA: ['self:read','self:write','document:upload','schedule:read','knowledge:read','library:read']
};

export function hasPermission(role, permission) {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

export function sanitizeText(value, maxLength = 500) {
  return String(value ?? '').replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, maxLength);
}

export function assertUuid(value) {
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
  if (!ok) throw new Error('Invalid UUID');
  return value;
}
