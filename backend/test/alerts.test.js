import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAlerts } from '../src/alerts.js';

test('healthy signals do not alert',()=> assert.deepEqual(evaluateAlerts({fiveXxRatePercent:1,diskUsagePercent:40,restartCount:0}),[]));
test('critical availability and restart alerts are raised',()=>{
 const codes=evaluateAlerts({apiUnavailableSeconds:90,dbUnavailableSeconds:45,restartCount:4}).map(x=>x.code);
 assert.deepEqual(codes,['API_UNAVAILABLE','DB_UNAVAILABLE','RESTART_LOOP']);
});
test('high operational alerts are raised',()=>{
 const codes=evaluateAlerts({redisUnavailableSeconds:31,fiveXxRatePercent:8,diskUsagePercent:90}).map(x=>x.code);
 assert.deepEqual(codes,['REDIS_UNAVAILABLE','HIGH_5XX_RATE','DISK_USAGE_HIGH']);
});

test('latency SLO alert is raised above p95 threshold',()=>{
 const codes=evaluateAlerts({apiP95Ms:751}).map(x=>x.code);
 assert.deepEqual(codes,['HIGH_API_LATENCY']);
 assert.equal(evaluateAlerts({apiP95Ms:750}).length,0);
});
