import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const security=fs.readFileSync(path.join(root,'backend/src/security.js'),'utf8');
const migrations=fs.readdirSync(path.join(root,'database/migrations')).filter(f=>f.endsWith('_up.sql')).sort();
const sql=migrations.map(f=>fs.readFileSync(path.join(root,'database/migrations',f),'utf8')).join('\n');
const objectMatch=security.match(/export const rolePermissions\s*=\s*\{([\s\S]*?)\n\};/);
if(!objectMatch) throw new Error('rolePermissions catalog not found');
const appCodes=[...objectMatch[1].matchAll(/'([a-z_]+:[a-z_]+)'/g)].map(m=>m[1]);
const dbCodes=[...sql.matchAll(/'([a-z_]+:[a-z_]+)'/g)].map(m=>m[1]);
const missing=[...new Set(appCodes)].filter(code=>!dbCodes.includes(code)).sort();
if(missing.length){ console.error(`RBAC catalog parity FAIL. Missing DB permissions: ${missing.join(', ')}`); process.exit(1); }
console.log(`RBAC catalog parity PASS (${new Set(appCodes).size} application permission codes represented in migrations)`);
