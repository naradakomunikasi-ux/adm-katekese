import assert from 'node:assert/strict';
import http from 'node:http';
import { createApiClient, ApiError } from './src/api.js';

const user={id:'00000000-0000-4000-8000-000000000001',fullName:'Admin Katekese',role:'ADMIN_KATEKESE'};
const token='contract-token';
const participants=[{id:'00000000-0000-4000-8000-000000000010',full_name:'Andreas Wijaya',program_name:'Baptis Dewasa',status:'ACTIVE'}];

const server=http.createServer(async(req,res)=>{
 res.setHeader('content-type','application/json'); res.setHeader('x-request-id','e2e-contract');
 let body=''; for await(const chunk of req) body+=chunk;
 const json=body?JSON.parse(body):{};
 const auth=req.headers.authorization;
 const ok=(data,status=200)=>{res.statusCode=status;res.end(JSON.stringify({ok:true,data,requestId:'e2e-contract'}));};
 const fail=(code,message,status)=>{res.statusCode=status;res.end(JSON.stringify({ok:false,error:{code,message},requestId:'e2e-contract'}));};
 if(req.url==='/api/auth/login'&&req.method==='POST') return json.email==='admin@example.test'&&json.password==='StrongPass123!'?ok({token,user,expiresAt:new Date(Date.now()+3600000).toISOString()}):fail('INVALID_CREDENTIALS','Email atau password salah.',401);
 if(req.url==='/api/auth/me') return auth===`Bearer ${token}`?ok(user):fail('UNAUTHORIZED','Autentikasi diperlukan.',401);
 if(req.url==='/api/dashboard') return auth===`Bearer ${token}`?ok({active_participants:1,pending_documents:2,pending_payments:1,pending_approvals:0}):fail('UNAUTHORIZED','Autentikasi diperlukan.',401);
 if(req.url?.startsWith('/api/participants')) return auth===`Bearer ${token}`?ok({items:participants,total:1,limit:25,offset:0}):fail('UNAUTHORIZED','Autentikasi diperlukan.',401);
 if(req.url==='/api/tasks/00000000-0000-4000-8000-000000000020/complete'&&req.method==='POST') return auth===`Bearer ${token}`?ok({id:'00000000-0000-4000-8000-000000000020',status:'DONE'}):fail('UNAUTHORIZED','Autentikasi diperlukan.',401);
 fail('NOT_FOUND','Tidak ditemukan.',404);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {port}=server.address();
let currentToken=null;
const api=createApiClient({baseUrl:`http://127.0.0.1:${port}/api`,getToken:()=>currentToken,timeout:1500});
let passed=0;
try{
 const session=await api.post('/auth/login',{email:'admin@example.test',password:'StrongPass123!'}); assert.equal(session.user.role,'ADMIN_KATEKESE'); currentToken=session.token; passed++;
 const me=await api.get('/auth/me'); assert.equal(me.id,user.id); passed++;
 const dash=await api.get('/dashboard'); assert.equal(dash.active_participants,1); passed++;
 const list=await api.get('/participants?limit=25&offset=0'); assert.equal(list.total,1); assert.equal(list.items[0].full_name,'Andreas Wijaya'); passed++;
 const task=await api.post('/tasks/00000000-0000-4000-8000-000000000020/complete',{}); assert.equal(task.status,'DONE'); passed++;
 currentToken='bad'; await assert.rejects(()=>api.get('/auth/me'),e=>e instanceof ApiError&&e.status===401&&e.code==='UNAUTHORIZED'); passed++;
 console.log(`E2E API client contract: ${passed}/6 PASS`);
} finally { await new Promise(resolve=>server.close(resolve)); }
