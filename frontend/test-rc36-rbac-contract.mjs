import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../backend/src/index.js',import.meta.url),'utf8');
const rbac=fs.readFileSync(new URL('../backend/src/rbac-store.js',import.meta.url),'utf8');
const required=[
 ['frontend DB-driven RBAC UI',app.includes('RolePermissionManager')&&app.includes('/roles/${roleCode}/permissions')&&app.includes('Simpan Hak Akses')],
 ['backend role permission GET',api.includes("/api/roles/:roleCode/permissions")],
 ['backend role permission PUT',api.includes("app.put('/api/roles/:roleCode/permissions'")],
 ['backend authorization uses RBAC store',api.includes('rbacStore.has')&&api.includes('rbacStore.any')],
 ['RBAC store loads role_permissions',rbac.includes('LEFT JOIN role_permissions')&&rbac.includes('LEFT JOIN permissions')],
 ['super admin immutable',api.includes('IMMUTABLE_SUPER_ADMIN')],
 ['no hard-coded runtime hasPermission use',!api.includes('hasPermission(req.user')],
];
const failed=required.filter(([,ok])=>!ok);
if(failed.length){console.error(failed.map(([n])=>n).join('\n'));process.exit(1);} 
console.log(`RC36 RBAC contract PASS: ${required.length}/${required.length}`);
