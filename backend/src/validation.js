import { sanitizeText } from './security.js';

export function validateEmail(value) {
  const email = sanitizeText(value,254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  return email;
}

export function validateLoginIdentity(value) {
  const identity = sanitizeText(value,254).toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity);
  const isUsername = /^[a-z0-9][a-z0-9._-]{2,63}$/.test(identity);
  if (!isEmail && !isUsername) throw new Error('Invalid login identity');
  return identity;
}

export function validatePasswordPolicy(value) {
  const password = String(value || '');
  const failures = [];
  if (password.length < 8) failures.push('min_length');
  if (!/[A-Z]/.test(password)) failures.push('uppercase');
  if (!/[a-z]/.test(password)) failures.push('lowercase');
  if (!/\d/.test(password)) failures.push('digit');
  if (!/[^A-Za-z0-9]/.test(password)) failures.push('symbol');
  if (failures.length) { const error = new Error('Weak password'); error.failures = failures; throw error; }
  return true;
}

export function validateParticipantCreate(body = {}) {
  const fullName = sanitizeText(body.fullName,160);
  const programId = sanitizeText(body.programId,64);
  const programName = sanitizeText(body.programName,120);
  const batchId = sanitizeText(body.batchId,64);
  if (fullName.length < 2) throw new Error('Invalid fullName');
  if (!programId && programName.length < 2) throw new Error('Invalid program');
  if (programId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(programId)) throw new Error('Invalid programId');
  if (batchId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(batchId)) throw new Error('Invalid batchId');
  return { fullName, programId: programId || null, programName, batchId: batchId || null };
}

export function normalizeSort(value, allow = ['created_at','full_name','status']) {
  const sort = String(value || 'created_at');
  if (!allow.includes(sort)) return 'created_at';
  return sort;
}
