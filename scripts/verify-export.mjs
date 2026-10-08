import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const openUrl = /https:\/\/www\.opensolucoestributarias\.com\.br\//;
const editions = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const routes = ['', 'galeria', ...editions.map((n) => `${n} GTAP`)];
// Teto de [<script src>, <link rel="stylesheet">] por página, medido no build anterior às animações.
// Home: +1 script assíncrono de ~260 B (carregador dos imports dinâmicos do modal e do Lenis).
const budgets = { '': [8, 5], galeria: [7, 3], ...Object.fromEntries(editions.map((n) => [`${n} GTAP`, [7, 4]])), 404: [6, 1] };
function assertBudget(page, html) {
  const [scripts, styles] = budgets[page];
  const count = (pattern) => html.match(pattern)?.length ?? 0;
  assert.ok(count(/<script\b[^>]*\ssrc=/g) <= scripts, `${page || 'home'}: mais de ${scripts} <script src>`);
  assert.ok(count(/<link\b[^>]*\srel="stylesheet"/g) <= styles, `${page || 'home'}: mais de ${styles} folhas de estilo`);
}
// HTML completo do elemento que começa em `start`, contando o aninhamento da mesma tag.
function outerHtml(html, start) {
  const tag = /^<([a-z]+)/.exec(html.slice(start))[1];
  const pattern = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  pattern.lastIndex = start;
  for (let depth = 0, match; (match = pattern.exec(html));) {
    depth += match[1] ? -1 : 1;
    if (!depth) return html.slice(start, pattern.lastIndex);
  }
  assert.fail(`<${tag}> sem fechamento`);
}
for (const route of routes) {
  const html = await readFile(`out/${route ? `${route}/` : ''}index.html`, 'utf8');
  assert.match(html, /<html lang="pt-BR"/);
  assert.match(html, /<link[^>]+rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /property="og:type"/);
  assert.match(html, /property="og:site_name"/);
  assert.doesNotMatch(html, /__next_error__/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|cdnjs\.cloudflare\.com|\/src\/main\.jsx/);
  assert.doesNotMatch(html, /href="\/open-solucoes-tributarias/);
  assertBudget(route, html);
  if (!route) {
    assert.match(html, /Temas confirmados/);
    assert.match(html, /Alexandre Marques/);
    assert.match(html, /fetchPriority="high"/i);
    assert.match(html, /class="banner-poster"/);
    assert.match(html, /srcSet="\/optimized\/[^" ]+.*w"/i);
    assert.match(html, /class="speaker-photo"[^>]*loading="lazy"|loading="lazy"[^>]*class="speaker-photo"/);
    assert.doesNotMatch(html, /<video[^>]+src=/);
    assert.doesNotMatch(html, /banner-play|Reproduzir vídeo de abertura/);
    // Hero e CTA são LCP: sem data-reveal no banner e no CTA inteiros; na seção de atuação, só a raiz.
    const lcp = [...html.matchAll(/<[a-z]+\b[^>]*class="[^"]*(?<![\w-])(banner-container|card-buttons-container|section-atuacao)(?![\w-])[^"]*"[^>]*>/g)];
    assert.deepEqual(lcp.map((match) => match[1]).sort(), ['banner-container', 'card-buttons-container', 'section-atuacao']);
    for (const { 0: tag, 1: name, index } of lcp) {
      assert.doesNotMatch(name === 'section-atuacao' ? tag : outerHtml(html, index), /data-reveal/, name);
    }
    for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*class="[^"]*(?<![\w-])banner-poster(?![\w-])[^"]*"[^>]*>/g)) {
      assert.doesNotMatch(tag, /data-reveal/, 'banner-poster');
    }
  }
  if (route.endsWith(' GTAP')) {
    assert.match(html, /\/assets\/logos\//);
    // Fotos otimizadas versionadas (240/960 px); a primeira (LCP) com prioridade alta.
    assert.match(html, /<img[^>]+srcSet="\/galeria-otimizada\/[^"]+ 240w/);
    assert.match(html, /<img[^>]+fetchPriority="high"[^>]+src="\/galeria-otimizada\//i);
    assert.doesNotMatch(html, /<img[^>]+src="https:\/\/gtap\.com\.br\/midias\//);
  }
  // data-href: lista de CSS embutido (experimental.inlineCss), separada por espaço.
  for (const match of html.matchAll(/\s(?:src|href|data-href)="([^"]+)"/g)) {
    for (const ref of match[1].split(/\s+/).filter((value) => value.startsWith('/'))) {
      const url = decodeURIComponent(ref.replace(/[?#].*$/, ''));
      if (/\.(?:js|css|svg|webp|avif|mp4|woff2)$/.test(url)) await access(`out${url}`);
    }
  }
}
const notFound = await readFile('out/404.html', 'utf8');
assert.doesNotMatch(notFound, /href="\/open-solucoes-tributarias/);
assertBudget(404, notFound);
const robots = await readFile('out/robots.txt', 'utf8');
assert.match(robots, /User-agent: \*/i);
const sitemap = await readFile('out/sitemap.xml', 'utf8');
for (const edition of editions) assert.ok(sitemap.includes(`${edition}%20GTAP/`));
assert.doesNotMatch(sitemap, /open-solucoes-tributarias/);
const media = JSON.parse(await readFile('src/data/generated-media.json', 'utf8'));
for (const image of Object.values(media)) {
  assert.ok(image.width > 0 && image.height > 0);
  for (const srcSet of [image.srcSet, image.avifSrcSet]) {
    for (const item of srcSet.split(', ')) await access(`out${item.split(' ')[0]}`);
  }
}
const gallery = JSON.parse(await readFile('src/data/gallery-media.json', 'utf8'));
assert.ok(Object.keys(gallery).length > 0);
for (const image of Object.values(gallery)) {
  assert.ok(image.width > 0 && image.height > 0);
  for (const item of image.srcSet.split(', ')) await access(`out${item.split(' ')[0]}`);
}
const video = JSON.parse(await readFile('src/data/generated-video.json', 'utf8'));
assert.ok(video.optimizedBytes < video.originalBytes);
await access(`out${video.src}`);
const htaccess = await readFile('out/.htaccess', 'utf8');
assert.equal(htaccess, await readFile('public/.htaccess', 'utf8'));
assert.equal(htaccess, await readFile('.htaccess', 'utf8'));
assert.match(htaccess, /DEFLATE.*text\/javascript/);
assert.match(htaccess, /immutable/);
assert.match(htaccess, new RegExp(`RewriteRule \\^open-solucoes-tributarias\\S* ${openUrl.source} \\[[^\\]]*\\bR=301\\b`));
// Fallback sem JS da antiga página da Open (preview local e hosts sem .htaccess).
const openFallback = await readFile('out/open-solucoes-tributarias/index.html', 'utf8');
assert.match(openFallback, new RegExp(`<meta http-equiv="refresh" content="0;url=${openUrl.source}"`));
assert.match(openFallback, /<meta name="robots" content="noindex/);
assert.doesNotMatch(openFallback, /<script/);
console.log(`Static export verified: ${routes.length} routes + 404, prerendered content, local assets, SEO, motion-safe hero, asset budgets, Hostinger config and Open redirect.`);
