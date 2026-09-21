import test from 'node:test';
import assert from 'node:assert/strict';
import { createRbacStore, normalizePermissionRows } from '../src/rbac-store.js';

test('normalizePermissionRows builds role permission matrix and super-admin wildcard', () => {
  const matrix = normalizePermissionRows([
    { role_code: 'ADMIN_KATEKESE', permission_code: 'program:write' },
    { role_code: 'KATEKIS', permission_code: 'attendance:write' },
  ]);
  assert.equal(matrix.get('ADMIN_KATEKESE').has('program:write'), true);
  assert.equal(matrix.get('KATEKIS').has('program:write'), false);
  assert.equal(matrix.get('SUPER_ADMIN').has('*'), true);
});

test('RBAC store reads database catalog, caches it, and can invalidate', async () => {
  let calls = 0;
  const pool = { query: async () => { calls += 1; return { rows: [{ role_code:'ADMIN_PROGRAM', permission_code:'program:write' }] }; } };
  const store = createRbacStore({ pool, ttlMs: 999999 });
  assert.equal(await store.has('ADMIN_PROGRAM','program:write'), true);
  assert.equal(await store.has('ADMIN_PROGRAM','approval:decide'), false);
  assert.equal(calls, 1);
  store.invalidate();
  assert.equal(await store.has('ADMIN_PROGRAM','program:write'), true);
  assert.equal(calls, 2);
});

test('RBAC store always grants SUPER_ADMIN without database lookup', async () => {
  const pool = { query: async () => { throw new Error('should not query'); } };
  const store = createRbacStore({ pool });
  assert.equal(await store.has('SUPER_ADMIN','anything'), true);
});
