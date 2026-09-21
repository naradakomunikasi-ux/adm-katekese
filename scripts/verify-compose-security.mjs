import fs from 'node:fs';
const compose=fs.readFileSync('docker-compose.yml','utf8');
for(const marker of ['AUTH_SECRET','LLM_API_KEY','no-new-privileges:true','read_only: true']) if(!compose.includes(marker)) throw new Error(`compose hardening marker missing: ${marker}`);
const backend=fs.readFileSync('backend/Dockerfile','utf8');
for(const marker of ['/api/ready','USER node']) if(!backend.includes(marker)) throw new Error(`backend Docker hardening missing: ${marker}`);
const nginx=fs.readFileSync('deployment/nginx.conf','utf8');
for(const marker of ['nginx-health','X-Request-Id','X-Content-Type-Options','X-Frame-Options','server_tokens off']) if(!nginx.includes(marker)) throw new Error(`nginx hardening missing: ${marker}`);
console.log('container security contract PASS');
