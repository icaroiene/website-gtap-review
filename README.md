# Website GTAP

Site Next.js com exportação estática para a Hostinger. A hospedagem recebe os arquivos de `out/` e não precisa executar Node.js. Para desenvolver e gerar o site, use Node.js 20.9+ e npm. FFmpeg (no `PATH` ou em `FFMPEG_PATH`) só é necessário se o vídeo do banner mudar.

## Desenvolvimento, build e validação

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run verify:export
npm run preview
```

`npm test` executa os sete testes Node atuais. `npm run build` e `npm run dev` otimizam as mídias antes de iniciar. O preview serve `out/` em `http://127.0.0.1:4173`, sem servidor Next. Para usar outra porta, execute `PORT=4175 npm run preview`. A compressão gzip do preview é opcional e vem desativada por padrão: `GTAP_PREVIEW_GZIP=1 PORT=4175 npm run preview`.

## Mídia e performance

Os scripts de pré-build e pré-desenvolvimento geram versões WebP e AVIF com `srcset` para imagens locais e imagens referenciadas pelos dados GTAP. As fotos dos álbuns (`public/api/galerias/*.json`) usam WebP de 240 e 960 px **versionados** em `public/galeria-otimizada/`, com o manifesto `src/data/gallery-media.json`: o build não baixa nem converte nada para elas. Quando uma foto nova entra num álbum, o script baixa e converte só essa foto (em paralelo) e remove variantes de fotos retiradas; depois, versione os arquivos gerados. Também geram versões responsivas de banner e os manifestos usados pelo site. Os originais permanecem preservados; os derivados são criados no build.

Toda a mídia otimizada é versionada, então o build não precisa de rede nem de FFmpeg: num clone novo, `npm run build` leva poucos segundos. Os scripts só baixam e convertem o que for novo (uma imagem ou foto que entrou nos dados, ou um vídeo de banner com outra URL), removem variantes que deixaram de ser usadas e mantêm os originais baixados em `.cache/gtap-media` e `.cache/gtap-video` (ignorados pelo Git). Depois de uma mudança assim, versione os arquivos gerados. Para baixar tudo de novo, rode `npm run media:images -- --refresh` e `GTAP_REFRESH_MEDIA=1 npm run media:video`.

Os arquivos gerados ficam em `public/optimized/`, `public/optimized-video/`, `public/galeria-otimizada/`, `src/data/generated-media.json`, `src/data/gallery-media.json`, `src/data/generated-video.json` e `src/styles/generated-media.css`. Eles são versionados e incluídos em `out/` pela exportação. A otimização atual reduziu o banner de 122.461.168 bytes para 7.477.669 bytes: vídeo de cerca de 53 segundos, até 1280×720 a 24 fps, sem áudio. Em desktop e celular, o site tenta iniciar o vídeo mudo após o carregamento inicial e em tempo ocioso. Com economia de dados ou preferência de movimento reduzido, mantém o poster. Se o navegador bloquear o autoplay, uma interação normal do visitante com a página permite uma nova tentativa. O hero não tem botão de play.

As imagens usam formatos modernos e variantes responsivas. Os carrosséis usam rolagem nativa, sem `react-slick`. A home é gerada estaticamente no build e mantém componentes interativos menores no cliente.

As animações de entrada e as microinterações são feitas em CSS (`data-reveal`, `data-enter` e estados de hover/foco/clique). O conteúdo é visível sem JS. Um runtime pequeno (`src/motion/`) só começa depois do load, em tempo ocioso, e anima apenas o que ainda está abaixo da dobra. Hero e CTA não recebem animação de entrada, o que preserva o LCP. A rolagem suave usa Lenis, carregado sob demanda e apenas em desktop com ponteiro fino; toque continua com rolagem nativa. Com `prefers-reduced-motion`, entradas, rolagem suave e animações contínuas ficam desligadas.

A fonte Roboto Condensed e os ícones SVG são locais. O poster do banner tem prioridade; vídeos de depoimentos não fazem preload e o mapa é lazy. Dados em `public/api/*.json` e `public/api/galerias/*.json` são incorporados no build, então atualizações exigem novo build e publicação. As nove URLs históricas (`/I%20GTAP/` até `/IX%20GTAP/`) permanecem disponíveis.

Páginas exportadas: home, `/galeria/` e nove álbuns. A antiga página interna da Open foi removida: `/open-solucoes-tributarias/` responde 301 para https://www.opensolucoestributarias.com.br/ pelo `.htaccess`, e `public/open-solucoes-tributarias/index.html` é um fallback estático sem JS (meta refresh, `noindex`) para o preview local e hosts sem `.htaccess`.

## Publicação na Hostinger

1. Gere e valide `out/` com os comandos acima.
2. Faça backup dos arquivos atuais de `public_html`, incluindo `.htaccess`.
3. Publique **o conteúdo** de `out/` em `public_html`, incluindo `out/.htaccess` (arquivo oculto). Não envie a pasta `out` como subdiretório.
4. Preserve `form-handler.php`, suas dependências/configuração, o diretório `midias`, banco de dados e quaisquer outros endpoints PHP existentes. Eles não são fornecidos pelo export. Não apague `public_html` para publicar.
5. Substitua o `.htaccess` antigo pelo exportado e concilie regras próprias de HTTPS, domínio e PHP, mantendo a `RewriteRule` que redireciona `/open-solucoes-tributarias/` (301) para o site oficial da Open. O arquivo ativa Deflate para tipos textuais e cache longo para arquivos com hash, cache de um dia para mídias e revalidação para HTML/JSON. Cada URL tem seu `index.html`; não deve haver fallback geral para a home. O `.htaccess` da raiz e o de `public/` são iguais; o de `public/` é copiado automaticamente no build.
6. A pasta antiga `public_html/open-solucoes-tributarias/` pode ser apagada. Se ela continuar no servidor, o redirecionamento funciona do mesmo jeito.
7. Confira acesso direto e reload à home, à galeria e aos nove álbuns, o 301 de `/open-solucoes-tributarias/`, a resposta 404, as mídias e o formulário. Limpe o cache do host/CDN e refaça PageSpeed desktop e mobile em produção.

`robots.txt` e `sitemap.xml` são gerados estaticamente. O domínio canônico adotado é `https://gtap.com.br`.

Especificação, plano, critérios de aceitação e evidências: [docs/specs/static-performance/spec.md](docs/specs/static-performance/spec.md). Nenhuma publicação em produção é feita pelos scripts deste projeto.
