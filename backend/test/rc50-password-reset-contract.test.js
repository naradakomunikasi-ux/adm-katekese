import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const up=fs.readFileSync(new URL('../../database/migrations/029_up.sql',import.meta.url),'utf8');
const down=fs.readFileSync(new URL('../../database/migrations/029_down.sql',import.meta.url),'utf8');
test('RC50 DB permits only one active reset token per user',()=>{
 assert.match(up,/UNIQUE INDEX/);
 assert.match(up,/password_reset_tokens\(user_id\)/);
 assert.match(up,/WHERE consumed_at IS NULL/);
 assert.match(down,/DROP INDEX/);
});
