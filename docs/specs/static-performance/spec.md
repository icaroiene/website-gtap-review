# SDD — GTAP estático e performance

Data: 2026-10-07. Solicitação: Ítalo, via usuário. Revisão ativa: 5.

Revisão 5: a página interna da Open foi removida. O AC-02 passa a cobrir /, /galeria/ e as nove URLs históricas. `/open-solucoes-tributarias/` responde 301 para https://www.opensolucoestributarias.com.br/ via `.htaccess`, com fallback estático por meta refresh (`noindex`, sem JS) em `public/open-solucoes-tributarias/index.html`. O verificador de export cobre essa regra, o fallback, o sitemap sem a rota e a ausência de links internos para ela.

Revisão 4: o usuário corrigiu a experiência do banner. O vídeo muted deve tentar autoplay em desktop e celular após load/idle; saveData e reduced-motion mantêm o poster. O hero não exibe botão de play. Se o navegador bloquear autoplay, uma interação normal com a página tenta iniciar o vídeo novamente. Esta política substitui as políticas de opt-in mobile das revisões 2 e 3. O comportamento e as medições dessas revisões continuam registrados como histórico superseded; `validation.md` permanece como snapshot anterior, e a verificação da revisão 4 e as novas métricas mobile ainda estão pendentes.

Histórico superseded: a revisão 2 restringia o autoplay ao desktop e exigia ação manual no mobile/saveData/reduced-motion após a medição de streaming acima de 20 MB. A revisão 3 manteve o opt-in mobile ao planejar a otimização de mídia. Ambas foram substituídas pela revisão 4; nenhuma medição anterior confirma o desempenho da nova experiência.

## Objetivo e restrições

Entregar o site em arquivos estáticos publicáveis na Hostinger, preservando conteúdo, layout, navegação, álbuns I–IX e POST do formulário ao PHP existente. Next.js com `output: 'export'` e diretórios por rota (`trailingSlash`) foi escolhido para gerar HTML com conteúdo no build, dividir bundles por rota e eliminar a busca inicial dos JSONs. Não exige Node no servidor.

Dados editoriais em `public/api` passam a ser snapshots do build: alterações exigem rebuild. Preços continuam calculados no navegador após hidratação. O handler PHP e mídias remotas existentes não fazem parte do artefato e precisam ser preservados na publicação. Publicação em produção não está nesta execução.

## Evidência inicial

Relatório desktop fornecido: https://pagespeed.web.dev/analysis/https-gtap-com-br/nd1bme62rs?form_factor=desktop, 2026-10-06 17:16 BRT. Performance 77, acessibilidade 85, boas práticas 96, SEO 85. FCP 0,9 s; LCP 3,0 s; TBT 0 ms; CLS 0; Speed Index 2,5 s. Payload 6.134 KiB; economia potencial em imagens 2.339 KiB; CSS/fontes bloqueiam renderização (450 ms).

Código: SPA Vite, dados buscados em efeitos, fontes Google e Font Awesome globais, animate.css para um único fade, vídeo hero autoplay. Comparações locais serão identificadas como laboratório, sem atribuir nota futura de produção.

## Critérios de aceitação

| ID | Cenário / ação | Resultado esperado | Verificação |
| --- | --- | --- | --- |
| AC-01 | Executar build limpo | `out/` contém HTML, CSS, JS e assets; nenhum runtime Next/PHP novo | build + verificador de export |
| AC-02 | Abrir diretamente /, /galeria/, /open-solucoes-tributarias/ e nove URLs históricas com espaço | Conteúdo e imagens corretos, inclusive reload; URL desconhecida tem 404 | verificador + smoke HTTP/browser |
| AC-03 | Ler HTML antes de executar JS | Home contém temas/palestrantes; álbum contém logo e fotos; não há cascata de fetch editorial no cliente | assertions no HTML exportado |
| AC-04 (R4) | Iniciar home em desktop e celular | Poster hero descoberto e priorizado no HTML; vídeo muted tenta autoplay após load/idle em ambos. Com reduced-motion ou saveData, mantém o poster. Não há botão de play no hero. Se autoplay for bloqueado pelo navegador, uma interação normal na página dispara nova tentativa | browser mobile/desktop, rede/DOM, preferências emuladas e auditoria |
| AC-05 | Carregar estilos/mídia | Fontes e ícones locais; sem Font Awesome/Google Fonts/animate.css global; vídeos de depoimentos sem preload; mapa lazy | build + browser |
| AC-06 | Navegar e enviar formulário | Links absolutos rastreáveis, POST preserva endpoint e campos name/email/whatsapp | smoke de navegação + POST interceptado, sem envio real |
| AC-07 | Validar release local | lint e build passam; artefato é servido por servidor estático; registrar Lighthouse desktop/mobile e limitações | comandos, relatórios de laboratório e resultados |

Todos os critérios são obrigatórios. Meta de laboratório: desktop >=90 e LCP <=2,5 s; se não atingida, registrar medições e gargalos remanescentes. A nota de produção depende da Hostinger, cache e mídias remotas e só pode ser confirmada após publicação.

## Plano e agentes

1. Auditoria paralela com dois agentes `gpt-6-luna`: rotas/SSR e mídia/dependências.
2. Orquestrador complexo: arquitetura Next, export, dados no build, integração e validação.
3. Implementação paralela isolada: agente rotas altera páginas/navegação; agente mídia altera Banner/depoimentos/mapa; orquestrador altera app/config/scripts/fontes/ícones.
4. Validar artefato, comportamento e performance; documentar deploy preservando PHP e diretório midias.

Sem writes concorrentes no mesmo arquivo. Especificação → plano → tarefas → evidências em `validation.md`.

## Revisão 3 — otimização autorizada

Usuário autorizou implementar as cinco melhorias propostas: gerar variantes WebP/AVIF no build, lazy images em palestrantes, reduzir escopo client, substituir Slick, comprimir vídeo desktop e validar cache/compressão estáticos. Layout/conteúdo e contrato PHP preservados; mídia derivada passa a ser publicada no artefato. Não há publicação remota.

Critérios adicionais:
- AC-08: build gera variantes locais com dimensões, srcset e formato AVIF/WebP, sem runtime de otimização. Fontes originais permanecem disponíveis; cache reduz downloads repetidos. Testar geração e falhas de entrada.
- AC-09: home/Open/álbum compostos no build; apenas interatividade tem use client. Cards de palestrantes usam imagens lazy mantendo recorte; modal continua funcionando.
- AC-10: público, empresas e álbuns usam navegação nativa acessível sem Slick; álbum sincroniza foto e miniatura e suporta next/prev e swipe.
- AC-11 (R3, superseded quanto à reprodução): vídeo mantém conteúdo/duração e ganha variante local menor, metadados faststart; a regra anterior mantinha mobile/saveData/reduced-motion em opt-in. A revisão 4 substitui essa política de reprodução; as demais verificações de mídia, cache e compressão permanecem.
- AC-12: registrar antes/depois na mesma configuração Lighthouse 13.0.1 local; alvos de referência mobile >=90/LCP <=2,5s e desktop >=90. A revisão 4 ainda precisa de nova medição; resultados de opt-in mobile anteriores são históricos superseded e não contam como atingimento. Reportar limitações se os alvos não forem atingidos. Máximo três variantes de integração após baseline, sem iteração indefinida.

Frentes: pipeline imagem (hard-skill, modelo complexo), arquitetura/integração (orquestrador complexo), carrosséis (gpt-6-luna), medições/docs (gpt-6-luna). Dados públicos baixados apenas para otimizar build; sem envio de formulário real.
