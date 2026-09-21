export function normalizeRateIdentity(value, maxLength = 160) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9@._:+-]/g, '').slice(0, maxLength) || 'anonymous';
}

export function fixedWindow(nowMs = Date.now(), windowMs = 60_000) {
  const safeWindow = Math.max(1_000, Number(windowMs) || 60_000);
  const bucket = Math.floor(Number(nowMs) / safeWindow);
  return { bucket, windowMs: safeWindow, resetAt: (bucket + 1) * safeWindow };
}

export function rateLimitKey(scope, identity, nowMs = Date.now(), windowMs = 60_000) {
  const { bucket } = fixedWindow(nowMs, windowMs);
  return `rl:${normalizeRateIdentity(scope, 40)}:${normalizeRateIdentity(identity)}:${bucket}`;
}

export function evaluateRate(count, limit, resetAt, nowMs = Date.now()) {
  const safeLimit = Math.max(1, Number(limit) || 1);
  const numeric = Math.max(0, Number(count) || 0);
  const retryAfterSeconds = Math.max(1, Math.ceil((Number(resetAt) - Number(nowMs)) / 1000));
  return {
    blocked: numeric > safeLimit,
    remaining: Math.max(0, safeLimit - numeric),
    retryAfterSeconds,
  };
}

export function pruneMemoryBuckets(map, currentBucket, maxEntries = 10_000) {
  if (!(map instanceof Map)) return 0;
  let removed = 0;
  for (const [key, value] of map) {
    if ((value?.bucket ?? currentBucket) < currentBucket - 1) {
      map.delete(key);
      removed += 1;
    }
  }
  if (map.size > maxEntries) {
    const overflow = map.size - maxEntries;
    let i = 0;
    for (const key of map.keys()) {
      map.delete(key); removed += 1; i += 1;
      if (i >= overflow) break;
    }
  }
  return removed;
}
