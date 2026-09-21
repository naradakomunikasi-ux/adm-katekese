export const DEFAULT_THRESHOLDS = Object.freeze({
  apiUnavailableSeconds: 60,
  fiveXxRatePercent: 5,
  diskUsagePercent: 85,
  restartCount: 3,
  dbUnavailableSeconds: 30,
  redisUnavailableSeconds: 30,
  apiP95Ms: 750,
});

export function evaluateAlerts(input = {}, thresholds = DEFAULT_THRESHOLDS) {
  const alerts = [];
  const add = (code, severity, message) => alerts.push({ code, severity, message });
  if ((input.apiUnavailableSeconds || 0) >= thresholds.apiUnavailableSeconds) add('API_UNAVAILABLE','critical','API tidak tersedia melewati ambang.');
  if ((input.dbUnavailableSeconds || 0) >= thresholds.dbUnavailableSeconds) add('DB_UNAVAILABLE','critical','PostgreSQL tidak tersedia melewati ambang.');
  if ((input.redisUnavailableSeconds || 0) >= thresholds.redisUnavailableSeconds) add('REDIS_UNAVAILABLE','high','Redis tidak tersedia melewati ambang.');
  if ((input.fiveXxRatePercent || 0) >= thresholds.fiveXxRatePercent) add('HIGH_5XX_RATE','high','Rasio HTTP 5xx melewati ambang.');
  if ((input.diskUsagePercent || 0) >= thresholds.diskUsagePercent) add('DISK_USAGE_HIGH','high','Pemakaian disk melewati ambang.');
  if ((input.restartCount || 0) >= thresholds.restartCount) add('RESTART_LOOP','critical','Container mengalami restart berulang.');
  if ((input.apiP95Ms || 0) > thresholds.apiP95Ms) add('HIGH_API_LATENCY','high','Latensi API p95 melewati SLO.');
  return alerts;
}
