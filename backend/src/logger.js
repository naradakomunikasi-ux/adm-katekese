export function logEvent(level,event,fields={},sink=console.log){
 const record={timestamp:new Date().toISOString(),level,event,...fields}; sink(JSON.stringify(record)); return record;
}
export function redact(value){
 if(!value||typeof value!=='object')return value; const clone=structuredClone(value); for(const key of Object.keys(clone)){if(/password|token|secret|authorization|api.?key/i.test(key))clone[key]='[REDACTED]';else if(clone[key]&&typeof clone[key]==='object')clone[key]=redact(clone[key]);}return clone;
}
