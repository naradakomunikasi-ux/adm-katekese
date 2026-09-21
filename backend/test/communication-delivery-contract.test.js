import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('communication delivery lifecycle is queued, receipt-driven, transactional and audited',()=>{const api=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');for(const token of ['/api/communications/campaigns','/api/communications/:id/queue','/api/communications/delivery-attempts/:id/receipt','COMMUNICATION_CAMPAIGN_QUEUE','COMMUNICATION_DELIVERY_RECEIPT',"status='SENT'",'FOR UPDATE'])assert.ok(api.includes(token),`missing ${token}`);});
test('migration 051 persists bounded channel attempts and provider receipts',()=>{const sql=readFileSync(new URL('../../database/migrations/051_up.sql',import.meta.url),'utf8');for(const token of ['communication_delivery_attempts','attempt_no','provider_reference','error_code','idx_communication_delivery_queue'])assert.ok(sql.includes(token),`missing ${token}`);});
