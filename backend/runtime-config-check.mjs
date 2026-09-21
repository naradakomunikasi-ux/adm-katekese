import { APP_VERSION } from './src/version.js';
import { validateRuntimeConfig } from './src/runtime-config.js';

const result=validateRuntimeConfig(process.env,{expectedVersion:APP_VERSION,allowPlaceholders:process.env.NODE_ENV!=='production'});
const safe={ok:result.ok,errors:result.errors,warnings:result.warnings,diagnostics:result.diagnostics};
console.log(JSON.stringify(safe,null,2));
process.exit(result.ok?0:1);
