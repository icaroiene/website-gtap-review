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

export async function optimizeImage(input, { outputDirectory, urlPrefix = '/optimized', sizes = [320, 640, 960, 1440], formats = ['webp', 'avif'], name }) {
  if (input.length > MAX_BYTES) throw new Error('Image exceeds byte limit');
  const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  if (metadata.pages > 1) throw new Error('Animated media requires an explicit optimization policy');
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error('Image dimensions unavailable');
  const largest = Math.max(...sizes);
  const widths = [...new Set(sizes.filter((size) => size < width).concat(Math.min(width, largest)))];
  const digest = name ?? hash(Buffer.concat([Buffer.from('gtap-media-v1-webp78-avif48-'), input])).slice(0, 20);
  await mkdir(outputDirectory, { recursive: true });
  const variants = Object.fromEntries(formats.map((format) => [format, []]));
  for (const size of widths) {
    for (const format of formats) {
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
    ...(variants.avif && { avifSrcSet: variants.avif.map((variant) => `${variant.src} ${variant.width}w`).join(', ') }),
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

async function readSource(source, { root, cache, refresh, fetchImpl }) {
  if (!source.startsWith('https://')) return readFile(path.join(root, source.startsWith('/') ? `public${source}` : source));
  const cached = path.join(cache, hash(source));
  const input = !refresh && await exists(cached) ? await readFile(cached) : await download(source, { fetchImpl });
  if (refresh || !(await exists(cached))) await writeFile(cached, input);
  return input;
}

async function runPool(items, task, concurrency) {
  let cursor = 0;
  const failures = [];
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        await task(item);
      } catch (error) {
        failures.push(`${item}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return failures;
}

export async function collectGallerySources(root = ROOT) {
  const directory = path.join(root, 'public/api/galerias');
  const sources = new Set();
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith('.json')).sort()) {
    for (const row of JSON.parse(await readFile(path.join(directory, filename), 'utf8'))) {
      if (row.url && RASTER.test(new URL(row.url).pathname)) sources.add(row.url);
    }
  }
  return [...sources].sort();
}

// Fotos dos álbuns: o gtap.com.br serve originais de ~1 MB (eram usados até nas
// miniaturas). As versões otimizadas (WebP 240/960 px) ficam versionadas em
// public/galeria-otimizada/ com o manifesto src/data/gallery-media.json, e o nome
// de cada arquivo vem da URL. Assim o build não baixa nada: só fotos novas (ou
// --refresh) são baixadas e convertidas, em paralelo.
export const GALLERY = {
  manifest: 'src/data/gallery-media.json',
  directory: 'public/galeria-otimizada',
  urlPrefix: '/galeria-otimizada',
  sizes: [240, 960],
};
const galleryName = (source) => hash(`gallery-v1|${source}`).slice(0, 16);
const variantFiles = (image) => [image.srcSet, image.avifSrcSet].filter(Boolean)
  .flatMap((srcSet) => srcSet.split(', ').map((item) => path.basename(item.split(' ')[0])));

// Remove variantes que nenhum item do manifesto usa mais (só arquivos, não subpastas).
async function prune(directory, manifest) {
  const used = new Set(Object.values(manifest).flatMap(variantFiles));
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && !used.has(entry.name)) await rm(path.join(directory, entry.name));
  }
}

export async function buildGallery({ root = ROOT, refresh = false, fetchImpl = fetch } = {}) {
  const start = Date.now();
  const sources = await collectGallerySources(root);
  const cache = path.join(root, '.cache/gtap-media');
  const outputDirectory = path.join(root, GALLERY.directory);
  const manifestPath = path.join(root, GALLERY.manifest);
  const previous = await exists(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
  await mkdir(outputDirectory, { recursive: true });
  const manifest = {};
  const pending = [];
  for (const source of sources) {
    const image = previous[source];
    const complete = image && (await Promise.all(variantFiles(image).map((file) => exists(path.join(outputDirectory, file))))).every(Boolean);
    if (complete && !refresh) manifest[source] = image;
    else pending.push(source);
  }
  if (pending.length) await mkdir(cache, { recursive: true });
  const failures = await runPool(pending, async (source) => {
    const name = galleryName(source);
    const input = await readSource(source, { root, cache, refresh, fetchImpl });
    await Promise.all(GALLERY.sizes.map((size) => rm(path.join(outputDirectory, `${name}-${size}.webp`), { force: true })));
    manifest[source] = await optimizeImage(input, { outputDirectory, urlPrefix: GALLERY.urlPrefix, sizes: GALLERY.sizes, formats: ['webp'], name });
  }, 12);
  if (failures.length) throw new Error(`Gallery images failed (${failures.length}):\n${failures.join('\n')}`);
  const ordered = Object.fromEntries(sources.map((source) => [source, manifest[source]]));
  // Remove variantes de fotos que saíram dos álbuns.
  await prune(outputDirectory, ordered);
  await writeIfChanged(manifestPath, `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`Gallery: ${sources.length} photos, ${pending.length} downloaded/converted; ${((Date.now() - start) / 1000).toFixed(1)}s.`);
  return ordered;
}

// Imagens do site: as variantes ficam versionadas em public/optimized/ com o
// manifesto e o CSS gerados. Locais são relidas (barato) e só reconvertidas se
// mudarem; remotas só são baixadas se ainda não tiverem variantes versionadas.
export async function buildMedia({ root = ROOT, refresh = false, fetchImpl = fetch } = {}) {
  const start = Date.now();
  const sources = await collectSources(root);
  const cache = path.join(root, '.cache/gtap-media');
  const outputDirectory = path.join(root, 'public/optimized');
  const target = path.join(root, 'src/data/generated-media.json');
  const previous = await exists(target) ? JSON.parse(await readFile(target, 'utf8')) : {};
  await mkdir(outputDirectory, { recursive: true });
  const manifest = {};
  let downloads = 0;
  const failures = await runPool(sources, async (source) => {
    const image = previous[source];
    if (source.startsWith('https://') && image && !refresh) {
      const files = variantFiles(image);
      if ((await Promise.all(files.map((file) => exists(path.join(outputDirectory, file))))).every(Boolean)) {
        manifest[source] = image;
        return;
      }
    }
    if (source.startsWith('https://')) {
      downloads += 1;
      await mkdir(cache, { recursive: true });
    }
    const input = await readSource(source, { root, cache, refresh, fetchImpl });
    manifest[source] = await optimizeImage(input, { outputDirectory });
  }, 6);
  if (failures.length) throw new Error(`Required images failed (${failures.length}):\n${failures.join('\n')}`);
  const ordered = Object.fromEntries(sources.map((source) => [source, manifest[source]]));
  await prune(outputDirectory, ordered);
  await writeIfChanged(target, `${JSON.stringify(ordered, null, 2)}\n`);
  await writeIfChanged(path.join(root, 'src/styles/generated-media.css'), backgroundStyles(ordered));
  console.log(`Images: ${sources.length} sources, ${downloads} downloaded; ${((Date.now() - start) / 1000).toFixed(1)}s.`);
  return ordered;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const refresh = process.argv.includes('--refresh');
  buildMedia({ refresh }).then(() => buildGallery({ refresh })).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
