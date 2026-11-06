import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
http.createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+'/')&&path!==root)throw Error();const content=await readFile(path===root||path===root+'/'?root+'/index.html':path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'text/html; charset=utf-8','X-Content-Type-Options':'nosniff'});res.end(content);}catch{res.writeHead(404);res.end('Não encontrado');}}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Ciclo Dias disponível na porta '+(process.env.PORT||3000)));
