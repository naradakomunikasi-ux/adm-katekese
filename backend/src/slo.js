export const DEFAULT_SLO = Object.freeze({
  availabilityTarget: 99.9,
  p95LatencyMs: 750,
  maxFiveXxRatePercent: 1,
  readinessTarget: 99.9,
});

export function calculateAvailability(totalRequests, failedRequests) {
  const total = Number(totalRequests || 0);
  const failed = Math.max(0, Number(failedRequests || 0));
  if (total <= 0) return 100;
  return Number((((total - Math.min(failed, total)) / total) * 100).toFixed(4));
}

export function errorBudgetMinutes(windowDays = 30, target = DEFAULT_SLO.availabilityTarget) {
  const minutes = Number(windowDays) * 24 * 60;
  return Number((minutes * ((100 - Number(target)) / 100)).toFixed(2));
}

export function evaluateSlo(input = {}, slo = DEFAULT_SLO) {
  const availability = calculateAvailability(input.totalRequests, input.failedRequests);
  const fiveXxRatePercent = input.totalRequests > 0
    ? Number(((Number(input.fiveXxResponses || 0) / Number(input.totalRequests)) * 100).toFixed(4))
    : 0;
  const p95LatencyMs = Number(input.p95LatencyMs || 0);
  const readinessPercent = Number(input.readinessPercent ?? 100);
  const breaches = [];
  if (availability < slo.availabilityTarget) breaches.push({code:'AVAILABILITY_SLO_BREACH',actual:availability,target:slo.availabilityTarget});
  if (p95LatencyMs > slo.p95LatencyMs) breaches.push({code:'LATENCY_SLO_BREACH',actual:p95LatencyMs,target:slo.p95LatencyMs});
  if (fiveXxRatePercent > slo.maxFiveXxRatePercent) breaches.push({code:'ERROR_RATE_SLO_BREACH',actual:fiveXxRatePercent,target:slo.maxFiveXxRatePercent});
  if (readinessPercent < slo.readinessTarget) breaches.push({code:'READINESS_SLO_BREACH',actual:readinessPercent,target:slo.readinessTarget});
  return {pass:breaches.length===0,availability,fiveXxRatePercent,p95LatencyMs,readinessPercent,breaches};
}
