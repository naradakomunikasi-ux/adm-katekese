import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const required=['Langkah {step} dari 7','Jenis Program','Perjalanan Peserta','Persyaratan','Komunikasi','Review & Publish','programTypeCode','journeyStages','Check-in peserta merupakan signal','keputusan pastoral'];
for(const token of required){if(!app.includes(token))throw new Error(`RC64 missing UI contract: ${token}`);}
console.log(`RC64 pastoral program builder contract: ${required.length}/${required.length} PASS`);
