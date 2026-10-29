import {createOnServer} from '../src/server.mjs';
import {readFile} from 'node:fs/promises';
import {readPc} from './pc-readings.mjs';
// 제공 서버 파일은 보존하고 학생 전용 읽기 경로만 추가합니다.
const server=createOnServer();
const original=server.listeners('request');server.removeAllListeners('request');
let inFlight=null;
const port=Number(process.env.ON_PORT??5195);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('INVALID_PORT');
server.on('request',async(req,res)=>{
 const allowed=new Set(['127.0.0.1:'+port,'localhost:'+port]);
 if(!allowed.has(req.headers.host)||req.headers.origin&&!new Set(['http://127.0.0.1:'+port,'http://localhost:'+port]).has(req.headers.origin)){res.writeHead(403);res.end('Local app requests only');return;}
 let pathname;try{pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;}catch{res.writeHead(400);res.end();return;}
 if(!['/daily','/api/student/pc'].includes(pathname)){for(const handler of original)handler.call(server,req,res);return;}
 if(req.method!=='GET'||req.url.includes('?')){res.writeHead(405);res.end('Read-only endpoint');return;}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(pathname==='/daily'){res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'");res.end(await readFile(new URL('./daily.html',import.meta.url)));}
  else{inFlight??=readPc().finally(()=>{inFlight=null;});const result=await inFlight;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));}
 }catch{res.writeHead(503,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({status:'unverifiable',reason:'PC 조회에 실패했습니다. 잠시 후 직접 다시 조회하세요.'}));}
});
server.listen(port,'127.0.0.1',()=>console.log('케셰브 일상 대시보드: http://127.0.0.1:'+port+'/daily'));
