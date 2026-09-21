import assert from 'node:assert/strict';
import { createIdempotencyKey } from './src/idempotency.js';
const a=createIdempotencyKey('payment-verify'),b=createIdempotencyKey('payment-verify');
assert.ok(a.length>=16&&a.length<=128);assert.notEqual(a,b);assert.match(a,/^[A-Za-z0-9._:-]+$/);
console.log('frontend idempotency contract: 3/3 PASS');
