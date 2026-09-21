const endpoints = [
  ['GET','/api/health'], ['POST','/api/auth/login'], ['GET','/api/me'],
  ['GET','/api/dashboard'], ['GET','/api/tasks'], ['GET','/api/participants'],
  ['GET','/api/knowledge/search'], ['POST','/api/knowledge/ask'], ['GET','/api/metrics']
];
console.log(JSON.stringify({service:'adm-katekese-api', expectedEndpoints:endpoints, status:'contract-ready'}, null, 2));
