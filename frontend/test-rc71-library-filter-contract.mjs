import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const api=readFileSync(new URL('./src/api.js',import.meta.url),'utf8');
const css=readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
for(const token of ['Cari materi...','Semua Kategori','Semua Program','Semua Audience','Semua Status','libraryTabs','/library/context','programIds','program_scope','Program terkait'])assert.ok(app.includes(token),`missing ${token}`);
for(const token of ['X-File-Category','X-File-Program-Ids'])assert.ok(api.includes(token),`missing ${token}`);
for(const token of ['.libraryFilters','.libraryTabs','select[multiple]'])assert.ok(css.includes(token),`missing ${token}`);
console.log('RC71 library filter/program scope contract: 15/15 PASS');
