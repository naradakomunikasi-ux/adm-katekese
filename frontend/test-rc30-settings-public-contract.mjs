import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const pages=fs.readFileSync(new URL('./src/page-registry.js',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../backend/src/api-catalog.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../backend/src/index.js',import.meta.url),'utf8');
const required=['Basis Pengetahuan Miyu','Audit Log','WhatsApp API URL','Beban Pengajar','Peserta Perlu Perhatian','/api/public/library','/api/knowledge/documents','/api/reports/teacher-workload',"status<>'ARCHIVED'"];
for(const token of required){if(!(app+api+index).includes(token)){console.error('Missing RC30 token:',token);process.exit(1);}}
for(const legacy of ["['participant-360'","['notifications'","['whatsapp'","['knowledge'"]){if(nav.includes(legacy)){console.error('Legacy navigation remains:',legacy);process.exit(1);}}
console.log('RC30 settings/public/report contract: PASS');
