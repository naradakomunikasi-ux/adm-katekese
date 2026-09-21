export const LIBRARY_ACCESS_ROLES = Object.freeze(['PUBLIC','PESERTA','KATEKIS','ADMIN','PASTOR']);

const ROLE_TO_LIBRARY_ACCESS = Object.freeze({
  PESERTA:'PESERTA',
  KATEKIS:'KATEKIS',
  PASTOR:'PASTOR',
  ADMIN_KATEKESE:'ADMIN',
  ADMIN_PROGRAM:'ADMIN',
  SUPER_ADMIN:'ADMIN'
});

export function normalizeLibraryAccessRole(value,{defaultRole='PESERTA'}={}){
  const normalized=String(value||defaultRole).trim().toUpperCase();
  if(!LIBRARY_ACCESS_ROLES.includes(normalized)) throw new Error('INVALID_LIBRARY_ACCESS_ROLE');
  return normalized;
}

export function libraryReadableAccessRoles(role,{canManage=false}={}){
  if(canManage) return [...LIBRARY_ACCESS_ROLES];
  const mapped=ROLE_TO_LIBRARY_ACCESS[String(role||'').toUpperCase()];
  return mapped ? ['PUBLIC',mapped] : ['PUBLIC'];
}

export function canReadLibraryAccess(role,accessRole,{canManage=false}={}){
  return libraryReadableAccessRoles(role,{canManage}).includes(normalizeLibraryAccessRole(accessRole,{defaultRole:'PUBLIC'}));
}
