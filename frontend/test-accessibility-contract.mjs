import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const checks=[
 ['document language',/<html lang="id">/i.test(index)],
 ['main navigation labelled',/aria-label="Navigasi utama"/.test(app)],
 ['mobile navigation labelled',/aria-label="Navigasi mobile"/.test(app)],
 ['login form labelled',/aria-labelledby="login-title"/.test(app)],
 ['alert semantics',/role="alert"/.test(app)],
 ['focus-visible styles',/:focus-visible/.test(css)],
 ['44px touch targets',/min-height:44px/.test(css)],
 ['mobile breakpoint',/@media\(max-width:720px\)/.test(css)],
];
for(const [name,pass] of checks) assert.ok(pass,name);
console.log(`accessibility contract: ${checks.length}/${checks.length} PASS`);
