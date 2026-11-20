# Research: Tela Inicial (Landing Page) do AchaLocal

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-18

Não restaram itens "NEEDS CLARIFICATION" no Technical Context. Os itens abaixo registram as decisões
técnicas tomadas para cumprir a spec e a constitution.

## R-01 — Ícones (`<icone>` do modelo)

- **Decision**: Usar `MatIcon` com ícones SVG do conjunto Material Symbols (licença Apache 2.0)
  copiados como arquivos estáticos para `public/icons/*.svg` (com `fill="currentColor"`) e
  registrados por nome no `MatIconRegistry` via `addSvgIcon` (URL confiável por
  `DomSanitizer.bypassSecurityTrustResourceUrl` sobre caminhos constantes). Registro feito em
  `provideAppInitializer` dentro de `core/icons`. Testes usam `MatIconTestingModule`. Requer `provideHttpClient(withFetch())`.
- **Rationale**: O projeto não tem fonte de ícones instalada. ~10 SVGs locais evitam nova
  dependência npm (Princípio VII), evitam requisição a CDN de fontes (decisão da feature 001: zero
  requisições externas de fonte) e não usam `bypassSecurityTrustHtml`. `currentColor` herda a cor do
  tema, sem hexadecimais.
- **Alternatives considered**: pacote `material-symbols`/`@material-symbols/svg-400` (nova
  dependência para ~10 ícones — rejeitado); fonte Material Icons via Google Fonts (requisição
  externa — rejeitado); `addSvgIconLiteral` com strings SVG no código (exige `bypassSecurityTrustHtml`
  — rejeitado por segurança).
- **Ícones necessários**: `storefront` (marca), `chat` (testar chatbot / testar o chat online),
  `add_business` (cadastrar meu negócio), `edit_note` (1. Cadastre), `forum` (2. Usuário pergunta),
  `location_on` (3. Recomendação), `bolt` (Setup em 5 minutos), `sentiment_satisfied` (Sem
  conhecimento técnico), `trending_up` (Resultados rápidos), `mail` (contato), `arrow_forward`
  (testar agora →), `check` (benefício do plano).

## R-02 — Ilustração do destaque

- **Decision**: Extrair a imagem embutida em `.mine/tela_inicial/tela-inicial.excalidraw` (PNG
  1440×810, 1,19 MB) e convertê-la uma única vez para WebP em duas larguras (`hero-960.webp`,
  `hero-1440.webp`, alvo ≤ 150 KB cada) em `public/images/`. Conversão feita com ferramenta pontual
  via `npx` (ex.: `npx sharp-cli`), **sem** adicioná-la ao `package.json`. Exibir com
  `NgOptimizedImage` (`ngSrc`, `ngSrcset`, `width`/`height` fixos, `priority`), com `alt`
  descritivo em português.
- **Rationale**: 1,19 MB comprometeria SC-003 (conteúdo principal em ≤ 2 s em 4G).
  `NgOptimizedImage` é parte de `@angular/common` (sem dependência nova), evita layout shift e
  prioriza o carregamento da imagem LCP.
- **Contingência**: se a ferramenta via `npx` não estiver disponível, converter manualmente em
  squoosh.app (mesmos alvos de tamanho).
- **Alternatives considered**: PNG original (pesado demais); `<img>` simples (sem `srcset`/
  prioridade automáticos e com aviso do Angular sobre LCP).
- **Ajustes na implementação**: `IMAGE_LOADER` próprio no `HeroSection` (`srcset` manual é proibido pelo `NgOptimizedImage`); `<link rel="preload" as="image">` no `index.html`; rota `''` com carga imediata (`component`) em vez de `loadComponent`, para eliminar a ida extra à rede antes do LCP.
- **Fallback (edge case "ilustração não carrega")**: dimensões fixas + `alt` garantem que texto e
  botões continuam visíveis e utilizáveis.

## R-03 — Rotas e destinos provisórios ("Em breve")

- **Decision**: Rotas `''` → `LandingPage`; `cadastrar-negocio` e `chatbot` → `ComingSoonPage`,
  ambas com `loadComponent` e `title` em português; o nome do recurso é passado via `data` e lido
  como `input()` graças a `withComponentInputBinding()`. Os caminhos ficam em constantes tipadas
  (`AppPaths`) usadas por rotas e links.
- **Rationale**: Atende FR-005/FR-007 e mantém um único componente provisório. Quando as features
  reais chegarem, basta trocar o `loadComponent` da rota; links não mudam.
- **Alternatives considered**: um único caminho `/em-breve` (perde a URL definitiva dos recursos e
  obriga a mudar os links depois); `routerLink` sem rota (página em branco — viola edge case).
- **Fora do escopo**: rota curinga `**`/404 (não pedida na spec).

## R-04 — Itens de usuário autenticado no cabeçalho (FR-004)

- **Decision**: Não renderizar "meus negócios" nem "sair" nesta feature; nenhum serviço de
  autenticação, sinal ou flag é criado.
- **Rationale**: Clarificação Q1 (ocultos até existir autenticação) + constitution (não implementar
  o que não é necessário; YAGNI). A feature de autenticação adicionará os itens ao `SiteHeader`.
- **Alternatives considered**: `@if (isAuthenticated())` com sinal sempre `false` (código morto e
  abstração prematura — rejeitado).

## R-05 — Marca "AchaLocal" volta ao topo

- **Decision**: Link da marca com `routerLink="/"` e handler que chama
  `ViewportScroller.scrollToPosition([0, 0])`; roteador configurado com
  `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` para navegações vindas de outras
  rotas (ex.: tela "Em breve").
- **Rationale**: Navegar para a mesma URL não gera rolagem no Angular; `ViewportScroller` é a API
  oficial (sem manipulação direta de DOM — Princípio IV).

## R-06 — Contato por e-mail (FR-012)

- **Decision**: Cartão de contato com o endereço `contato@tinosnegocios.com.br` em texto visível e
  um `<a mat-flat-button href="mailto:...">` "Enviar e-mail". O endereço fica em uma constante
  única em `landing-content.ts`.
- **Rationale**: Clarificação Q2. Sem backend. Endereço visível cobre o edge case "sem cliente de
  e-mail configurado".

## R-07 — Simulação de conversa estilo WhatsApp

- **Decision**: Componente `ChatSimulation` que recebe uma lista de `ChatMessage` via `input()` e
  renderiza balões com `@for`; mensagens do usuário à direita com fundo `--app-color-accent`,
  mensagens do chatbot à esquerda com fundo `--app-color-surface` e contorno
  `--app-color-on-surface-variant`; texto `--app-color-on-surface`. Painel com cabeçalho "AchaLocal
  · chatbot". Marcação semântica de lista (`role="list"`) com rótulo acessível "Exemplo de
  conversa".
- **Rationale**: Atende FR-009 (texto real, não imagem) usando somente tokens existentes — todos os
  pares já aprovados pelo `lint:contrast` (on-surface × accent/surface ≥ 4,5:1). Não é preciso criar
  tokens novos nem cores "verde WhatsApp" fora da paleta (FR-016).
- **Alternatives considered**: tokens novos imitando o WhatsApp (cores fora da paleta — rejeitado);
  animação de digitação (não pedida — YAGNI).

## R-08 — "Flutuante" (ilustração e área de contato)

- **Decision**: Elevação via sombra do `mat-card` (área de contato) e leve deslocamento/sombra na
  ilustração; nenhuma animação contínua nem `position: fixed`. Respeitar
  `prefers-reduced-motion` caso alguma transição seja usada.
- **Rationale**: Premissa da spec ("destaque visual, não elemento fixo").

## R-09 — Responsividade

- **Decision**: CSS Grid/Flexbox com media queries por componente; breakpoints 600px e 960px
  (coerentes com Material). Desktop: destaque em 2 colunas, 3 cartões em linha, bloco "linguagem
  natural" em 2 colunas, chamada final em 2 colunas. < 600px: tudo em 1 coluna, ilustração e
  conversa abaixo do texto. Cabeçalho tem só marca + 1 botão, cabe em 360px sem menu; abaixo de
  400px o rótulo "testar chatbot" permanece (sem reduzir a ícone), pois cabe.
- **Rationale**: FR-015/SC-004 sem `BreakpointObserver` (lógica em TS desnecessária).

## R-10 — Ano no rodapé

- **Decision**: `SiteFooter` expõe `protected readonly currentYear = new Date().getFullYear()`.
  Teste usa `vi.useFakeTimers()`/`vi.setSystemTime()` para validar a virada de ano.
- **Rationale**: FR-013; abstração de "relógio" injetável seria complexidade sem necessidade.

## R-11 — Conteúdo textual

- **Decision**: Textos curtos e estruturais (títulos de seção, parágrafos únicos) ficam no template
  do respectivo componente; listas repetitivas (passos, benefícios, mensagens da conversa, plano)
  ficam como constantes tipadas `readonly` em `features/landing/landing-content.ts` e são
  renderizadas com `@for`. Texto da seção "Por que é melhor que o Google?" definido em
  [contracts/landing-sections.md](./contracts/landing-sections.md).
- **Rationale**: Mantém templates simples (Princípio II), evita i18n prematuro (app é só pt-BR) e
  facilita testes por contagem/conteúdo.

## R-12 — Acessibilidade e verificação

- **Decision**: Landmarks (`header`, `main`, `section` com `aria-labelledby`, `footer`), uma única
  `h1` (título do destaque), `h2` por seção, `h3` nos cartões; ícones decorativos com
  `aria-hidden="true"`; foco visível herdado do tema. Verificação automática por Lighthouse
  (Acessibilidade e Performance) executada manualmente no quickstart, sem nova dependência.
  `lint:colors` e `lint:contrast` continuam obrigatórios.
- **Rationale**: SC-005 sem adicionar `axe-core`/ferramenta E2E (constitution exige spec própria
  para E2E).
- **Alternatives considered**: `axe-core` em testes Vitest (nova dependência — adiado).

## R-13 — Título da aba

- **Decision**: `title: 'AchaLocal — diretório local com IA'` na rota `''`; `index.html` passa a
  ter `<title>AchaLocal</title>` como fallback.
