import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const editions = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const routes = ['', 'galeria', 'open-solucoes-tributarias', ...editions.map((n) => `${n} GTAP`)];
for (const route of routes) {
  const html = await readFile(`out/${route ? `${route}/` : ''}index.html`, 'utf8');
  assert.match(html, /<html lang="pt-BR"/);
  assert.match(html, /<link[^>]+rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /property="og:type"/);
  assert.match(html, /property="og:site_name"/);
  assert.doesNotMatch(html, /__next_error__/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|cdnjs\.cloudflare\.com|\/src\/main\.jsx/);
  if (!route) {
    assert.match(html, /Temas confirmados/);
    assert.match(html, /Alexandre Marques/);
    assert.match(html, /fetchPriority="high"/i);
    assert.match(html, /class="banner-poster"/);
    assert.match(html, /srcSet="\/optimized\/[^" ]+.*w"/i);
    assert.match(html, /class="speaker-photo"[^>]*loading="lazy"|loading="lazy"[^>]*class="speaker-photo"/);
    assert.doesNotMatch(html, /<video[^>]+src=/);
    assert.doesNotMatch(html, /banner-play|Reproduzir vídeo de abertura/);
  }
  if (route.endsWith(' GTAP')) {
    assert.match(html, /\/assets\/logos\//);
    assert.match(html, /<img[^>]+src="https:\/\/gtap\.com\.br\/midias\//);
  }
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
    const url = decodeURIComponent(match[1]);
    if (/\.(?:js|css|svg|webp|avif|mp4|woff2)$/.test(url)) await access(`out${url}`);
  }
}
await access('out/404.html');
await access('out/.htaccess');
const robots = await readFile('out/robots.txt', 'utf8');
assert.match(robots, /User-agent: \*/i);
const sitemap = await readFile('out/sitemap.xml', 'utf8');
for (const edition of editions) assert.ok(sitemap.includes(`${edition}%20GTAP/`));
const media = JSON.parse(await readFile('src/data/generated-media.json', 'utf8'));
for (const image of Object.values(media)) {
  assert.ok(image.width > 0 && image.height > 0);
  for (const srcSet of [image.srcSet, image.avifSrcSet]) {
    for (const item of srcSet.split(', ')) await access(`out${item.split(' ')[0]}`);
  }
}
const video = JSON.parse(await readFile('src/data/generated-video.json', 'utf8'));
assert.ok(video.optimizedBytes < video.originalBytes);
await access(`out${video.src}`);
const htaccess = await readFile('out/.htaccess', 'utf8');
assert.match(htaccess, /DEFLATE.*text\/javascript/);
assert.match(htaccess, /immutable/);
console.log(`Static export verified: ${routes.length} routes, prerendered content, local assets, SEO and Hostinger config.`);
