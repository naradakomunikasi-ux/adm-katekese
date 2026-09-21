export const KNOWLEDGE_SCOPES = ['PUBLIC','PARTICIPANT','PASTORAL','INTERNAL'];

export function scopesForRole(role) {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN_KATEKESE':
    case 'ADMIN_PROGRAM': return [...KNOWLEDGE_SCOPES];
    case 'PASTOR':
    case 'KATEKIS': return ['PUBLIC','PARTICIPANT','PASTORAL'];
    case 'PESERTA': return ['PUBLIC','PARTICIPANT'];
    default: return ['PUBLIC'];
  }
}

export function canReadKnowledgeScope(role, scope) {
  return scopesForRole(role).includes(String(scope || '').toUpperCase());
}

export function detectPromptInjection(query='') {
  const text=String(query).toLowerCase();
  const patterns=[
    /ignore (all|any|the|previous|prior).{0,24}(instruction|prompt|rule)/,
    /reveal.{0,24}(system prompt|hidden prompt|developer message)/,
    /bypass.{0,24}(safety|policy|permission|authorization)/,
    /act as.{0,24}(system|developer|administrator)/,
    /abaikan.{0,24}(instruksi|aturan|prompt)/,
    /tampilkan.{0,24}(system prompt|prompt sistem|instruksi tersembunyi)/,
    /lewati.{0,24}(otorisasi|izin|kebijakan|aturan)/
  ];
  return patterns.some((pattern)=>pattern.test(text));
}
