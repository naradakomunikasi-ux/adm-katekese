import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PAGE_REGISTRY} from './src/page-registry.js';
for(const key of ['dashboard','participants','tasks']) assert.ok(PAGE_REGISTRY[key],`missing ${key}`);
const source=await readFile(new URL('./src/App.jsx',import.meta.url),'utf8');
for(const token of ['Login','403','offline','Dashboard']) assert.ok(source.includes(token),`workflow recovery token ${token}`);
console.log(JSON.stringify({suite:'browser-workflow-contract',checks:7,status:'PASS'}));
