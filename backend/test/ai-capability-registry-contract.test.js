import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('AI capability registry is capability-first and keeps human authority',()=>{
 const sql=readFileSync(new URL('../../database/migrations/045_up.sql',import.meta.url),'utf8');
 assert.match(sql,/knowledge\.answer/);
 assert.match(sql,/deterministic_first/);
 assert.match(sql,/human_authority_required/);
 assert.match(sql,/action\.pastoral_decision/);
});
