import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const pages=fs.readFileSync(new URL('./src/page-registry.js',import.meta.url),'utf8');
assert.match(pages,/AI & Integrasi/);
assert.match(pages,/\/system\/ai-config/);
for(const marker of ['Ask Miyu Admin','Primary LLM API URL','Cloud API URL','Embedding API URL','Drive Storage URL','Simpan AI & Integrasi']) assert.ok(app.includes(marker),`missing ${marker}`);
assert.ok(app.includes("api.put('/system/ai-config'"),'settings save API missing');
console.log('AI settings contract: 7/7 PASS');
