---

description: "Task list for feature 002-landing-page"
---

# Tasks: Tela Inicial (Landing Page) do AchaLocal

**Input**: Design documents from `/specs/002-landing-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md, contracts/landing-sections.md, quickstart.md

**Tests**: Incluídos — exigidos pela Constitution (Princípio VI: componentes com testes dos principais comportamentos). Vitest + jsdom via `ng test`; `npm run lint:colors` e `npm run lint:contrast`; Lighthouse manual (quickstart).

**Organization**: Tasks agrupadas por user story (US1–US5 da spec.md) para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US5 conforme spec.md
- Projeto único: `src/` na raiz; arquivos estáticos em `public/`

**Regras transversais (valem para TODAS as tasks)**:
- Textos visíveis EXATAMENTE como em `specs/002-landing-page/contracts/landing-sections.md`, em pt-BR. Nomes de código em inglês, sem abreviações.
- Componentes standalone (sem NgModules), `input()` para entradas, `ChangeDetectionStrategy.OnPush`, sem `any`, sem `subscribe()` em componentes, sem manipulação direta de DOM, sem `::ng-deep`.
- Cada componente em arquivos separados `.ts` / `.html` / `.scss` / `.spec.ts`; seletor com prefixo `app-`.
- Cores SOMENTE via `var(--app-color-*)` ou `var(--mat-sys-*)`; NENHUM hexadecimal/rgb fora de `src/styles/_tokens.scss` (inclusive em `.ts`/`.html`). NÃO criar tokens novos.
- Controles visuais SEMPRE com Angular Material (`MatButton`, `MatCard`, `MatToolbar`, `MatIcon`, `MatDivider`). Botões de navegação são `<a mat-flat-button|mat-stroked-button|mat-button [routerLink]="...">`.
- Ícones com `<mat-icon svgIcon="nome" aria-hidden="true">`, usando apenas nomes do tipo `AppIconName`.
- Caminhos de rota SEMPRE via `AppPaths` (nunca strings literais nos templates/rotas).
- Responsividade: breakpoints 600px e 960px; conteúdo com `max-width: 1120px`, centralizado, `padding-inline: 16px` mínimo; sem rolagem horizontal em 360px.
- Estilo por componente deve ficar abaixo de 4kB (orçamento `anyComponentStyle`).
- Testes de componente: `TestBed` com `provideRouter([])` (ou rotas reais quando validar navegação) e `MatIconTestingModule` (T007).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Arquivos estáticos (ícones e ilustração) e título da aplicação

- [X] T001 [P] Baixar os 12 ícones Material Symbols Outlined (Apache 2.0) em SVG 24px para `public/icons/{nome}.svg`: `storefront`, `chat`, `add_business`, `edit_note`, `forum`, `location_on`, `bolt`, `sentiment_satisfied`, `trending_up`, `mail`, `arrow_forward`, `check` (fonte sugerida: `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{nome}/default/24px.svg`). Em cada arquivo, garantir `viewBox="0 -960 960 960"` (ou o original), remover `width`/`height` fixos e definir `fill="currentColor"` no `<svg>`; nenhum outro atributo de cor
- [X] T002 [P] Extrair a ilustração embutida em `.mine/tela_inicial/tela-inicial.excalidraw` (único item de `files`, `dataURL` base64 PNG 1440×810) para um arquivo temporário fora do repositório e convertê-la para WebP em `public/images/hero-1440.webp` (1440×810) e `public/images/hero-960.webp` (960×540), alvo ≤ 150 KB cada (ex.: `npx sharp-cli`, sem adicionar ao `package.json`; contingência: squoosh.app). NÃO versionar o PNG original
- [X] T003 [P] Em `src/index.html`, trocar `<title>RAG Front</title>` por `<title>AchaLocal</title>` (R-13)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de rotas, ícones, locale, tipos de conteúdo, página "Em breve" e esqueleto da LandingPage — pré-requisito de todas as stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase terminar

- [X] T004 [P] Criar `src/app/core/routing/app-paths.ts` exportando `export const AppPaths = { home: '', registerBusiness: 'cadastrar-negocio', chatbot: 'chatbot' } as const;` e um helper `export const toRouterLink = (path: string): string => '/' + path;` (usado nos templates como `[routerLink]="registerBusinessLink"` com propriedades `protected readonly` no componente)
- [X] T005 [P] Criar `src/app/core/icons/app-icon-name.ts` com `export const APP_ICON_NAMES = ['storefront','chat','add_business','edit_note','forum','location_on','bolt','sentiment_satisfied','trending_up','mail','arrow_forward','check'] as const;` e `export type AppIconName = (typeof APP_ICON_NAMES)[number];`
- [X] T006 Criar `src/app/core/icons/provide-app-icons.ts` exportando `provideAppIcons(): EnvironmentProviders` que usa `provideAppInitializer(() => { const registry = inject(MatIconRegistry); const sanitizer = inject(DomSanitizer); for (const name of APP_ICON_NAMES) registry.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`)); })`. Comentário de uma linha justificando o `bypassSecurityTrustResourceUrl` (somente caminhos constantes locais — plan.md Complexity Tracking). Depende de T005
- [X] T007 Criar `src/app/core/icons/provide-app-icons.spec.ts`: com `provideHttpClient()`, `provideHttpClientTesting()` e `provideAppIcons()`, verificar que `MatIconRegistry.getNamedSvgIcon('storefront')` requisita `icons/storefront.svg` (via `HttpTestingController`) para cada nome de `APP_ICON_NAMES`. Specs de componentes usam `MatIconTestingModule` (`@angular/material/icon/testing`) para renderizar `mat-icon` sem HTTP (ajuste da análise C1: sem `bypassSecurityTrustHtml`). Depende de T006
- [X] T008 Atualizar `src/app/app.config.ts`: `provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' }))`, `provideHttpClient(withFetch())`, `provideAppIcons()`, `{ provide: LOCALE_ID, useValue: 'pt-BR' }` e `registerLocaleData(localePt)` (import de `@angular/common/locales/pt`) no topo do arquivo. Depende de T006
- [X] T009 [P] Criar os modelos em `src/app/features/landing/models/` (um arquivo cada, todas as propriedades `readonly`, conforme data-model.md): `how-it-works-step.ts` (`order: number` — "1, 2 ou 3; único"; `title: string`; `description: string`; `icon: AppIconName`), `chat-message.ts` (`author: 'user' | 'assistant'`; `text: string`), `plan.ts` (`name: string`; `monthlyPriceInCents: number` — "inteiro, evita erro de ponto flutuante"; `benefits: readonly string[]` — "≥ 1"; `cancellationNote: string`), `benefit.ts` (`label: string`; `icon: AppIconName`). Depende de T005
- [X] T010 Criar `src/app/features/landing/landing-content.ts` com constantes `readonly` tipadas e textos exatos de contracts/landing-sections.md: `HOW_IT_WORKS_STEPS: readonly HowItWorksStep[]` (3 itens, §3), `CHAT_MESSAGES: readonly ChatMessage[]` (3 mensagens, §3 — mensagem do assistente com quebras de linha `\n` entre negócio, endereço, preço e telefone), `ESSENTIAL_PLAN: Plan` (`name: 'Essencial'`, `monthlyPriceInCents: 999`, `benefits: ['respostas ilimitadas']`, `cancellationNote: 'cancele quando quiser'`), `CLOSING_BENEFITS: readonly Benefit[]` (3 itens, §6), `CONTACT_EMAIL = 'contato@tinosnegocios.com.br'`. Depende de T009
- [X] T011 [P] Criar `ComingSoonPage` em `src/app/features/coming-soon/coming-soon-page.ts|.html|.scss` (contracts/routes.md): `featureName = input.required<string>()`; `<main>` centralizado com `h1` "{{ featureName() }} — em breve", parágrafo "Estamos preparando este recurso. Volte em breve!" e `<a mat-flat-button routerLink="/">Voltar para a página inicial</a>`. Depende de T004
- [X] T012 [P] Criar `src/app/features/coming-soon/coming-soon-page.spec.ts`: renderiza título com `featureName` informado via `fixture.componentRef.setInput`, texto de apoio e link de volta com `href="/"`
- [X] T013 Criar o esqueleto `LandingPage` em `src/app/features/landing/landing-page.ts|.html|.scss`: template com `<main>` vazio (seções serão adicionadas pelas stories); `.scss` apenas `:host { display: block; }`
- [X] T014 Atualizar `src/app/app.routes.ts`: `[{ path: AppPaths.home, pathMatch: 'full', title: 'AchaLocal — diretório local com IA', loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage) }, { path: AppPaths.registerBusiness, title: 'Cadastro de negócio — em breve', data: { featureName: 'Cadastro de negócio' }, loadComponent: loadComingSoonPage }, { path: AppPaths.chatbot, title: 'Chatbot — em breve', data: { featureName: 'Chatbot' }, loadComponent: loadComingSoonPage }, ...DEV_ROUTES]`, com `const loadComingSoonPage = () => import('./features/coming-soon/coming-soon-page').then((m) => m.ComingSoonPage);` (sem rota curinga). Depende de T004, T011, T013
- [X] T015 Criar `src/app/app.routes.spec.ts` com `RouterTestingHarness` + `provideRouter(routes, withComponentInputBinding())` + `MatIconTestingModule`: `/` renderiza `app-landing-page`; `/cadastrar-negocio` renderiza `ComingSoonPage` com "Cadastro de negócio — em breve"; `/chatbot` renderiza "Chatbot — em breve"; títulos da aba via `Title.getTitle()`. Depende de T014

**Checkpoint**: `ng test` verde; `/` abre página vazia sem erros; `/cadastrar-negocio` e `/chatbot` mostram "Em breve"

---

## Phase 3: User Story 1 - Visitante entende a proposta e inicia o cadastro (Priority: P1) 🎯 MVP

**Goal**: Cabeçalho com a marca e seção de destaque com título, texto, ação principal "cadastrar meu negócio" e ilustração

**Independent Test**: Abrir `/`; cabeçalho e destaque aparecem com os textos do contrato; "cadastrar meu negócio" leva a `/cadastrar-negocio`; clicar na marca volta ao topo

### Tests for User Story 1

- [X] T016 [P] [US1] Criar `src/app/features/landing/site-header/site-header.spec.ts`: existe `<header>` contendo link da marca com texto "AchaLocal" e `href="/"`; o ícone `storefront` está presente com `aria-hidden="true"`; clicar na marca chama `ViewportScroller.scrollToPosition([0, 0])` (espionar com `vi.spyOn`)
- [X] T017 [P] [US1] Criar `src/app/features/landing/hero-section/hero-section.spec.ts`: existe exatamente um `h1` com "Seu negócio encontrado no estilo WhatsApp."; parágrafo com o texto de apoio do contrato §2; link "cadastrar meu negócio" com `href="/cadastrar-negocio"` e atributo `mat-flat-button`; `img` com `alt` exato do contrato §2, `width="1440"` e `height="810"`; `section` com `aria-labelledby` apontando para o id do `h1`

### Implementation for User Story 1

- [X] T018 [P] [US1] Criar `SiteHeader` em `src/app/features/landing/site-header/site-header.ts|.html|.scss`: `<header>` com `mat-toolbar` contendo `<a class="brand" routerLink="/" (click)="scrollToTop()">` com `<mat-icon svgIcon="storefront" aria-hidden="true">` + "AchaLocal"; um espaçador flexível (`<span class="spacer">`) para receber ações à direita (US2); `<mat-divider>` abaixo da toolbar. `scrollToTop()` usa `inject(ViewportScroller).scrollToPosition([0, 0])`. Toolbar com fundo `var(--app-color-surface)`; marca com `var(--app-color-on-surface)`, fonte 1.25rem peso 700
- [X] T019 [P] [US1] Criar `HeroSection` em `src/app/features/landing/hero-section/hero-section.ts|.html|.scss` (contrato §2): `<section aria-labelledby="hero-title">`, `h1#hero-title`, parágrafo de apoio, grupo de ações com `<a mat-flat-button [routerLink]="registerBusinessLink">` (ícone `add_business` + "cadastrar meu negócio"), e `<img ngSrc="hero" ngSrcset="960w, 1440w" sizes="(min-width: 600px) 50vw, 100vw" width="1440" height="810" priority alt="...">` com `IMAGE_LOADER` próprio nos `providers` do componente mapeando `config.width` → `images/hero-${width}.webp` (padrão 1440) (ajuste da análise U1: `srcset` manual é proibido pelo `NgOptimizedImage`). Layout: grid 2 colunas (texto · imagem) ≥ 600px, 1 coluna < 600px com imagem abaixo; imagem `width: 100%; height: auto;` com `border-radius` e sombra leve (`var(--mat-sys-level2)` ou `box-shadow` via token Material) — sem cores literais; fundo da seção `var(--app-color-surface)`. `registerBusinessLink = toRouterLink(AppPaths.registerBusiness)`
- [X] T020 [US1] Atualizar `src/app/features/landing/landing-page.html|.ts`: renderizar `<app-site-header />` antes de `<main>` e `<app-hero-section />` como primeiro filho de `<main>`; importar os dois componentes. Depende de T018, T019
- [X] T021 [US1] Criar `src/app/features/landing/landing-page.spec.ts` (com `provideRouter([])` e `MatIconTestingModule`): renderiza `app-site-header` fora de `main` e `app-hero-section` dentro de `main`. Depende de T020

**Checkpoint**: MVP — `/` mostra cabeçalho + destaque; "cadastrar meu negócio" → "Cadastro de negócio — em breve"

---

## Phase 4: User Story 2 - Visitante experimenta o chatbot (Priority: P1)

**Goal**: Acionadores "testar chatbot" (cabeçalho) e "testar o chat online" (destaque) levando a `/chatbot`. O terceiro acionador ("testar agora") é entregue com a seção "Como funciona" em US3 (T029) e reutiliza o mesmo destino.

**Independent Test**: Clicar em "testar chatbot" e "testar o chat online" leva a `/chatbot` ("Chatbot — em breve")

### Tests for User Story 2

- [X] T022 [P] [US2] Em `src/app/features/landing/site-header/site-header.spec.ts`, adicionar teste: link "testar chatbot" com `href="/chatbot"` e ícone `chat`
- [X] T023 [P] [US2] Em `src/app/features/landing/hero-section/hero-section.spec.ts`, adicionar teste: link "testar o chat online" com `href="/chatbot"`, atributo `mat-stroked-button` e ícone `chat`

### Implementation for User Story 2

- [X] T024 [P] [US2] Em `src/app/features/landing/site-header/site-header.ts|.html`, após o espaçador adicionar `<a mat-button [routerLink]="chatbotLink">` com `<mat-icon svgIcon="chat" aria-hidden="true">` + "testar chatbot" (`chatbotLink = toRouterLink(AppPaths.chatbot)`). Em 360px marca + botão devem caber em uma linha (reduzir `gap`/padding se necessário; não ocultar o rótulo)
- [X] T025 [P] [US2] Em `src/app/features/landing/hero-section/hero-section.ts|.html`, adicionar ao grupo de ações `<a mat-stroked-button [routerLink]="chatbotLink">` com ícone `chat` + "testar o chat online"; ações lado a lado com `flex-wrap: wrap` e `gap` (empilham em telas estreitas)
- [X] T026 [US2] Em `src/app/app.routes.spec.ts`, adicionar teste de navegação: a partir de `/`, clicar no link "testar chatbot" do cabeçalho resulta em `Router.url === '/chatbot'` e "Chatbot — em breve" renderizado. Depende de T024

**Checkpoint**: US1 + US2 funcionando; dois caminhos de conversão ativos

---

## Phase 5: User Story 3 - Visitante entende como funciona e por que vale a pena (Priority: P2)

**Goal**: Seções "Como funciona" (3 cartões + bloco linguagem natural + simulação de conversa em HTML + "testar agora") e "Por que é melhor que o Google?"

**Independent Test**: Rolar até as seções e conferir cartões, conversa (texto selecionável) e texto explicativo do contrato §3 e §4; "testar agora" → `/chatbot`

### Tests for User Story 3

- [X] T027 [P] [US3] Criar `src/app/features/landing/how-it-works-section/step-card/step-card.spec.ts`: com `step` = primeiro item de `HOW_IT_WORKS_STEPS`, renderiza `h3` "1. Cadastre", a descrição e `mat-icon` com `svgIcon="edit_note"`
- [X] T028 [P] [US3] Criar `src/app/features/landing/how-it-works-section/chat-simulation/chat-simulation.spec.ts`: com `CHAT_MESSAGES`, renderiza container `role="list"` com `aria-label="Exemplo de conversa"`, 3 `role="listitem"`, classes `message--user`/`message--assistant` conforme `author`, e texto da resposta contendo "Rua das Flores, 120", "R$ 1,50" e "(11) 99999-0000"; nenhum `img` dentro do componente
- [X] T029 [P] [US3] Criar `src/app/features/landing/how-it-works-section/how-it-works-section.spec.ts`: `h2` "Como funciona", subtítulo do contrato, 3 `app-step-card` na ordem 1/2/3, `h3` "Funciona com linguagem natural.", texto explicativo, link "testar agora" com `href="/chatbot"` e ícone `arrow_forward`, e um `app-chat-simulation`
- [X] T030 [P] [US3] Criar `src/app/features/landing/why-better-section/why-better-section.spec.ts`: `h2` "Por que é melhor que o Google?" e parágrafo com o texto exato do contrato §4

### Implementation for User Story 3

- [X] T031 [P] [US3] Criar `StepCard` em `src/app/features/landing/how-it-works-section/step-card/step-card.ts|.html|.scss`: `step = input.required<HowItWorksStep>()`; `mat-card` (appearance `outlined`) com ícone no topo (cor `var(--app-color-primary)`, ícone decorativo), `h3` "{{ step().order }}. {{ step().title }}" e parágrafo com a descrição; altura 100% para alinhar cartões
- [X] T032 [P] [US3] Criar `ChatSimulation` em `src/app/features/landing/how-it-works-section/chat-simulation/chat-simulation.ts|.html|.scss` (R-07): `messages = input.required<readonly ChatMessage[]>()`; painel com cabeçalho "AchaLocal · chatbot" (ícone `storefront`), corpo `role="list" aria-label="Exemplo de conversa"` com `@for (message of messages(); track $index)` gerando `<div role="listitem" class="message" [class.message--user]="message.author === 'user'" [class.message--assistant]="message.author === 'assistant'">`. Estilos: usuário alinhado à direita com fundo `var(--app-color-accent)`; assistente à esquerda com fundo `var(--app-color-surface)` e borda 1px `var(--app-color-on-surface-variant)`; texto `var(--app-color-on-surface)`; `white-space: pre-line` para as quebras; `max-width: 85%` por balão; borda do painel 1px `var(--app-color-on-surface-variant)`, `border-radius` 16px; texto selecionável
- [X] T033 [US3] Criar `HowItWorksSection` em `src/app/features/landing/how-it-works-section/how-it-works-section.ts|.html|.scss` (contrato §3): `<section aria-labelledby="how-it-works-title">` com fundo `var(--app-color-accent)` (faixa diferenciada); `h2#how-it-works-title` + subtítulo centralizados; grid de 3 `<app-step-card [step]="step">` via `@for (step of steps; track step.order)` (3 colunas ≥ 600px, 1 coluna < 600px); abaixo, grid 2 colunas ≥ 960px (1 coluna abaixo, conversa depois do texto): à esquerda `h3` "Funciona com linguagem natural.", parágrafo e `<a mat-stroked-button [routerLink]="chatbotLink">testar agora <mat-icon iconPositionEnd svgIcon="arrow_forward" aria-hidden="true"></mat-icon></a>`; à direita `<app-chat-simulation [messages]="chatMessages" />`. `steps = HOW_IT_WORKS_STEPS`, `chatMessages = CHAT_MESSAGES` como `protected readonly`. Depende de T031, T032
- [X] T034 [P] [US3] Criar `WhyBetterSection` em `src/app/features/landing/why-better-section/why-better-section.ts|.html|.scss` (contrato §4): `<section aria-labelledby="why-better-title">`, `h2#why-better-title` centralizado e parágrafo com o texto exato, largura de leitura `max-width: 70ch` centralizada
- [X] T035 [US3] Em `src/app/features/landing/landing-page.html|.ts`, adicionar `<app-how-it-works-section />` e `<app-why-better-section />` dentro de `<main>`, após o destaque, nesta ordem; atualizar `landing-page.spec.ts` para validar a ordem hero → how-it-works → why-better. Depende de T033, T034

**Checkpoint**: Seções 1–4 completas; os três acionadores do chatbot funcionam (US2 cenário 3 coberto por T029)

---

## Phase 6: User Story 4 - Visitante conhece o plano e entra em contato (Priority: P2)

**Goal**: "Planos mensais", chamada final com benefícios e área de contato por e-mail, e rodapé com ano dinâmico

**Independent Test**: Cartão "Essencial" com "R$ 9,99/mês"; três benefícios; contato mostra `contato@tinosnegocios.com.br` e o botão aponta para `mailto:`; rodapé exibe o ano corrente

### Tests for User Story 4

- [X] T036 [P] [US4] Criar `src/app/features/landing/pricing-section/plan-card/plan-card.spec.ts`: com `ESSENTIAL_PLAN` e `LOCALE_ID` `pt-BR` (registrar `localePt` no spec), renderiza título "Essencial", preço normalizado (substituir ` ` por espaço) igual a "R$ 9,99/mês", item "respostas ilimitadas" com ícone `check` e nota "cancele quando quiser"
- [X] T037 [P] [US4] Criar `src/app/features/landing/pricing-section/pricing-section.spec.ts`: `h2` "Planos mensais" e um `app-plan-card`
- [X] T038 [P] [US4] Criar `src/app/features/landing/closing-call-section/contact-card/contact-card.spec.ts`: título "Fale com a gente", texto "Atendimento somente por e-mail.", endereço `contato@tinosnegocios.com.br` visível como texto, link "Enviar e-mail" com `href="mailto:contato@tinosnegocios.com.br"` e ícone `mail`; não há `form` nem `input`
- [X] T039 [P] [US4] Criar `src/app/features/landing/closing-call-section/closing-call-section.spec.ts`: `h2` "Pronto para alcançar maiores resultados?", texto do contrato §6, 3 benefícios na ordem com ícones `bolt`, `sentiment_satisfied`, `trending_up`, e um `app-contact-card`
- [X] T040 [P] [US4] Criar `src/app/features/landing/site-footer/site-footer.spec.ts`: com `vi.useFakeTimers()` + `vi.setSystemTime(new Date('2027-01-01T12:00:00'))`, o `<footer>` exibe "© 2027 AchaLocal — diretório local com IA"; restaurar com `vi.useRealTimers()` no `afterEach`

### Implementation for User Story 4

- [X] T041 [P] [US4] Criar `PlanCard` em `src/app/features/landing/pricing-section/plan-card/plan-card.ts|.html|.scss`: `plan = input.required<Plan>()`; `price = computed(() => this.plan().monthlyPriceInCents / 100)`; `mat-card` com `h3` do nome, preço `{{ price() | currency: 'BRL' : 'symbol' : '1.2-2' }}/mês` em destaque (2rem, peso 700, `var(--app-color-on-surface)`), lista `@for (benefit of plan().benefits; track benefit)` com ícone `check` (cor `var(--app-color-primary)`), e nota em `var(--app-color-on-surface-variant)`; borda superior 4px `var(--app-color-primary)`; largura máxima 320px
- [X] T042 [US4] Criar `PricingSection` em `src/app/features/landing/pricing-section/pricing-section.ts|.html|.scss`: `<section aria-labelledby="pricing-title">`, `h2#pricing-title` "Planos mensais" centralizado e `<app-plan-card [plan]="plan" />` centralizado (`plan = ESSENTIAL_PLAN`). Depende de T041
- [X] T043 [P] [US4] Criar `ContactCard` em `src/app/features/landing/closing-call-section/contact-card/contact-card.ts|.html|.scss` (R-06, R-08): `mat-card` (appearance `raised`, elevação como destaque "flutuante", sem `position: fixed`) com `h3` "Fale com a gente", parágrafo "Atendimento somente por e-mail.", endereço em `<p class="email">{{ contactEmail }}</p>` (selecionável, `word-break: break-all`) e `<a mat-flat-button [href]="mailtoLink">` com ícone `mail` + "Enviar e-mail". `contactEmail = CONTACT_EMAIL`; `mailtoLink = 'mailto:' + CONTACT_EMAIL`
- [X] T044 [US4] Criar `ClosingCallSection` em `src/app/features/landing/closing-call-section/closing-call-section.ts|.html|.scss` (contrato §6): `<section aria-labelledby="closing-call-title">`, grid 2 colunas ≥ 960px (1 coluna abaixo, contato depois): à esquerda `h2#closing-call-title`, parágrafo e `<ul>` com `@for (benefit of benefits; track benefit.label)` (ícone em `var(--app-color-primary)` + rótulo); à direita `<app-contact-card />`. `benefits = CLOSING_BENEFITS`. Depende de T043
- [X] T045 [P] [US4] Criar `SiteFooter` em `src/app/features/landing/site-footer/site-footer.ts|.html|.scss` (R-10): `protected readonly currentYear = new Date().getFullYear();`; `<footer>` com `<mat-divider>` e texto centralizado "© {{ currentYear }} AchaLocal — diretório local com IA" em `var(--app-color-on-surface-variant)`
- [X] T046 [US4] Em `src/app/features/landing/landing-page.html|.ts`, adicionar `<app-pricing-section />` e `<app-closing-call-section />` ao fim de `<main>` e `<app-site-footer />` após `</main>`; atualizar `landing-page.spec.ts` para validar a ordem completa das 7 seções (header, hero, how-it-works, why-better, pricing, closing-call dentro de `main`; footer após `main`) — SC-001. Depende de T042, T044, T045

**Checkpoint**: Página completa com as 7 seções do modelo

---

## Phase 7: User Story 5 - Cabeçalho adequado ao visitante não autenticado (Priority: P3)

**Goal**: Garantir (e travar por teste) que "meus negócios" e "sair" não aparecem (FR-004, clarificação Q1)

**Independent Test**: Abrir `/` sem autenticação; o cabeçalho mostra apenas a marca e "testar chatbot"

- [X] T047 [US5] Em `src/app/features/landing/site-header/site-header.spec.ts`, adicionar teste: o `<header>` contém exatamente 2 links (marca e "testar chatbot") e nenhum texto "meus negócios" nem "sair" (FR-004). NÃO criar serviço/sinal de autenticação (R-04)

**Checkpoint**: Todas as user stories entregues

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificações de qualidade, orçamentos, acessibilidade e documentação

- [X] T048 Executar `npm test` e corrigir falhas até ficar 100% verde
- [X] T049 [P] Executar `npm run lint:colors` e `npm run lint:contrast`; remover qualquer cor literal introduzida (usar tokens)
- [X] T050 Executar `npm run build` (produção) e garantir ausência de avisos de orçamento (initial < 500kB; cada estilo de componente < 4kB); se algum `.scss` exceder, dividir estilos/simplificar
- [X] T051 Validação manual de responsividade (quickstart §4): 360px, 768px e 1280px sem rolagem horizontal nem sobreposição; ajustar `.scss` dos componentes afetados
- [X] T052 Validação Lighthouse (quickstart §5) no build de produção servido localmente: Acessibilidade 100 e LCP ≤ 2 s em modo mobile; navegação por teclado alcança todos os links com foco visível; corrigir achados
- [X] T053 [P] Validar edge case de ilustração ausente (quickstart §6): layout sem deslocamento e textos/botões visíveis
- [X] T054 Percorrer integralmente `specs/002-landing-page/quickstart.md` §1–§6 e marcar `specs/002-landing-page/checklists/requirements.md` como validado na implementação (nota com data)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T001–T003 em paralelo
- **Foundational (Phase 2)**: depende do Setup (ícones em `public/` para T006/T007 fazerem sentido) — BLOQUEIA todas as stories
- **US1 (Phase 3)**: depende da Foundational
- **US2 (Phase 4)**: depende de US1 (edita `SiteHeader` e `HeroSection` criados em US1)
- **US3 (Phase 5)**: depende apenas da Foundational (pode rodar em paralelo a US1/US2, exceto T035, que edita `landing-page.html` — fazer após T020)
- **US4 (Phase 6)**: depende apenas da Foundational (exceto T046, após T035 para preservar a ordem das seções)
- **US5 (Phase 7)**: depende de US2 (T024)
- **Polish (Phase 8)**: depende de todas as stories

### Within Each User Story

- Testes escritos primeiro e falhando antes da implementação
- Subcomponentes (StepCard, ChatSimulation, PlanCard, ContactCard) antes das seções que os usam
- Integração na `LandingPage` por último

### Parallel Opportunities

- Setup: T001, T002, T003
- Foundational: T004, T005, T009 juntos; depois T011/T012 em paralelo com T006→T007→T008
- US1: T016, T017, T018, T019 em paralelo
- US2: T022, T023, T024, T025 em paralelo
- US3: T027–T032 e T034 em paralelo
- US4: T036–T041, T043, T045 em paralelo
- US3 e US4 podem ser desenvolvidas por pessoas diferentes ao mesmo tempo

---

## Parallel Example: User Story 3

```bash
# Testes em paralelo:
Task: "T027 StepCard spec em src/app/features/landing/how-it-works-section/step-card/step-card.spec.ts"
Task: "T028 ChatSimulation spec em .../chat-simulation/chat-simulation.spec.ts"
Task: "T029 HowItWorksSection spec em .../how-it-works-section.spec.ts"
Task: "T030 WhyBetterSection spec em src/app/features/landing/why-better-section/why-better-section.spec.ts"

# Subcomponentes em paralelo:
Task: "T031 StepCard"
Task: "T032 ChatSimulation"
Task: "T034 WhyBetterSection"
```

## Parallel Example: User Story 4

```bash
Task: "T041 PlanCard em src/app/features/landing/pricing-section/plan-card/"
Task: "T043 ContactCard em src/app/features/landing/closing-call-section/contact-card/"
Task: "T045 SiteFooter em src/app/features/landing/site-footer/"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) → Phase 2 (Foundational)
2. Phase 3 (US1): cabeçalho + destaque com "cadastrar meu negócio"
3. **PARAR e VALIDAR**: `/` funcional, cadastro leva ao "Em breve"

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → MVP (conversão para cadastro)
3. US2 → segundo caminho de conversão (chatbot)
4. US3 → conteúdo de convencimento
5. US4 → preço, contato e rodapé (página completa)
6. US5 → trava de regressão do cabeçalho
7. Polish → orçamentos, acessibilidade, desempenho

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Commit após cada task ou grupo lógico
- Não implementar nada fora da spec: sem rota 404, sem autenticação, sem formulário de contato, sem animações contínuas

## Implementation Notes (2026-11-18)

- **Desvios aprovados na implementação** (achados de `/speckit-analyze`):
  - C1 / T007: specs usam `MatIconTestingModule`; `provide-test-icons.ts` não foi criado (sem `bypassSecurityTrustHtml`).
  - U1 / T019: `HeroSection` fornece `IMAGE_LOADER` próprio (`images/{src}-{width}.webp`) com `ngSrc="hero"` + `ngSrcset="960w, 1440w"`.
  - SC-003 / T052: a rota `''` passou a usar `component: LandingPage` (carga imediata, não lazy) e `src/index.html` ganhou `<link rel="preload" as="image">` da ilustração, zerando o "load delay" do LCP.
- **T052 — Lighthouse (build de produção servido com compressão)**: Acessibilidade 100; CLS 0,001.
  - Perfil 4G típico (9 Mbps, RTT 70 ms, CPU 1×): Performance 100, LCP 1,1 s ✅.
  - Perfil padrão do Lighthouse (4G lento 1,6 Mbps + CPU 4× mais lenta): Performance 59, LCP 4,2 s — 85% é "render delay" (bootstrap do Angular no cliente). Alcançar ≤ 2 s nesse perfil exige SSR/pré-renderização (`@angular/ssr`), dependência nova fora do escopo (Princípio VII).
  - Navegação por teclado não foi exercitada manualmente; foco visível vem do tema Material.
- **T051**: validado por screenshots headless em 360px, 768px e 1280px (sem rolagem horizontal).
- **T053**: sem a ilustração, o espaço reservado exibe o `alt` e o layout não se desloca.
