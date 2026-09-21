import fs from 'node:fs';
const source=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['request endpoint',source.includes("/auth/password-reset/request")],
 ['confirm endpoint',source.includes("/auth/password-reset/confirm")],
 ['generic privacy copy',source.includes('respons yang ditampilkan sama')],
 ['token minimum',source.includes('minLength=\"40\"')||source.includes('minLength={40}')],
 ['new password autocomplete',source.includes('autoComplete=\"new-password\"')],
 ['session revocation copy',source.includes('Semua sesi lama telah dihentikan')]
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL: ${name}`);console.log(`PASS: ${name}`)}
console.log(`${checks.length}/${checks.length} PASS`);
