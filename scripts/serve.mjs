import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const port = Number(process.env.PORT || 5173);
const root = resolve(import.meta.dirname, '..', 'src');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Invalid path');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Soundscape Composer running at http://127.0.0.1:${port}`));
