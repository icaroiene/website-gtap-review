# Website GTAP

Site Next.js com exportação estática para a Hostinger. A hospedagem recebe os arquivos de `out/` e não precisa executar Node.js. Para desenvolver e gerar o site, use Node.js 20.9+, npm e FFmpeg disponível no `PATH`. Se o executável tiver outro caminho, defina `FFMPEG_PATH`.

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

`npm test` executa os cinco testes Node atuais. `npm run build` e `npm run dev` otimizam as mídias antes de iniciar. O preview serve `out/` em `http://127.0.0.1:4173`, sem servidor Next. Para usar outra porta, execute `PORT=4175 npm run preview`. A compressão gzip do preview é opcional e vem desativada por padrão: `GTAP_PREVIEW_GZIP=1 PORT=4175 npm run preview`.

## Mídia e performance

Os scripts de pré-build e pré-desenvolvimento geram versões WebP e AVIF com `srcset` para imagens locais e imagens referenciadas pelos dados GTAP. Também geram versões responsivas de banner e os manifestos usados pelo site. Os originais permanecem preservados; os derivados são criados no build.

O cache de downloads remotos fica em `.cache/gtap-media` e `.cache/gtap-video`. Um primeiro build com cache vazio precisa de rede para buscar os arquivos GTAP; builds seguintes podem usar o cache local sem rede. Para atualizar as imagens remotas, rode `npm run media:images -- --refresh`. Para baixar e gerar novamente o vídeo, rode `GTAP_REFRESH_MEDIA=1 npm run media:video`.

Os arquivos gerados ficam em `public/optimized/`, `public/optimized-video/`, `src/data/generated-media.json`, `src/data/generated-video.json` e `src/styles/generated-media.css`. Eles são ignorados pelo Git e incluídos em `out/` pela exportação. A otimização atual reduziu o banner de 122.461.168 bytes para 7.477.669 bytes: vídeo de cerca de 53 segundos, até 1280×720 a 24 fps, sem áudio. Em desktop e celular, o site tenta iniciar o vídeo mudo após o carregamento inicial e em tempo ocioso. Com economia de dados ou preferência de movimento reduzido, mantém o poster. Se o navegador bloquear o autoplay, uma interação normal do visitante com a página permite uma nova tentativa. O hero não tem botão de play.

As imagens usam formatos modernos e variantes responsivas. Os carrosséis usam rolagem nativa, sem `react-slick`. A home é gerada estaticamente no build e mantém componentes interativos menores no cliente.

A fonte Roboto Condensed e os ícones SVG são locais. O poster do banner tem prioridade; vídeos de depoimentos não fazem preload e o mapa é lazy. Dados em `public/api/*.json` e `public/api/galerias/*.json` são incorporados no build, então atualizações exigem novo build e publicação. As nove URLs históricas (`/I%20GTAP/` até `/IX%20GTAP/`) permanecem disponíveis.

## Publicação na Hostinger

1. Gere e valide `out/` com os comandos acima.
2. Faça backup dos arquivos atuais de `public_html`, incluindo `.htaccess`.
3. Publique **o conteúdo** de `out/` em `public_html`, incluindo `out/.htaccess` (arquivo oculto). Não envie a pasta `out` como subdiretório.
4. Preserve `form-handler.php`, suas dependências/configuração, o diretório `midias`, banco de dados e quaisquer outros endpoints PHP existentes. Eles não são fornecidos pelo export. Não apague `public_html` para publicar.
5. Substitua o `.htaccess` antigo pelo exportado e concilie regras próprias de HTTPS, domínio e PHP. O arquivo ativa Deflate para tipos textuais e cache longo para arquivos com hash, cache de um dia para mídias e revalidação para HTML/JSON. Cada URL tem seu `index.html`; não deve haver fallback geral para a home. O `.htaccess` da raiz e o de `public/` são iguais; o de `public/` é copiado automaticamente no build.
6. Confira acesso direto e reload às três páginas principais e nove álbuns, resposta 404, mídias e formulário. Limpe o cache do host/CDN e refaça PageSpeed desktop e mobile em produção.

`robots.txt` e `sitemap.xml` são gerados estaticamente. O domínio canônico adotado é `https://gtap.com.br`.

Especificação, plano, critérios de aceitação e evidências: [docs/specs/static-performance/spec.md](docs/specs/static-performance/spec.md). Nenhuma publicação em produção é feita pelos scripts deste projeto.
