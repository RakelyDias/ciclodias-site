import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute, sep } from 'node:path';

const root = await realpath(process.cwd());
const publicFiles = new Set(['index.html', 'style.css', 'app.js', 'logic.js', 'data.js']);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};
const outsideRoot = path => {
  const rel = relative(root, path);
  return rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel);
};
http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (file.includes('\\') || file.split('/').some(part => part.startsWith('.')) ||
      (!publicFiles.has(file) && !file.startsWith('assets/'))) throw new Error('Not public');
    const path = await realpath(resolve(root, file));
    if (outsideRoot(path)) throw new Error('Outside root');
    const content = await readFile(path);
    res.writeHead(200, {
      'Content-Type': mime[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': content.length, 'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : 'Não encontrado');
  }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => {
  console.log('Ciclo Dias disponível na porta ' + (process.env.PORT || 3000));
});
