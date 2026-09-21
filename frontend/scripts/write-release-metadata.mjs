import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const schemaGeneration=53;
const out={app:'adm-katekese-frontend',version:pkg.version,schemaGeneration};
const dir=new URL('../public/',import.meta.url);
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(new URL('release.json',dir),JSON.stringify(out,null,2)+'\n');
console.log(`release metadata: ${out.version} schema=${schemaGeneration}`);
