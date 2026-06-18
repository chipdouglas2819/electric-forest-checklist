#!/usr/bin/env node
// Minimal zero-dependency static server for local preview/QA only (not shipped).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4178;
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p.endsWith('/')) p += 'index.html';
    const file = normalize(resolve(ROOT, '.' + p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log(`serving ${ROOT} at http://localhost:${PORT}`));
