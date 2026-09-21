import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
test('notification read endpoints are owner scoped',()=>{assert.match(src,/WHERE id=\$1 AND user_id=\$2 AND channel='IN_APP'/);assert.match(src,/WHERE user_id=\$1 AND channel='IN_APP' AND read_at IS NULL/);});
test('notification list exposes read state and unread metadata',()=>{assert.match(src,/read_at,created_at FROM notifications WHERE user_id=\$1/);assert.match(src,/ok\(res,rows,\{unread\}\)/);});
