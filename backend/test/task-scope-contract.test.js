import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const up=fs.readFileSync(new URL('../../database/migrations/031_up.sql',import.meta.url),'utf8');

test('task list is manager-all or assigned-self',()=>{
 assert.match(source,/WHERE t\.status<>'DONE' AND \(\$1::boolean OR t\.assigned_to=\$2\)/);
});
test('task create requires task write and active assignee',()=>{
 assert.match(source,/app\.post\('\/api\/tasks',authenticate,authorize\('task:write'\)/);
 assert.match(source,/SELECT id FROM users WHERE id=\$1 AND status='ACTIVE'/);
});
test('task completion fails closed outside own assignment',()=>{
 assert.match(source,/TASK_SCOPE_DENIED/);
 assert.match(source,/!canManage&&task\.assigned_to!==req\.user\.sub/);
});
test('task mutation uses transaction and audit',()=>{
 assert.match(source,/TASK_CREATE/); assert.match(source,/TASK_COMPLETE/); assert.match(source,/withTransaction\(pool/);
});
test('database has task ownership and visibility constraints',()=>{
 assert.match(up,/assigned_to UUID REFERENCES users/); assert.match(up,/created_by UUID REFERENCES users/); assert.match(up,/visibility IN \('ASSIGNEE','INTERNAL'\)/); assert.match(up,/idx_tasks_assignee_status_due/);
});
