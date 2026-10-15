/* Servidor de desenvolvimento local, sem dependências. Não é backend de pedidos. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

function createStaticServer(root) {
  const base = path.resolve(root);
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });response.end('Método não permitido');return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400);response.end('Endereço inválido');return; }
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) {
      response.writeHead(403);response.end('Acesso negado');return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!(relative === 'index.html' || /^(?:css|js|data|assets)\//.test(relative)) || !types[path.extname(relative).toLowerCase()]) {
      response.writeHead(404);response.end('Arquivo não encontrado');return;
    }
    const target = path.resolve(base, relative);
    if (!target.startsWith(base + path.sep)) { response.writeHead(403);response.end();return; }
    try {
      const real = await fs.realpath(target);
      const realBase = await fs.realpath(base);
      if (!real.startsWith(realBase + path.sep)) { response.writeHead(403);response.end();return; }
      const data = await fs.readFile(real);
      response.writeHead(200, { 'Content-Type': types[path.extname(relative).toLowerCase()], 'Content-Length': data.length });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch (error) {
      response.writeHead(['ENOENT','ENOTDIR','EISDIR'].includes(error.code) ? 404 : 500);
      response.end('Não foi possível abrir o arquivo');
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('PORT deve estar entre 1 e 65535.');process.exit(1); }
  const server = createStaticServer(path.resolve(__dirname, '..'));
  server.on('error', error => { console.error(`Não foi possível iniciar: ${error.message}`);process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Brasa Lanches: http://127.0.0.1:${port} — Ctrl+C para encerrar`));
}
module.exports = { createStaticServer };
