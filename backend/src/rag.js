const DEFAULT_TOP_K = Number(process.env.RETRIEVAL_TOP_K || 5);
const DEFAULT_THRESHOLD = Number(process.env.RETRIEVAL_SCORE_THRESHOLD || 0.2);

export function normalizeQuery(value, maxLength = 500) {
  return String(value ?? '')
    .replace(/[<>\u0000-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function tokenize(text) {
  return new Set(normalizeQuery(text).toLowerCase().split(/[^a-z0-9À-ÿ]+/).filter(Boolean));
}

export function lexicalScore(query, text) {
  const q = tokenize(query);
  const d = tokenize(text);
  if (!q.size || !d.size) return 0;
  let hit = 0;
  for (const token of q) if (d.has(token)) hit += 1;
  return hit / q.size;
}

export function retrieveKnowledge(query, documents, options = {}) {
  const topK = Math.max(1, Math.min(20, Number(options.topK || DEFAULT_TOP_K)));
  const threshold = Math.max(0, Math.min(1, Number(options.threshold ?? DEFAULT_THRESHOLD)));
  return (documents || [])
    .map((doc) => ({ ...doc, score: lexicalScore(query, `${doc.title || ''} ${doc.content || ''}`) }))
    .filter((doc) => doc.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function assembleContext(results, maxChars = 8000) {
  let used = 0;
  const evidence = [];
  for (const item of results || []) {
    const content = normalizeQuery(item.content, Math.min(3000, maxChars));
    if (!content) continue;
    if (used + content.length > maxChars) break;
    evidence.push({
      id: String(item.id),
      title: item.title || 'Dokumen',
      content,
      sourceUrl: item.source_url || item.sourceUrl || null,
      version: item.version || null,
      score: Number(item.score || 0)
    });
    used += content.length;
  }
  return evidence;
}

export function citationsFromEvidence(evidence) {
  return (evidence || []).map((item, index) => ({
    index: index + 1,
    documentId: item.id,
    title: item.title,
    sourceUrl: item.sourceUrl,
    version: item.version,
    score: item.score
  }));
}

export const KNOWLEDGE_INSUFFICIENT_MESSAGE = 'Informasi tersebut belum tersedia pada Basis Pengetahuan. Silakan hubungi Admin Katekese.';

export function groundedFallback(query, evidence) {
  if (!evidence?.length) {
    return {
      answer: KNOWLEDGE_INSUFFICIENT_MESSAGE,
      grounded: false,
      citations: []
    };
  }
  const primary = evidence[0];
  return {
    answer: `Berdasarkan sumber “${primary.title}”, informasi yang paling relevan telah ditemukan. Untuk keputusan pastoral atau administrasi penting, tetap lakukan verifikasi pada dokumen sumber.`,
    grounded: true,
    citations: citationsFromEvidence(evidence)
  };
}

export class LlmProvider {
  constructor({ baseUrl = '', apiKey = '', model = '' } = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
  }

  get configured() {
    return Boolean(this.baseUrl && this.apiKey && this.model);
  }

  async answer({ query, evidence }) {
    if (!this.configured) return groundedFallback(query, evidence);
    throw new Error('External LLM call intentionally disabled until provider contract and egress policy are approved.');
  }
}
