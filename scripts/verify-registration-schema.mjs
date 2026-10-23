import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=n=>fs.readFileSync(new URL('../db/'+n,import.meta.url),'utf8');
const sql=[read('001_foundation_mysql.sql'),read('002_cycle016_mysql.sql'),read('003_role_assignments_mysql.sql')];
const all=sql.join('\n');
for(const table of ['app_users','program_catalog','participants','guardian_links','registrations','registration_events','role_assignments','user_sessions'])
  assert.match(all,new RegExp('CREATE TABLE IF NOT EXISTS\\s+'+table+'\\b','i'));
assert.match(all,/UNIQUE KEY uq_participant_program \(participant_id,program_id\)/);
assert.match(all,/FOREIGN KEY\(participant_id\) REFERENCES participants\(id\)/);
assert.match(all,/FOREIGN KEY\(guardian_user_id\) REFERENCES app_users\(id\)/);
assert.match(all,/FOREIGN KEY\(registration_id\) REFERENCES registrations\(id\)/);
assert.match(all,/CONSTRAINT fk_assignment_user FOREIGN KEY\(user_id\) REFERENCES app_users\(id\)/);
assert.match(all,/CONSTRAINT fk_assignment_program FOREIGN KEY\(program_id\) REFERENCES program_catalog\(id\)/);
console.log('PASS: static MySQL contract. No actual SQL executed.');
