const TTL_MS = 30_000;

export function normalizePermissionRows(rows = []) {
  const matrix = new Map();
  for (const row of rows) {
    const role = String(row.role_code || row.role || '').trim();
    const permission = String(row.permission_code || row.permission || '').trim();
    if (!role || !permission) continue;
    if (!matrix.has(role)) matrix.set(role, new Set());
    matrix.get(role).add(permission);
  }
  matrix.set('SUPER_ADMIN', new Set(['*']));
  return matrix;
}

export function createRbacStore({ pool, ttlMs = TTL_MS, now = () => Date.now() } = {}) {
  if (!pool?.query) throw new Error('RBAC pool is required');
  let cache = null;
  let loadedAt = 0;

  async function refresh() {
    const { rows } = await pool.query(`SELECT r.code role_code,p.code permission_code
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id=r.id
      LEFT JOIN permissions p ON p.id=rp.permission_id
      ORDER BY r.code,p.code`);
    cache = normalizePermissionRows(rows);
    loadedAt = now();
    return cache;
  }

  async function getMatrix({ force = false } = {}) {
    if (force || !cache || now() - loadedAt >= ttlMs) await refresh();
    return cache;
  }

  async function has(role, permission) {
    if (role === 'SUPER_ADMIN') return true;
    const matrix = await getMatrix();
    const permissions = matrix.get(role) || new Set();
    return permissions.has('*') || permissions.has(permission);
  }

  async function any(role, permissions = []) {
    if (role === 'SUPER_ADMIN') return true;
    const matrix = await getMatrix();
    const granted = matrix.get(role) || new Set();
    return granted.has('*') || permissions.some((permission) => granted.has(permission));
  }

  function invalidate() { cache = null; loadedAt = 0; }

  return { refresh, getMatrix, has, any, invalidate };
}
