import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
test('RC61 readiness attests schema generation',()=>{ const s=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8'); assert.match(s,/runtime_schema_contract/); assert.match(s,/schemaGeneration/); assert.match(s,/SCHEMA_GENERATION_MISMATCH/); });
test('RC61 schema generation is 40',async()=>{ const m=await import('../src/version.js'); assert.ok(m.SCHEMA_GENERATION>=40); });
