import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import test from 'node:test';

const serverPath = fileURLToPath(new URL('./serve-static.mjs', import.meta.url));

function requestRaw(address, pathname, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(new URL(pathname, address), { method, headers }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks),
        });
      });
    });
    request.once('error', reject);
    request.end();
  });
}

async function createFixture() {
  const parent = await mkdtemp(join(tmpdir(), 'gtap-static-preview-'));
  const root = join(parent, 'site');
  await mkdir(root);
  await writeFile(join(root, 'index.html'), '<!doctype html><title>Preview</title>');
  await writeFile(join(root, 'style.css'), 'body { color: navy; }');
  await writeFile(join(root, 'movie.mp4'), Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  await writeFile(join(root, 'poster.avif'), Buffer.from([1]));
  await writeFile(join(root, 'logo.png'), Buffer.from([2]));
  await writeFile(join(root, 'photo.jpg'), Buffer.from([3]));
  await writeFile(join(root, 'font.woff'), Buffer.from([4]));
  await writeFile(join(parent, 'outside.txt'), 'outside the static root');
  return { parent, root };
}

async function startServer(root, { gzip = false } = {}) {
  const child = spawn(process.execPath, [serverPath, root], {
    env: {
      ...process.env,
      PORT: '0',
      GTAP_PREVIEW_GZIP: gzip ? '1' : '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const address = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Preview server did not start. ${stderr}`)), 5000);
    const checkOutput = () => {
      const match = /Static preview: (http:\/\/127\.0\.0\.1:\d+)/.exec(output);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    };
    child.stdout.on('data', checkOutput);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Preview server exited with ${code}. ${stderr}`));
    });
    checkOutput();
  });

  return {
    address,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await once(child, 'exit');
    },
  };
}

test('serves local assets, HEAD, 404, traversal protection, and MP4 byte ranges', async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const server = await startServer(fixture.root);
  t.after(() => server.stop());

  const assetTypes = [
    ['poster.avif', 'image/avif'],
    ['movie.mp4', 'video/mp4'],
    ['logo.png', 'image/png'],
    ['photo.jpg', 'image/jpeg'],
    ['font.woff', 'font/woff'],
  ];

  for (const [path, contentType] of assetTypes) {
    const response = await fetch(`${server.address}/${path}`);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('content-type'), contentType);
    assert.equal(Number(response.headers.get('content-length')), (await response.arrayBuffer()).byteLength);
  }

  const defaultHtml = await fetch(`${server.address}/index.html`);
  assert.equal(defaultHtml.headers.get('content-encoding'), null);

  const movie = await readFile(join(fixture.root, 'movie.mp4'));
  const fullVideo = await fetch(`${server.address}/movie.mp4`);
  assert.equal(fullVideo.headers.get('accept-ranges'), 'bytes');
  assert.deepEqual(Buffer.from(await fullVideo.arrayBuffer()), movie);

  const rangedVideo = await fetch(`${server.address}/movie.mp4`, { headers: { Range: 'bytes=2-5' } });
  assert.equal(rangedVideo.status, 206);
  assert.equal(rangedVideo.headers.get('content-range'), `bytes 2-5/${movie.length}`);
  assert.equal(rangedVideo.headers.get('content-length'), '4');
  assert.deepEqual(Buffer.from(await rangedVideo.arrayBuffer()), movie.subarray(2, 6));

  const suffixVideo = await fetch(`${server.address}/movie.mp4`, { headers: { Range: 'bytes=-3' } });
  assert.equal(suffixVideo.status, 206);
  assert.equal(suffixVideo.headers.get('content-range'), `bytes 7-9/${movie.length}`);
  assert.deepEqual(Buffer.from(await suffixVideo.arrayBuffer()), movie.subarray(7));

  const headRange = await fetch(`${server.address}/movie.mp4`, {
    method: 'HEAD',
    headers: { Range: 'bytes=1-3' },
  });
  assert.equal(headRange.status, 206);
  assert.equal(headRange.headers.get('content-range'), `bytes 1-3/${movie.length}`);
  assert.equal(headRange.headers.get('content-length'), '3');
  assert.equal((await headRange.arrayBuffer()).byteLength, 0);

  const invalidRange = await fetch(`${server.address}/movie.mp4`, { headers: { Range: 'bytes=20-' } });
  assert.equal(invalidRange.status, 416);
  assert.equal(invalidRange.headers.get('content-range'), `bytes */${movie.length}`);
  assert.equal(invalidRange.headers.get('content-length'), '0');

  const head = await fetch(`${server.address}/movie.mp4`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), String(movie.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  const notFound = await fetch(`${server.address}/missing.html`);
  assert.equal(notFound.status, 404);
  assert.equal(Number(notFound.headers.get('content-length')), (await notFound.arrayBuffer()).byteLength);

  const traversal = await fetch(`${server.address}/%2e%2e%2foutside.txt`);
  assert.equal(traversal.status, 403);
});

test('gzip is opt-in, limited to text assets, and emits a decodable response', async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const server = await startServer(fixture.root, { gzip: true });
  t.after(() => server.stop());

  const compressed = await requestRaw(server.address, '/index.html', {
    headers: { 'Accept-Encoding': 'gzip' },
  });
  assert.equal(compressed.status, 200);
  assert.equal(compressed.headers['content-encoding'], 'gzip');
  assert.match(compressed.headers.vary, /Accept-Encoding/i);
  assert.equal(Number(compressed.headers['content-length']), compressed.body.length);
  assert.equal(gunzipSync(compressed.body).toString(), await readFile(join(fixture.root, 'index.html'), 'utf8'));

  const identity = await requestRaw(server.address, '/style.css', {
    headers: { 'Accept-Encoding': 'gzip;q=0' },
  });
  assert.equal(identity.headers['content-encoding'], undefined);
  assert.equal(identity.headers.vary, 'Accept-Encoding');
  assert.equal(identity.body.toString(), await readFile(join(fixture.root, 'style.css'), 'utf8'));

  const image = await requestRaw(server.address, '/poster.avif', {
    headers: { 'Accept-Encoding': 'gzip' },
  });
  assert.equal(image.headers['content-encoding'], undefined);

  const missing = await requestRaw(server.address, '/missing.html', {
    headers: { 'Accept-Encoding': 'gzip' },
  });
  assert.equal(missing.status, 404);
  assert.equal(missing.headers['content-encoding'], 'gzip');
  assert.equal(gunzipSync(missing.body).toString(), 'Not found');
});
