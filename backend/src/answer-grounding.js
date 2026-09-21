export function citedIndexes(answer = '') {
  const indexes = new Set();
  for (const match of String(answer).matchAll(/\[(\d+)\]/g)) indexes.add(Number(match[1]));
  return [...indexes].sort((a,b)=>a-b);
}

export function validateAnswerGrounding(answer, evidence = []) {
  const text = String(answer || '').trim();
  const citations = citedIndexes(text);
  const invalid = citations.filter((index) => index < 1 || index > evidence.length);
  const valid = text.length > 0 && evidence.length > 0 && citations.length > 0 && invalid.length === 0;
  return {
    valid,
    citations,
    invalidCitations: invalid,
    evidenceCount: evidence.length,
    reason: !text ? 'EMPTY_ANSWER' : !evidence.length ? 'NO_EVIDENCE' : !citations.length ? 'MISSING_CITATIONS' : invalid.length ? 'INVALID_CITATIONS' : null,
  };
}
