import { API_ENDPOINTS } from './api-catalog.js';
import { APP_VERSION } from './version.js';

const publicPaths=new Set(['/api/health','/api/ready','/api/auth/login','/api/auth/password-reset/request','/api/auth/password-reset/confirm','/api/openapi.json']);
function normalize(path){return path.replace(/:([A-Za-z0-9_]+)/g,'{$1}');}
function operation(method,path,access){
 const success=method==='POST'?'200':'200';
 const responses={ [success]:{description:'Success'}, '400':{description:'Validation error'}, '401':{description:'Unauthorized'}, '403':{description:'Forbidden'}, '500':{description:'Internal server error'} };
 return {security:publicPaths.has(path)||access==='public'?[]:[{bearerAuth:[]}],responses};
}
const paths={
 '/api/openapi.json':{get:{security:[],responses:{'200':{description:'OpenAPI specification'}}}},
};
for(const [method,rawPath,access] of API_ENDPOINTS){
 const path=normalize(rawPath); paths[path]??={}; paths[path][method.toLowerCase()]=operation(method,rawPath,access);
}

export const openApiContract={
 openapi:'3.1.0',
 info:{title:'ADM Katekese API',version:APP_VERSION},
 paths,
 components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'ADM-SESSION'}}}
};

export function validateOpenApiContract(contract=openApiContract){
 const errors=[];
 if(contract.openapi!=='3.1.0')errors.push('openapi version must be 3.1.0');
 if(!contract.info?.title||!contract.info?.version)errors.push('info metadata missing');
 for(const [method,rawPath] of API_ENDPOINTS){const path=normalize(rawPath);if(!contract.paths?.[path]?.[method.toLowerCase()])errors.push(`missing operation ${method} ${path}`);}
 if(!contract.paths?.['/api/openapi.json']?.get)errors.push('missing OpenAPI endpoint');
 if(!contract.components?.securitySchemes?.bearerAuth)errors.push('bearerAuth missing');
 return {valid:errors.length===0,errors};
}
