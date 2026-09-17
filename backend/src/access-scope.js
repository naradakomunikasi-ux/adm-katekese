export function canAccessParticipant(actor, participant) {
  if (!actor || !participant) return false;
  if (actor.role === 'PESERTA') return actor.sub === participant.userId || actor.sub === participant.user_id;
  return ['SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','PASTOR'].includes(actor.role);
}

export function scopeParticipantWhere(actor, startParameter = 1) {
  if (actor?.role === 'PESERTA') return { clause: `user_id = $${startParameter}`, params: [actor.sub] };
  return { clause: 'TRUE', params: [] };
}

export function canReadSensitivePayment(actor, participant) {
  if (!actor) return false;
  if (['SUPER_ADMIN','ADMIN_KATEKESE'].includes(actor.role)) return true;
  return actor.role === 'PESERTA' && canAccessParticipant(actor, participant);
}
