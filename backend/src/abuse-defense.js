const SUSPICIOUS = [
  /(?:'|%27)\s*(?:or|and)\s+['"0-9]/i,
  /<script\b/i,
  /javascript:/i,
  /\.\.\//,
  /\bunion\s+select\b/i
];

export function classifyInputRisk(value) {
  const text = String(value ?? '');
  const matches = SUSPICIOUS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  return { suspicious: matches.length > 0, matches };
}

export function safeRedirectTarget(value) {
  const text = String(value ?? '/');
  if (!text.startsWith('/') || text.startsWith('//') || /[\r\n]/.test(text)) return '/';
  return text;
}
