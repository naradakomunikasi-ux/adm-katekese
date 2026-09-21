import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
for(const marker of ['7DNA MODEL FABRIC · RC77','Routing per 7DNA','Koneksi Model AI','URL API','Model default','API key','Uji Koneksi','Kembalikan ke Rekomendasi','Human authority','/system/ai/providers','/system/ai-routing']) assert.ok(app.includes(marker),marker);
for(const marker of ['aiFabricMetrics','dnaRouteGrid','@media(max-width:560px)']) assert.ok(css.includes(marker),marker);
console.log('RC77 AI Model Fabric frontend contract PASS');
