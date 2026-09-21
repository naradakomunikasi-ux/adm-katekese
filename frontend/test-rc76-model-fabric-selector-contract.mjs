import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
for(const marker of ['7DNA MODEL FABRIC','7DNA Capability','ClassNote AI Model','Engine Utama','/system/ai-model-options','selectedCapabilityCode','classNoteModelCode','primaryEngineCode','Human governed']) assert.ok(app.includes(marker),`missing ${marker}`);
assert.ok(app.includes('Keputusan pastoral tetap berada pada Pastor/manusia berwenang'),'human authority notice missing');
console.log('RC76 Model Fabric selector contract: 10/10 PASS');
