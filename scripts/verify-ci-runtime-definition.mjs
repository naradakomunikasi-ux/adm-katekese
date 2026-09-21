import fs from 'node:fs';
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const required=[
  'permissions:', 'contents: read', 'concurrency:',
  'dependency-build:', 'docker-build:', 'runtime-compose-smoke:', 'integration-db:',
  'needs: dependency-build', 'docker compose build', 'docker compose up -d --build',
  '/api/health', '/api/ready', '/release.json', 'schemaGeneration',
  'APP_VERSION=$(cat VERSION)', 'docker compose restart backend',
  'docker compose logs --no-color --tail=200', 'browser-uat-live.sh', 'actions/upload-artifact@v4'
];
const missing=required.filter(x=>!ci.includes(x));
if(missing.length){console.error('CI runtime definition FAIL',missing);process.exit(1);}
if(/APP_VERSION:\s*1\.0\.0-rc\d+/.test(ci) && !ci.includes('APP_VERSION: 1.0.0-rc76')) {
  console.error('CI runtime definition FAIL: stale hard-coded APP_VERSION'); process.exit(1);
}
console.log(`CI runtime definition PASS: ${required.length}/${required.length}`);
