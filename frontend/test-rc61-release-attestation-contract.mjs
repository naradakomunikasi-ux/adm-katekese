import fs from 'node:fs'; import assert from 'node:assert/strict';
const docker=fs.readFileSync('Dockerfile','utf8'); const nginx=fs.readFileSync('nginx.conf','utf8'); const writer=fs.readFileSync('scripts/write-release-metadata.mjs','utf8');
const checks=[()=>assert.match(docker,/USER nginx/),()=>assert.match(docker,/EXPOSE 8080/),()=>assert.match(nginx,/listen 8080/),()=>assert.match(writer,/schemaGeneration=[1-9][0-9]*/ ),()=>assert.match(writer,/release\.json/),()=>assert.match(JSON.parse(fs.readFileSync('package.json','utf8')).scripts.build,/write-release-metadata/)];
checks.forEach(fn=>fn()); console.log(`RC61 frontend release attestation contract PASS: ${checks.length}/${checks.length}`);
