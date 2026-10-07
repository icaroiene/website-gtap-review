import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { backgroundStyles, download, optimizeImage } from './optimize-images.mjs';

test('background tokens select largest formats deterministically and omit remote media', () => {
  const image = { src: '/optimized/hash-640.webp', avifSrcSet: '/optimized/hash-320.avif 320w, /optimized/hash-640.avif 640w' };
  const manifest = { 'src/assets/Background Footer.webp': image, 'https://gtap.com.br/image.jpg': image };
  const css = backgroundStyles(manifest);
  assert.match(css, /--gtap-bg-src-assets-background-footer-webp:/);
  assert.match(css, /url\("\/optimized\/hash-640.avif"\) type\("image\/avif"\)/);
  assert.match(css, /url\("\/optimized\/hash-640.webp"\) type\("image\/webp"\)/);
  assert.doesNotMatch(css, /320|gtap\.com/);
  const reversed = Object.fromEntries(Object.entries(manifest).reverse());
  assert.equal(backgroundStyles(reversed), css);
});

test('responsive variants preserve orientation, avoid upscale and reuse files', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gtap-media-test-'));
  try {
    const input = await sharp({ create: { width: 200, height: 400, channels: 3, background: '#336699' } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const image = await optimizeImage(input, { outputDirectory: directory });
    assert.equal(image.width, 400);
    assert.equal(image.height, 200);
    assert.match(image.srcSet, /320w.*400w/);
    assert.doesNotMatch(image.srcSet, /640w/);
    const files = await readdir(directory);
    assert.equal(files.length, 4);
    const modificationTimes = await Promise.all(files.map(async (file) => (await stat(path.join(directory, file))).mtimeMs));
    for (const file of files) {
      const metadata = await sharp(path.join(directory, file)).metadata();
      const expectedWidth = Number(file.match(/-(\d+)\./)[1]);
      assert.equal(metadata.width, expectedWidth);
      assert.equal(metadata.height, expectedWidth / 2);
      assert.equal(metadata.format, file.endsWith('.webp') ? 'webp' : 'heif');
    }
    assert.deepEqual(await optimizeImage(input, { outputDirectory: directory }), image);
    assert.deepEqual(await Promise.all(files.map(async (file) => (await stat(path.join(directory, file))).mtimeMs)), modificationTimes);
    await assert.rejects(optimizeImage(Buffer.from('invalid image'), { outputDirectory: directory }));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('download limits origin, size and retries before surfacing failure', async () => {
  let attempts = 0;
  const failingFetch = async () => { attempts++; return new Response('', { status: 404 }); };
  await assert.rejects(download('https://example.com/image.jpg', { fetchImpl: failingFetch }), /Unapproved media origin/);
  assert.equal(attempts, 0);
  await assert.rejects(download('https://gtap.com.br/image.jpg', { fetchImpl: failingFetch }), /HTTP 404/);
  assert.equal(attempts, 3);
  await assert.rejects(download('https://gtap.com.br/image.jpg', {
    maxBytes: 2,
    fetchImpl: async () => new Response('oversized'),
  }), /byte limit/);
  const output = await download('https://gtap.com.br/image.jpg', {
    fetchImpl: async (_url, options) => {
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal);
      return new Response('ok');
    },
  });
  assert.equal(output.toString(), 'ok');
});
