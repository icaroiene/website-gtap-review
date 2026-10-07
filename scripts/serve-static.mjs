import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve(process.argv[2] || 'out');
const port = Number(process.env.PORT || 4173);
const gzipEnabled = process.env.GTAP_PREVIEW_GZIP === '1';
const gzipTypes = new Set([
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'application/xml',
  'image/svg+xml',
]);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

function acceptsGzip(header = '') {
  return header.split(',').some((encoding) => {
    const [name, ...parameters] = encoding.trim().split(';');
    if (name.trim() !== 'gzip') return false;
    const quality = parameters
      .map((parameter) => parameter.trim())
      .find((parameter) => parameter.startsWith('q='));
    return !quality || Number(quality.slice(2)) > 0;
  });
}

function parseByteRange(header, size) {
  if (!header?.startsWith('bytes=') || header.includes(',')) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0 || size === 0) return null;
    return { start: Math.max(0, size - suffixLength), end: size - 1 };
  }

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start >= size ||
    requestedEnd < start
  ) {
    return null;
  }
  return { start, end: Math.min(requestedEnd, size - 1) };
}

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403, { 'Content-Length': '0' }).end();
      return;
    }

    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const info = await stat(file);
    const body = await readFile(file);
    const contentType = types[extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };

    if (extname(file).toLowerCase() === '.mp4') {
      headers['Accept-Ranges'] = 'bytes';
      if (req.headers.range) {
        const range = parseByteRange(req.headers.range, info.size);
        if (!range) {
          res.writeHead(416, {
            ...headers,
            'Content-Range': `bytes */${info.size}`,
            'Content-Length': '0',
          }).end();
          return;
        }

        const partialBody = body.subarray(range.start, range.end + 1);
        res.writeHead(206, {
          ...headers,
          'Content-Range': `bytes ${range.start}-${range.end}/${info.size}`,
          'Content-Length': String(partialBody.length),
        });
        res.end(req.method === 'HEAD' ? undefined : partialBody);
        return;
      }
    }

    let responseBody = body;
    const baseType = contentType.split(';', 1)[0];
    if (gzipEnabled && gzipTypes.has(baseType)) {
      headers.Vary = 'Accept-Encoding';
      if (acceptsGzip(req.headers['accept-encoding'])) {
        responseBody = gzipSync(body);
        headers['Content-Encoding'] = 'gzip';
      }
    }

    headers['Content-Length'] = String(responseBody.length);
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : responseBody);
  } catch {
    let body = await readFile(resolve(root, '404.html')).catch(() => Buffer.from('Not found'));
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
    };
    if (gzipEnabled) {
      headers.Vary = 'Accept-Encoding';
      if (acceptsGzip(req.headers['accept-encoding'])) {
        body = gzipSync(body);
        headers['Content-Encoding'] = 'gzip';
      }
    }
    headers['Content-Length'] = String(body.length);
    res.writeHead(404, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  }
});

server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Static preview: http://127.0.0.1:${address.port}`);
});
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
