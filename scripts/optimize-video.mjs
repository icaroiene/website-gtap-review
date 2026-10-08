import { readFile, writeFile, mkdir, access, rename, stat, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const data = JSON.parse(await readFile('public/api/landing_page.json', 'utf8'));
const source = data.find((item) => item.type === 6)?.mediaUrl;
if (!source || new URL(source).hostname !== 'gtap.com.br') throw new Error('Missing GTAP banner video URL.');
const profile = 'h264-1280-crf28-24fps-noaudio-faststart-v1';
const manifestPath = 'src/data/generated-video.json';
const fileExists = (file) => access(file).then(() => true, () => false);

// O vídeo otimizado e o manifesto ficam versionados: se já correspondem à mesma
// origem e ao mesmo perfil, o build não baixa os ~117 MB nem roda o FFmpeg.
const versioned = await readFile(manifestPath, 'utf8').then(JSON.parse, () => null);
const reuse = process.env.GTAP_REFRESH_MEDIA !== '1' && versioned?.source === source
  && versioned.profile === profile && await fileExists(`public${versioned.src}`);

if (reuse) {
  console.log(`Banner video: ${versioned.src} (versioned, no download).`);
} else {
  await encode();
}

async function encode() {
  const cache = '.cache/gtap-video';
  await mkdir(cache, { recursive: true });
  await mkdir('public/optimized-video', { recursive: true });
  const cacheKey = createHash('sha256').update(source).digest('hex').slice(0, 16);
  const input = `${cache}/${cacheKey}.mp4`;
  if (!(await fileExists(input)) || process.env.GTAP_REFRESH_MEDIA === '1') {
    const response = await fetch(source, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`Video HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 512 * 1024 * 1024) throw new Error('Banner exceeds the 512 MiB source budget.');
    await writeFile(`${input}.tmp`, bytes);
    await rename(`${input}.tmp`, input);
  }
  const bytes = await readFile(input);
  const hash = createHash('sha256').update(bytes).update(profile).digest('hex').slice(0, 16);
  const output = `public/optimized-video/banner-${hash}.mp4`;
  const exists = await fileExists(output);
  if (!exists) {
    const temporary = `${cache}/encoded-${hash}.mp4`;
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', resolve(input), '-vf', "scale=w='min(1280,iw)':h=-2,fps=24", '-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', resolve(temporary)];
    await new Promise((resolveRun, reject) => {
      const child = spawn(process.env.FFMPEG_PATH || 'ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
      let error = '';
      child.stderr.on('data', (chunk) => { error += chunk.toString(); });
      child.on('error', (err) => reject(new Error(`Install ffmpeg or set FFMPEG_PATH: ${err.message}`)));
      child.on('exit', (code) => code === 0 ? resolveRun() : reject(new Error(`ffmpeg failed (${code}): ${error}`)));
    });
    await rename(temporary, output);
  }
  const outputSize = (await stat(output)).size;
  if (outputSize >= bytes.length) throw new Error('Encoded video is not smaller than original.');
  // Só o vídeo atual fica versionado.
  for (const file of await readdir('public/optimized-video')) {
    if (file.startsWith('banner-') && `public/optimized-video/${file}` !== output) await rm(`public/optimized-video/${file}`);
  }
  await writeFile(manifestPath, `${JSON.stringify({ src: `/${output.slice('public/'.length)}`, source, originalBytes: bytes.length, optimizedBytes: outputSize, profile }, null, 2)}\n`);
  console.log(`Banner video: ${(bytes.length / 1048576).toFixed(2)} MiB -> ${(outputSize / 1048576).toFixed(2)} MiB (${exists ? 'cached' : 'encoded'}).`);
}
