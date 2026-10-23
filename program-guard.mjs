import {evaluateAccess} from './access-contract.mjs';
// Express middleware factory; actor must come from verified backend auth, never request JSON.
export function requireProgramPermission(db,permission){
 return async function(req,res,next){
  try{
   const actorId=req.actor?.id;
   const programId=Number(req.params.programId ?? req.body?.programId);
   if(!Number.isSafeInteger(actorId)||actorId<1)return res.status(401).json({error:'login_required'});
   if(!Number.isSafeInteger(programId)||programId<1)return res.status(400).json({error:'invalid_program'});
   const [assignments]=await db().execute('SELECT user_id,role_name,program_id,starts_at,ends_at,revoked_at FROM role_assignments WHERE user_id=? AND (program_id=? OR program_id IS NULL)',[actorId,programId]);
   if(!assignments.some(a=>evaluateAccess({actorId,role:a.role_name,action:permission,assignment:a,targetProgramId:programId}).allow))
    return res.status(403).json({error:'forbidden'});
   req.authorizedProgramId=programId;return next();
  }catch(_e){return res.status(503).json({error:'authorization_unavailable'});}
 };
}
