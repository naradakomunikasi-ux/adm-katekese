import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
for(const token of ['JOURNEY STATUS','ADMINISTRATIVE STATUS','PASTORAL STATUS','Tinjau Kesiapan Pastoral','Keputusan manusia; tidak ditentukan otomatis oleh rule.','/service-profile','/journey-status','/pastoral-status','Perlu Perhatian']) assert.ok(app.includes(token),`missing ${token}`);
for(const token of ['statusSeparationGrid','participantJourneyVisual','readinessReview','attentionPeople']) assert.ok(css.includes(token),`missing ${token}`);
console.log('RC65 participant journey/status UX contract: 13/13 PASS');
