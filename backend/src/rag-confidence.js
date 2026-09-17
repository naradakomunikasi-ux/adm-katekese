import { KNOWLEDGE_INSUFFICIENT_MESSAGE } from './rag.js';
export function shouldCallProvider(diagnostics = {}, {minimumConfidence = 'medium', minimumTopScore = 0.4} = {}) {
  const rank = { none: 0, low: 1, medium: 2, high: 3 };
  const confidence = String(diagnostics.confidence || 'none');
  const required = String(minimumConfidence || 'medium');
  const topScore = Number(diagnostics.topScore || 0);
  return (rank[confidence] ?? 0) >= (rank[required] ?? 2) && topScore >= Number(minimumTopScore || 0.4);
}

export function lowConfidenceFallback(query, evidence = [], diagnostics = {}) {
  const citations = (evidence || []).map((item, index) => ({
    index: index + 1,
    documentId: item.id,
    title: item.title,
    sourceUrl: item.sourceUrl || item.source_url || null,
    version: item.version || null,
    score: Number(item.score || 0),
  }));
  return {
    answer: KNOWLEDGE_INSUFFICIENT_MESSAGE,
    grounded: false,
    citations,
    provider: 'confidence-gate',
    degraded: true,
    degradedReason: 'LOW_RETRIEVAL_CONFIDENCE',
    retrievalDiagnostics: diagnostics,
  };
}
