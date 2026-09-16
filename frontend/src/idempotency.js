export function createIdempotencyKey(prefix='mutation') {
  const safe=String(prefix).replace(/[^A-Za-z0-9._:-]/g,'-').slice(0,40) || 'mutation';
  const random=globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
  return `${safe}:${random}`.slice(0,128);
}
