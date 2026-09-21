import { validateOpenApiContract, openApiContract } from '../backend/src/openapi-contract.js';
const result = validateOpenApiContract(openApiContract);
console.log(JSON.stringify({gate:'openapi-contract',status:result.valid?'PASS':'FAIL',pathCount:Object.keys(openApiContract.paths).length,errors:result.errors},null,2));
process.exit(result.valid?0:1);
