import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../backend/src/api-catalog.js',import.meta.url),'utf8');
const required=[
  '/participants/${item.id}/progress',
  'Tandai Lengkap','Minta Perbaikan','Tandai Lunas','Setujui','Terbitkan','Cabut','Ajukan Review',
  '/api/certificates/generate','/api/certificates/:id/issue','/api/certificates/:id/revoke','/api/announcements/:id/status','/api/participants/:id/progress'
];
for(const token of required){if(!(app+api).includes(token)){console.error('Missing RC29 contract token:',token);process.exit(1);}}
console.log('RC29 service completion frontend/API contract: PASS');
