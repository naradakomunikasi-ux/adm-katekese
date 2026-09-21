import test from 'node:test';
import assert from 'node:assert/strict';
import { API_ENDPOINTS, endpointCoverage } from '../src/api-catalog.js';

const required = [
 '/api/auth/login','/api/auth/logout','/api/me','/api/users','/api/roles','/api/permissions',
 '/api/programs','/api/batches','/api/participants','/api/documents','/api/payments','/api/meetings',
 '/api/attendance','/api/approvals','/api/tasks','/api/announcements','/api/notifications','/api/certificates',
 '/api/reports/summary','/api/library/files','/api/library/files/:id/download','/api/knowledge/search','/api/knowledge/ask','/api/audit-events','/api/health','/api/ready','/api/metrics'
];

test('production API catalog covers required domain endpoints',()=>{
 assert.deepEqual(endpointCoverage(required),[]);
 assert.ok(API_ENDPOINTS.length >= 30);
});

test('mutation endpoints are not accidentally public',()=>{
 const publicMutations = API_ENDPOINTS.filter(([m,p,perm])=>['POST','PATCH','PUT','DELETE'].includes(m) && perm==='public').map(([,p])=>p);
 assert.deepEqual(publicMutations.sort(), ['/api/auth/login','/api/auth/password-reset/confirm','/api/auth/password-reset/request','/api/public/registrations'].sort());
});
