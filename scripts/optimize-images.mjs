import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, stat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 20 * 1024 * 1024;
const RASTER = /\.(?:png|jpe?g|webp|avif)$/i;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const exists = async (file) => stat(file).then(() => true, () => false);

export async function collectSources(root = ROOT) {
  const sources = new Set();
  for (const filename of ['landing_page.json', 'galeria.json']) {
    const rows = JSON.parse(await readFile(path.join(root, 'public/api', filename), 'utf8'));
    for (const row of rows) {
      const source = row.mediaUrl || row.imageUrl;
      if (source && RASTER.test(new URL(source).pathname)) sources.add(source);
    }
  }
  async function walk(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      const filename = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await walk(filename);
      else if (RASTER.test(filename)) sources.add(filename);
    }
  }
  await walk('src/assets');
  sources.add('/preloadBanner.webp');
  return [...sources].sort();
}

export async function download(source, { fetchImpl = fetch, maxBytes = MAX_BYTES } = {}) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || url.hostname !== 'gtap.com.br' || url.port || url.username || url.password) {
    throw new Error(`Unapproved media origin: ${source}`);
  }
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Image exceeds byte limit');
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new Error('Image exceeds byte limit');
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error(`${source}: ${lastError.message}`);
}

export async function optimizeImage(input, { outputDirectory, urlPrefix = '/optimized' }) {
  if (input.length > MAX_BYTES) throw new Error('Image exceeds byte limit');
  const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  if (metadata.pages > 1) throw new Error('Animated media requires an explicit optimization policy');
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error('Image dimensions unavailable');
  const widths = [...new Set([320, 640, 960, 1440].filter((size) => size < width).concat(Math.min(width, 1440)))];
  const digest = hash(Buffer.concat([Buffer.from('gtap-media-v1-webp78-avif48-'), input])).slice(0, 20);
  await mkdir(outputDirectory, { recursive: true });
  const variants = { webp: [], avif: [] };
  for (const size of widths) {
    for (const format of ['webp', 'avif']) {
      const filename = `${digest}-${size}.${format}`;
      const destination = path.join(outputDirectory, filename);
      if (!(await exists(destination))) {
        const pipeline = sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: size, withoutEnlargement: true });
        const temporary = `${destination}.${randomUUID()}.tmp`;
        try {
          await pipeline[format]({ quality: format === 'webp' ? 78 : 48, effort: 4 }).toFile(temporary);
          await rename(temporary, destination);
        } finally {
          await rm(temporary, { force: true });
        }
      }
      variants[format].push({ src: `${urlPrefix}/${filename}`, width: size });
    }
  }
  return {
    src: variants.webp.at(-1).src,
    srcSet: variants.webp.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    avifSrcSet: variants.avif.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    width,
    height,
  };
}

export function backgroundStyles(manifest) {
  const declarations = Object.entries(manifest)
    .filter(([source]) => source.startsWith('src/assets/'))
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([source, image]) => {
      const token = `--gtap-bg-${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const avif = image.avifSrcSet.split(', ').at(-1).split(' ')[0];
      return `  ${token}: image-set(url("${avif}") type("image/avif"), url("${image.src}") type("image/webp"));`;
    });
  return `/* Generated by scripts/optimize-images.mjs. */\n:root {\n${declarations.join('\n')}\n}\n`;
}

async function writeIfChanged(target, serialized) {
  await mkdir(path.dirname(target), { recursive: true });
  if (!(await exists(target)) || await readFile(target, 'utf8') !== serialized) await writeFile(target, serialized);
}

export async function buildMedia({ root = ROOT, refresh = false } = {}) {
  const start = Date.now();
  const sources = await collectSources(root);
  const cache = path.join(root, '.cache/gtap-media');
  const outputDirectory = path.join(root, 'public/optimized');
  await mkdir(cache, { recursive: true });
  const manifest = {};
  const failures = [];
  let originalBytes = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < sources.length) {
      const source = sources[cursor++];
      try {
        let input;
        if (source.startsWith('https://')) {
          const cached = path.join(cache, hash(source));
          input = !refresh && await exists(cached) ? await readFile(cached) : await download(source);
          if (refresh || !(await exists(cached))) await writeFile(cached, input);
        } else {
          input = await readFile(path.join(root, source.startsWith('/') ? `public${source}` : source));
        }
        originalBytes += input.length;
        manifest[source] = await optimizeImage(input, { outputDirectory });
      } catch (error) {
        failures.push(`${source}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 3 }, worker));
  if (failures.length) throw new Error(`Required images failed (${failures.length}):\n${failures.join('\n')}`);
  const ordered = Object.fromEntries(sources.map((source) => [source, manifest[source]]));
  const target = path.join(root, 'src/data/generated-media.json');
  const serialized = `${JSON.stringify(ordered, null, 2)}\n`;
  await writeIfChanged(target, serialized);
  await writeIfChanged(path.join(root, 'src/styles/generated-media.css'), backgroundStyles(ordered));
  console.log(`Optimized ${sources.length} images; originals ${(originalBytes / 1024 / 1024).toFixed(2)} MiB; ${((Date.now() - start) / 1000).toFixed(1)}s. Cached downloads reused${refresh ? ' after refresh' : ''}.`);
  return ordered;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildMedia({ refresh: process.argv.includes('--refresh') }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
