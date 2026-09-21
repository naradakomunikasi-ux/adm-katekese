function asSet(value) {
  if (value == null) return new Set();
  if (Array.isArray(value)) return new Set(value.filter(Boolean).map(String));
  return new Set([String(value)]);
}

function firstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return null;
}

function participantProgramId(participant) {
  return firstValue(participant, ['programId','program_id']);
}

function participantBatchId(participant) {
  return firstValue(participant, ['batchId','batch_id','programBatchId','program_batch_id']);
}

function participantUserId(participant) {
  return firstValue(participant, ['userId','user_id']);
}

function participantId(participant) {
  return firstValue(participant, ['id','participantId','participant_id']);
}

function matchesScopedAssignment(actor, participant, {
  programKeys = ['programIds','program_ids','assignedProgramIds','assigned_program_ids','programId','program_id'],
  batchKeys = ['batchIds','batch_ids','assignedBatchIds','assigned_batch_ids','batchId','batch_id'],
  participantKeys = ['participantIds','participant_ids','assignedParticipantIds','assigned_participant_ids'],
} = {}) {
  const programId = participantProgramId(participant);
  const batchId = participantBatchId(participant);
  const targetParticipantId = participantId(participant);

  const actorPrograms = new Set(programKeys.flatMap((key) => [...asSet(actor?.[key])]));
  const actorBatches = new Set(batchKeys.flatMap((key) => [...asSet(actor?.[key])]));
  const actorParticipants = new Set(participantKeys.flatMap((key) => [...asSet(actor?.[key])]));

  if (targetParticipantId && actorParticipants.has(targetParticipantId)) return true;
  if (batchId && actorBatches.has(batchId)) return true;
  if (programId && actorPrograms.has(programId)) {
    if (!batchId || actorBatches.size === 0) return true;
    return actorBatches.has(batchId);
  }
  return false;
}

export function canAccessParticipant(actor, participant) {
  if (!actor || !participant) return false;
  if (actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN_KATEKESE') return true;
  if (actor.role === 'PESERTA') return String(actor.sub || '') === String(participantUserId(participant) || '');
  if (actor.role === 'ADMIN_PROGRAM') return matchesScopedAssignment(actor, participant);
  if (actor.role === 'KATEKIS') {
    return matchesScopedAssignment(actor, participant, {
      programKeys:['programIds','assignedProgramIds','programId'],
      batchKeys:['batchIds','assignedBatchIds','batchId'],
      participantKeys:['participantIds','assignedParticipantIds','meetingParticipantIds'],
    });
  }
  if (actor.role === 'PASTOR') {
    return matchesScopedAssignment(actor, participant, {
      programKeys:['pastoralProgramIds','programIds','programId'],
      batchKeys:['pastoralBatchIds','batchIds','batchId'],
      participantKeys:['pastoralParticipantIds','participantIds'],
    });
  }
  return false;
}

export function scopeParticipantWhere(actor, startParameter = 1) {
  if (!actor) return { clause: 'FALSE', params: [] };
  if (actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN_KATEKESE') return { clause: 'TRUE', params: [] };
  if (actor.role === 'PESERTA') return { clause: `user_id = $${startParameter}`, params: [actor.sub] };

  const participantIds = [...asSet(actor.participantIds || actor.assignedParticipantIds || actor.pastoralParticipantIds || actor.meetingParticipantIds)];
  const batchIds = [...asSet(actor.batchIds || actor.assignedBatchIds || actor.pastoralBatchIds || actor.batchId)];
  const programIds = [...asSet(actor.programIds || actor.assignedProgramIds || actor.pastoralProgramIds || actor.programId)];
  const clauses = [];
  const params = [];
  let index = startParameter;

  if (participantIds.length) {
    clauses.push(`id = ANY($${index++}::uuid[])`);
    params.push(participantIds);
  }
  if (batchIds.length) {
    clauses.push(`batch_id = ANY($${index++}::uuid[])`);
    params.push(batchIds);
  }
  if (programIds.length) {
    clauses.push(`program_id = ANY($${index++}::uuid[])`);
    params.push(programIds);
  }

  return clauses.length ? { clause: `(${clauses.join(' OR ')})`, params } : { clause: 'FALSE', params: [] };
}

export function canReadSensitivePayment(actor, participant) {
  if (!actor) return false;
  if (['SUPER_ADMIN','ADMIN_KATEKESE'].includes(actor.role)) return true;
  return actor.role === 'PESERTA' && canAccessParticipant(actor, participant);
}
