import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute, sep } from 'node:path';

const root = await realpath(process.cwd());
const publicFolders = ['assets/', 'css/', 'js/', 'paginas/'];
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

function outsideRoot(path) {
  const rel = relative(root, path);
  return rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel);
}

http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const aliases = {
      '/produtos.html': '/paginas/produtos/produtos.html',
      '/sobre.html': '/paginas/sobre/sobre.html',
      '/entregas.html': '/paginas/entregas/entregas.html',
      '/contato.html': '/paginas/contato/contato.html',
      '/carrinho.html': '/paginas/carrinho/carrinho.html',
      '/tabelas.html': '/paginas/tabelas/tabelas.html',
      '/produto-bicicleta.html': '/paginas/produto-bicicleta/produto-bicicleta.html',
      '/produto-capacete.html': '/paginas/produto-capacete/produto-capacete.html',
      '/produto-camara.html': '/paginas/produto-camara/produto-camara.html',
      '/produto-bolsa.html': '/paginas/produto-bolsa/produto-bolsa.html',
    };
    if (aliases[pathname]) {
      res.writeHead(302, { Location: aliases[pathname] + new URL(req.url, 'http://localhost').search });
      res.end();
      return;
    }
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    const rootHtml = !file.includes('/') && file.endsWith('.html');
    const allowedFolder = publicFolders.some((folder) => file.startsWith(folder));
    if (file.includes('\\') || file.split('/').some((part) => part.startsWith('.')) || (!rootHtml && !allowedFolder)) {
      throw new Error('Arquivo privado');
    }
    const path = await realpath(resolve(root, file));
    if (outsideRoot(path)) throw new Error('Fora do projeto');
    const content = await readFile(path);
    res.writeHead(200, {
      'Content-Type': mime[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    const content = await readFile(resolve(root, 'paginas/erro/404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : content);
  }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => {
  console.log('Ciclo Dias disponível na porta ' + (process.env.PORT || 3000));
});
