import fs from 'node:fs';
const docker=fs.readFileSync(new URL('./Dockerfile',import.meta.url),'utf8');
const nginx=fs.readFileSync(new URL('./nginx.conf',import.meta.url),'utf8');
if(!docker.includes('COPY nginx.conf /etc/nginx/conf.d/default.conf')) throw new Error('frontend nginx config not copied');
if(!nginx.includes('Content-Security-Policy')) throw new Error('frontend CSP missing');
console.log('RC35 runtime hardening frontend contract PASS');
