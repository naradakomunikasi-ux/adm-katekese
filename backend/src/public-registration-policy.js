import { sanitizeText } from './security.js';
import { validateEmail } from './validation.js';

export const PUBLIC_CONSENT_VERSION='registration-privacy-v1';
export function normalizePublicRegistration(input={}){
 const fullName=sanitizeText(input.fullName,160),email=validateEmail(input.email),phone=String(input.phone||'').trim().replace(/[^+0-9 -]/g,''),notes=sanitizeText(input.notes,1000);
 if(fullName.length<3||phone.replace(/\D/g,'').length<8||input.consent!==true)throw new Error('PUBLIC_REGISTRATION_INVALID');
 return {fullName,email,phone,notes:notes||null,programId:String(input.programId||''),batchId:input.batchId?String(input.batchId):null,consentVersion:PUBLIC_CONSENT_VERSION};
}
