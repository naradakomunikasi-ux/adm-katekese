import fs from 'node:fs';
import assert from 'node:assert/strict';
for (const target of ['backend','frontend']) {
  const dockerfile=fs.readFileSync(`${target}/Dockerfile`,'utf8');
  assert.ok(dockerfile.includes('package-lock.json'),`${target} Dockerfile must require package-lock.json`);
  assert.match(dockerfile,/\bnpm ci\b/,`${target} Dockerfile must use npm ci`);
  assert.doesNotMatch(dockerfile,/\bnpm install\b/,`${target} Dockerfile must not use npm install`);
}
const frontend=fs.readFileSync('frontend/Dockerfile','utf8');
assert.match(frontend,/USER nginx/,'frontend runtime must be non-root');
assert.match(frontend,/EXPOSE 8080/,'frontend non-root nginx must use unprivileged port');
assert.match(frontend,/release\.json/,'frontend health must attest release metadata');
const backend=fs.readFileSync('backend/Dockerfile','utf8');
assert.match(backend,/\/api\/ready/,'backend image health must use dependency-backed readiness');
assert.match(backend,/USER node/,'backend runtime must be non-root');
const compose=fs.readFileSync('docker-compose.yml','utf8');
const version=fs.readFileSync('VERSION','utf8').trim();
assert.match(compose,/proxy|frontend/s);
assert.ok(compose.includes('condition: service_healthy'),'compose must gate dependencies on health');
assert.ok(compose.includes('read_only: true'),'application containers must include read-only root filesystem hardening');
assert.ok(compose.includes('APP_VERSION: ${APP_VERSION:-'+version+'}'),'compose fallback must match release');
console.log(JSON.stringify({status:'PASS',contract:'docker-reproducible-release-attestation',checks:10},null,2));
