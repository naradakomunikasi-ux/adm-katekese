import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const checks=[
  [!app.includes("['Pembayaran belum selesai'"),'dashboard does not expose payment metric in pastoral KPI cards'],
  [!app.includes("['Persetujuan menunggu'"),'dashboard does not expose approval metric in general KPI cards'],
  [/PESERTA:[^\n]*'payments'/.test(nav),'participant navigation exposes own payment page'],
  [!(/PASTOR:[^\n]*'payments'/.test(nav)),'pastor navigation does not expose payments'],
  [!(/KATEKIS:[^\n]*'payments'/.test(nav)),'katekis navigation does not expose payments'],
  [!(/ADMIN_PROGRAM:[^\n]*'payments'/.test(nav)),'admin program navigation does not expose payments without finance permission'],
];
let pass=0; for(const [ok,name] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`${pass}/${checks.length} PASS`); if(pass!==checks.length)process.exit(1);
