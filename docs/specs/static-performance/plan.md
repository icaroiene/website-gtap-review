# Plano técnico

Referência: `spec.md`. Arquitetura: Next App Router, `output: export`, `trailingSlash: true`.

Política ativa de vídeo: revisão 4 do `spec.md`. Os passos e evidências anteriores sobre opt-in mobile das revisões 2 e 3 são históricos superseded e não atestam o comportamento ou as metas de performance da revisão atual.

1. Ler repositório e relatório PageSpeed. Capturar baseline Vite a partir de `git archive HEAD`, sem alterações da implementação, em servidor local separado.
2. Criar critérios de aceitação e verificador do artefato. Verificar falha antes da existência de `out/`.
3. Criar páginas server que carregam JSON no build e encaminham props aos componentes interativos. Mover `src/pages` para `src/views`, evitando descobrimento acidental de componentes como rotas Next. Enumerar nove álbuns com `generateStaticParams` e decodificar parâmetros.
4. Adaptar imports estáticos de imagens para `.src`/dimensões, remover entrypoint/router Vite, hospedar fonte via `next/font/local`, substituir Font Awesome/animate.css, preservar formulário PHP.
5. Priorizar poster e background LCP; tentar autoplay muted em desktop e celular após load/idle; manter poster com saveData/reduced-motion e retentar após interação normal da página se o navegador bloquear autoplay. Não adicionar botão de play ao hero. Adiar backgrounds da localização fora da viewport e usar carrosséis nativos acessíveis.
6. Exportar `.htaccess` sem fallback SPA, adicionar robots/sitemap, canonical por rota e Open Graph completo.
7. Executar lint, build, verificador, smoke HTTP e browser; interceptar POST localmente. Repetir Lighthouse após melhorias mensuráveis, mantendo configurações iguais ao baseline.
8. Fazer revisão técnica independente, corrigir achados e registrar evidências e instruções de publicação. Não publicar em produção nesta tarefa.

Histórico superseded: o plano original das revisões 2 e 3 bloqueava autoplay mobile e previa reprodução manual. A revisão 4 substitui essa decisão. O Lighthouse mobile e a verificação do novo comportamento ainda precisam ser repetidos; não declarar meta mobile atingida antes disso.

## Divisão em paralelo

| Agente | Modelo | Superfície | Verificação |
| --- | --- | --- | --- |
| Orquestrador | Complexo | app, config, scripts, fonte/ícones, integração e gargalos | lint/build/export/browser |
| audit_routes | gpt-6-luna | componentes de páginas e navegação | lint direcionado, revisão pelo orquestrador |
| audit_assets | gpt-6-luna | Banner, depoimentos, mapa | inspeção de código, rede/DOM pelo orquestrador |
| baseline | gpt-6-luna | relatórios locais em docs; implementação somente leitura | Lighthouse 13.0.1 desktop/mobile |
| technical_review | Complexo herdado | revisão hard-skill somente leitura | análise do código e HTML exportado |

Agentes simples mantiveram arquivos separados; o orquestrador integrou só após conclusão de cada frente.
