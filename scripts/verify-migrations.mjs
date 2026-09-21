import fs from 'node:fs';
import path from 'node:path';

const dir = new URL('../database/migrations/', import.meta.url);
const names = fs.readdirSync(dir).filter(x => x.endsWith('.sql')).sort();
const up = names.filter(x => x.endsWith('_up.sql'));
const down = names.filter(x => x.endsWith('_down.sql'));
const errors = [];

for (const file of up) {
  const id = file.split('_')[0];
  if (!down.includes(`${id}_down.sql`)) errors.push(`Missing rollback for ${file}`);
  const sql = fs.readFileSync(new URL(`../database/migrations/${file}`, import.meta.url), 'utf8');
  if (!/CREATE|ALTER|INSERT|UPDATE|DELETE/i.test(sql)) errors.push(`Migration ${file} appears empty/non-mutating`);
}
for (const file of down) {
  const sql = fs.readFileSync(new URL(`../database/migrations/${file}`, import.meta.url), 'utf8');
  if (!/DROP|ALTER|DELETE|UPDATE/i.test(sql)) errors.push(`Rollback ${file} appears empty/non-mutating`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Migration verification PASS: ${up.length} up + ${down.length} down migrations paired.`);
