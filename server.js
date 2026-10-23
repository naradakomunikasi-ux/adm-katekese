import express from 'express';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app=express();app.disable('x-powered-by');app.use(helmet({contentSecurityPolicy:false}));app.use(express.json({limit:'1mb'}));const root=path.dirname(fileURLToPath(import.meta.url));const port=Number(process.env.PORT||3000);let pool;
function db(){if(!pool){if(!process.env.DB_NAME||!process.env.DB_USER||!process.env.DB_PASSWORD)throw Error('DB settings not configured');pool=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:5,multipleStatements:false});}return pool;}
app.get('/health',(_req,res)=>res.json({status:'ok',version:'2.0.0-candidate'}));app.get('/ready',async(_req,res)=>{try{await db().query('SELECT 1');res.json({status:'ready',database:'mysql'});}catch{res.status(503).json({status:'not-ready'});}});app.use(express.static(path.join(root,'public')));app.use((_req,res)=>res.status(404).json({error:'not_found'}));app.listen(port,'0.0.0.0',()=>console.log('Listening on '+port));
