import test from 'node:test';import assert from 'node:assert/strict';import {logEvent,redact} from '../src/logger.js';
test('structured logger emits JSON',()=>{let raw='';const record=logEvent('info','test',{requestId:'abc'},v=>raw=v);assert.equal(JSON.parse(raw).requestId,'abc');assert.equal(record.event,'test');});
test('redaction hides credential-shaped fields recursively',()=>{const out=redact({password:'x',nested:{apiKey:'y',safe:'z'}});assert.equal(out.password,'[REDACTED]');assert.equal(out.nested.apiKey,'[REDACTED]');assert.equal(out.nested.safe,'z');});
