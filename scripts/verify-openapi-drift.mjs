import { API_ENDPOINTS } from '../backend/src/api-catalog.js';
import { openApiContract } from '../backend/src/openapi-contract.js';

function normalize(path){ return path.replace(/:([A-Za-z0-9_]+)/g,'{$1}'); }
const documented=new Set();
for(const [path,item] of Object.entries(openApiContract.paths||{})){
 for(const method of ['get','post','patch','delete','put']) if(item?.[method]) documented.add(`${method.toUpperCase()} ${path}`);
}
const catalog=new Set(API_ENDPOINTS.map(([method,path])=>`${method} ${normalize(path)}`));
const ignored=new Set(['GET /api/openapi.json']);
const missing=[...catalog].filter(x=>!documented.has(x));
const orphaned=[...documented].filter(x=>!catalog.has(x)&&!ignored.has(x));
if(missing.length||orphaned.length){
 console.error(JSON.stringify({status:'FAIL',missing,orphaned},null,2)); process.exit(1);
}
console.log(`OpenAPI drift PASS: ${catalog.size} catalog endpoints documented, ${orphaned.length} orphaned.`);
