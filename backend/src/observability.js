const startedAt = Date.now();
const counters = new Map();
const timings = new Map();
const MAX_TIMING_SAMPLES = 512;

function percentile(sorted, ratio) {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

export function incrementMetric(name, labels = {}) {
  const labelKey = Object.entries(labels).sort().map(([k,v]) => `${k}=${v}`).join(',');
  const key = labelKey ? `${name}{${labelKey}}` : name;
  counters.set(key, (counters.get(key) || 0) + 1);
}

export function observeMetric(name, valueMs) {
  const numeric = Math.max(0, Number(valueMs || 0));
  const current = timings.get(name) || { count: 0, totalMs: 0, maxMs: 0, samples: [] };
  current.count += 1;
  current.totalMs += numeric;
  current.maxMs = Math.max(current.maxMs, numeric);
  current.samples.push(numeric);
  if (current.samples.length > MAX_TIMING_SAMPLES) current.samples.shift();
  timings.set(name, current);
}

export function snapshotMetrics() {
  return {
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    counters: Object.fromEntries(counters),
    timings: Object.fromEntries([...timings].map(([k,v]) => {
      const sorted = [...v.samples].sort((a,b)=>a-b);
      return [k, {
        count: v.count,
        avgMs: v.count ? Number((v.totalMs / v.count).toFixed(2)) : 0,
        maxMs: v.maxMs,
        p50Ms: percentile(sorted, 0.50),
        p95Ms: percentile(sorted, 0.95),
        p99Ms: percentile(sorted, 0.99),
        sampleCount: sorted.length,
      }];
    }))
  };
}

export function requestMetricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    incrementMetric('http_requests_total', { method: req.method, status: res.statusCode });
    observeMetric('http_request_duration_ms', Date.now() - start);
  });
  next();
}
