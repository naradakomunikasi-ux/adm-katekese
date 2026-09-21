export const TOKEN_POLICY = Object.freeze({
  issuer: process.env.AUTH_ISSUER || 'adm-katekese',
  audience: process.env.AUTH_AUDIENCE || 'adm-katekese-web',
  maxClockSkewSeconds: 30,
});

export function attachTokenClaims(payload={},policy=TOKEN_POLICY){
  return {...payload,iss:policy.issuer,aud:policy.audience};
}

export function validateTokenClaims(payload,policy=TOKEN_POLICY){
  if(!payload||typeof payload!=='object')return {valid:false,reason:'MISSING_PAYLOAD'};
  if(payload.iss!==policy.issuer)return {valid:false,reason:'INVALID_ISSUER'};
  if(payload.aud!==policy.audience)return {valid:false,reason:'INVALID_AUDIENCE'};
  if(!payload.sub)return {valid:false,reason:'MISSING_SUBJECT'};
  if(!payload.jti)return {valid:false,reason:'MISSING_JTI'};
  return {valid:true};
}
