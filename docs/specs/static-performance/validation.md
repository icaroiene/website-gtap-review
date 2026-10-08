# Validação da exportação estática, revisão 4

Data: 2026-10-07. Validação local da exportação Next com `output: 'export'`. Nenhuma publicação em produção foi feita; as medições locais não confirmam o comportamento final da Hostinger.

## Critérios de aceitação

| Critério | Resultado | Evidência |
| --- | --- | --- |
| AC-01 — Build limpo e artefato estático | **Passou.** `npm test`: 5/5; lint: 0 erros; build: 12 rotas HTML estáticas. O verificador encontrou 12 rotas e 270 variantes de imagem. | Gates executados no checkout final; export em `out/`. |
| AC-02 — Rotas, recarga e 404 | **Passou.** As 12 rotas respondem HTTP 200 e um caminho desconhecido responde 404. | Smoke HTTP do checkout final. |
| AC-03 — Conteúdo no HTML inicial | **Passou.** Conteúdo da home e dos álbuns está no HTML exportado sem depender de uma busca editorial inicial no cliente. | Verificador do HTML e export. |
| AC-04 — Hero e autoplay (R4) | **Passou funcionalmente.** No browser em viewport de 390 px, o vídeo iniciou sem botão no hero, com `paused=false`, `muted=true` e `playsInline=true`. A pausa ao sair da viewport foi confirmada. O vídeo tenta iniciar após load/idle; `saveData` e `prefers-reduced-motion` mantêm o poster, e interação normal tenta novamente se o autoplay for bloqueado. | Browser mobile em 390 px; DOM/rede; implementação local revisada. O modal abriu com o título correto. |
| AC-05 — Fontes, ícones e mídia secundária | **Passou.** Fontes e ícones são locais; não há dependências globais de Google Fonts, Font Awesome ou animate.css. Vídeos secundários usam `preload="none"`; mapa sob demanda. | Build e inspeção do artefato. |
| AC-06 — Navegação e contrato PHP | **Passou.** O POST foi interceptado localmente; preserva `name`, `email`, `whatsapp`, `reset=true` e os campos existentes do contrato. Nenhum dado foi enviado ao endpoint de produção. | Interceptação de formulário no browser. |
| AC-07 — Exportação estática e smoke | **Passou.** O conteúdo pode ser servido sem runtime Next no host, rotas e 404 foram verificadas e os artefatos estão em `out/`. | Build, verificador de export e HTTP. |
| AC-08 — Variantes de imagens no build | **Passou.** Foram geradas 270 variantes locais otimizadas, incluindo formatos e tamanhos responsivos usados no HTML/CSS exportado. | Verificador de export do checkout final. |
| AC-09 — Fronteira server/client e palestrantes | **Passou.** Conteúdo estático é composto no build; JavaScript fica nas ilhas interativas. Imagens secundárias são carregadas sob demanda. O modal de palestrante abriu e exibiu o título esperado. | Build e verificação no browser. |
| AC-10 — Carrosséis e álbuns | **Passou.** Slick foi removido. No álbum, avançar sincronizou a seleção para a imagem 2 e rolou a faixa principal para a posição esperada (~380 px). | Verificação de navegação e estado do álbum no browser. |
| AC-11 — Vídeo local e reprodução | **Passou.** Vídeo de origem de 122.461.168 bytes foi substituído por MP4 local de 7.477.669 bytes (aprox. 7,48 MB; redução de 93,9%). `ffprobe`: 52,958 s, 1280×720, 24 fps; original: 52,965 s. Autoplay muted é tentado em desktop e mobile depois de load/idle. | Metadados e playback no browser; asset em `out/optimized-video/`. |
| AC-12 — Lighthouse e metas | **Parcial.** Mobile alcança performance ≥90 no preview gzip; LCP mobile continua acima de 2,5 s. Desktop atende às duas metas. Plain e gzip ficam em cenários separados e comparações móveis registram a mudança de autoplay. | Relatórios completos e resumo em `round2/`; ver seção abaixo. |

## Comportamento e métricas do hero

O vídeo foi restaurado no mobile por decisão de experiência: tenta autoplay muted após load/idle, como no desktop. O poster permanece como fallback e durante `saveData`/`prefers-reduced-motion`; não há botão de play no hero. O navegador pausou a reprodução fora da viewport no teste em 390 px.

O asset inteiro caiu de **122,46 MB para 7,48 MB**. Durante Lighthouse, o navegador pediu uma resposta parcial `206`: cerca de 4 MiB de conteúdo de vídeo, com aproximadamente 4,7–4,9 MB registrados em `transferSize`. A requisição aparece como inacabada porque o navegador mantém o streaming; isso não indica download do arquivo completo durante a auditoria. O endpoint MP4 suporta byte ranges no preview.

## Lighthouse local

Medições com Lighthouse 13.0.1 e Chrome local. O cenário **plain** usa `GTAP_PREVIEW_GZIP=0`; o cenário **gzip** usa `GTAP_PREVIEW_GZIP=1`. `curl` confirmou `Content-Encoding: gzip` e `Vary: Accept-Encoding` no preview gzip. O Lighthouse não publica um campo `gzipSize`; `transferSize` representa os bytes observados e a compressão não se aplica ao MP4. A configuração local não confirma headers/cache em produção.

| Cenário | Perfil | Performance antes → final | LCP antes → final | Transferência final | Leitura |
| --- | --- | ---: | ---: | ---: | --- |
| Plain | Desktop | 96 → 99 | 1,32 s → 1,03 s | 5,64 MB | Metas ≥90 e LCP ≤2,5 s atingidas. |
| Plain | Mobile | 76 → 79 | 6,83 s → 5,62 s | 5,73 MB | Performance ainda abaixo de 90; LCP permanece acima de 2,5 s. O vídeo agora é requisitado por autoplay (~4,92 MB transferidos na auditoria). |
| Gzip | Desktop | 100 → 100 | 0,67 s → 0,69 s | 5,12 MB | Metas ≥90 e LCP ≤2,5 s atingidas. |
| Gzip | Mobile | 91 → 94 | 3,53 s → 3,15 s | 5,15 MB | Meta de performance ≥90 atingida; LCP ainda excede 2,5 s. Repetição: performance 94, LCP 3,149 s e transferência 5,08 MB. |

Os pontos gzip antes/final foram medidos com a mesma opção de compressão local, mas representam experiências mobile diferentes: o mobile do `gzip-before.json` não requisitava vídeo; a revisão final restaura autoplay e transfere cerca de 4,8 MB de vídeo na auditoria. Portanto, a transferência total antes/depois não isola apenas o efeito da compressão ou das imagens. A nota mobile melhora de 91 para 94, mesmo com o vídeo presente. Os resultados plain seguem a mesma observação: o aumento de tráfego mobile acompanha a mudança de UX, enquanto o LCP melhora.

O baseline plain inicial está em `round2/before.json`; a primeira integração plain em `round2/variant1.json`; a comparação local gzip correspondente está em `round2/gzip-before.json`. A exportação final e seus relatórios estão em `round2/after.json`, `after-plain-desktop.json`, `after-plain-mobile.json`, `after-gzip-desktop.json` e `after-gzip-mobile.json`. A repetição está em `round2/repeat-mobile.json` e `after-repeat-mobile.json`.

## Limites

Nenhuma medição foi executada contra produção e nenhuma publicação foi feita. A compressão foi confirmada apenas no servidor estático local. A nota do PageSpeed real dependerá da Hostinger, cache, headers e mídia remota; deve ser medida após deploy. O formulário PHP foi interceptado localmente, sem envio real.

## Revisão 5 — animações, microinterações e remoção da Open (2026-10-07)

Mesmo protocolo (Lighthouse 13.0.1, preview gzip, 3 execuções, mediana). Resumos em `round3/`: `before.json` (commit 16e4f94), `after.json` (variante 1: CSS em arquivos) e `variant2-inline-css.json` (variante 2, final: `experimental.inlineCss`). Os relatórios brutos (~44 MB) não foram versionados.

| Página | Perfil | Perf antes → final | LCP antes → final | Elemento LCP | CLS |
| --- | --- | ---: | ---: | --- | ---: |
| Home | Desktop | 100 → 100 | 684 → 669 ms | igual (texto do CardButton) | 0,0002 → 0 |
| Home | Mobile | 94 → 94 | 3.144 → 3.073 ms | igual (`section.section-atuacao`) | 0,0032 → 0 |
| Galeria | Desktop | 100 → 100 | 545 → 566 ms | igual | 0 |
| Galeria | Mobile | 98 → 98 | 2.392 → 2.470 ms | igual | 0 |
| Álbum I | Desktop | 83 → 100 | 3,15 s → 0,68 s | igual (1ª foto) | 0 |
| Álbum I | Mobile | 75 → 90–92 | 19,4 s → 3,3–3,6 s | igual (1ª foto) | 0 |
| Álbum VIII | Desktop | 75 → 100 | 9,97 s → 0,66 s | igual (1ª foto) | 0 |
| Álbum VIII | Mobile | 75 → 93–94 | 64,5 s → 3,1–3,3 s | igual (1ª foto) | 0 |

- A variante 1 manteve LCP/CLS/TBT dentro das metas, mas a home mobile caiu de 94 para 93 (+4,4 KB de CSS bloqueante). A variante 2 embute o CSS no HTML e recupera a nota.
- `non-composited-animations`: 0 itens em todas as execuções. TBT ≤ 10 ms mobile.
- O chunk do Lenis (~5,5 KB gz) só é baixado no desktop após load/idle; nunca no mobile nem na 404.
- Álbuns: as 454 fotos eram servidas em tamanho original do `gtap.com.br` (~1 MB cada), inclusive nas miniaturas. Agora usam WebP de 240/960 px versionados em `public/galeria-otimizada/` (~7/67 KB em média; 35 MB no total), sem download no build; a primeira foto tem `fetchPriority="high"` e o logo da edição tem dimensões reservadas (fim do layout shift intermitente). Peso da página: 2,7–52 MB → ~450 KB.
- QA no navegador: sem conteúdo invisível sem JS ou com movimento reduzido, âncoras abaixo do header fixo, trava de rolagem no menu/modal, sem overflow horizontal (320–1920 px), sem erros de console.
