// Cycle 018 preliminary deny-by-default policy.
// Production authorization MUST use persisted assignments and object scope.
const permissions={
 'Katekis':['attendance.validate','recovery.verify'],
 'Koordinator':['registration.verify','program.manage','recovery.assign','readiness.review'],
 'Sekretariat':['registration.verify','document.verify','staging.prepare'],
 'Romo / Approver':['approval.finalize'],
 'Admin Katekese':['registration.verify','program.manage','recovery.assign','readiness.review','document.verify'],
 'Super Admin':['system.configure','users.manage','roles.assign']
};
export function canMutate({role,permission,scope}){return scope===true&&(permissions[role]||[]).includes(permission)}
export function canReadParticipant({role,own,verifiedGuardian,revoked}){if(role==='Peserta')return own===true;if(role==='Orang Tua/Wali')return verifiedGuardian===true&&revoked!==true;return false}
