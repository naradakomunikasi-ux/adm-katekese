import fs from 'node:fs'; import assert from 'node:assert/strict';
const deploy=fs.readFileSync('scripts/deploy-hostinger.sh','utf8');
const smoke=fs.readFileSync('scripts/smoke-deployment.sh','utf8'); const browser=fs.readFileSync('scripts/browser-uat-live.sh','utf8');
const nginx=fs.readFileSync('deployment/nginx.conf','utf8');
const checks=[
  ()=>assert.match(deploy,/APP_VERSION in \.env must equal VERSION/),
  ()=>assert.match(deploy,/frontend\/package-lock\.json backend\/package-lock\.json/),
  ()=>assert.match(deploy,/\/api\/ready/),
  ()=>assert.match(deploy,/\/release\.json/),
  ()=>assert.match(deploy,/SCHEMA_GENERATION_MISMATCH/),
  ()=>assert.match(deploy,/smoke-deployment\.sh/),
  ()=>assert.match(smoke,/schemaGeneration/),
  ()=>assert.match(smoke,/EXPECTED_VERSION/),
  ()=>assert.match(nginx,/proxy_pass http:\/\/frontend:8080/),
  ()=>assert.match(nginx,/client_max_body_size 60m/),
  ()=>assert.match(browser,/window-size="\$size"/),
  ()=>assert.match(browser,/desktop 1440,900/),
  ()=>assert.match(browser,/mobile 390,844/)
];
checks.forEach(fn=>fn());
console.log(`Deployment contract PASS: ${checks.length}/${checks.length}`);
