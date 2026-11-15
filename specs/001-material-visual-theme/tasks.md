---

description: "Task list for feature 001-material-visual-theme"
---

# Tasks: Fundação Visual da Aplicação (Tema e Tokens de Cor)

**Input**: Design documents from `/specs/001-material-visual-theme/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos — exigidos pela Constitution (Princípio VI: componentes e regras com testes) e pelo plan.md. Vitest + jsdom via `ng test` (serviço de snackbar, página de demonstração); scripts Node `lint:colors` e `lint:contrast` (hexadecimais, contraste WCAG e cores proibidas dos tokens).

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 conforme spec.md
- Projeto único: `src/` na raiz; estilos globais em `src/styles/`

**Regras transversais (valem para TODAS as tasks)**:
- Hexadecimais de cor SOMENTE em `src/styles/_tokens.scss` (FR-004, SC-002). Em qualquer outro arquivo use `var(--app-color-*)` ou `var(--mat-sys-*)`.
- Textos visíveis em português (pt-BR); nomes de código em inglês, sem abreviações.
- Componentes standalone, `input()`/`output()`, Signals, sem `any`, sem `::ng-deep`, sem manipulação direta de DOM.
- NÃO usar `ng add @angular/material` (ele injeta link do Google Fonts no `index.html`, violando SC-009, e um tema padrão). Instalar via npm e configurar manualmente.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependências, TypeScript estrito e limpeza do placeholder do CLI

- [X] T001 Instalar dependências com `npm install @angular/material@^22.2.0 @angular/cdk@^22.2.0 @fontsource/roboto` (versões de Material/CDK alinhadas ao `@angular/core` ^22.2) e confirmar que `package.json` e `package-lock.json` foram atualizados
- [X] T002 Habilitar `"strict": true` em `compilerOptions` de `tsconfig.json` e corrigir eventuais erros de compilação em `src/` (validar com `npx tsc -p tsconfig.app.json --noEmit` e `npx tsc -p tsconfig.spec.json --noEmit`)
- [X] T003 [P] Em `src/index.html`: trocar `lang="en"` por `lang="pt-BR"`, título para `RAG Front`, e adicionar `<meta name="color-scheme" content="light">` no `<head>` (FR-015); NÃO adicionar nenhum `<link>` para fontes externas
- [X] T004 [P] Substituir todo o conteúdo placeholder de `src/app/app.html` por apenas `<router-outlet />`; esvaziar `src/app/app.scss`; remover o signal `title` de `src/app/app.ts` (mantendo `RouterOutlet` nos imports)
- [X] T005 Atualizar `src/app/app.spec.ts`: remover o teste "should render title" (h1 do placeholder) e adicionar teste que verifica a presença de um `router-outlet` no template renderizado (depende de T004)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fonte central de tokens, tema Material base e infraestrutura da rota de demonstração só-dev — bloqueia todas as stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T006 Criar `src/styles/_tokens.scss` com um bloco `:root { ... }` declarando EXATAMENTE estas CSS custom properties (contracts/css-tokens.md): `--app-color-primary: #00A35C; --app-color-on-primary: #FFFFFF; --app-color-surface: #FCFAF1; --app-color-accent: #E8F3EA; --app-color-on-surface: #1C1B17; --app-color-on-surface-variant: #6B6B60; --app-color-error-bg: #FEE2E2; --app-color-error-text: #991B1B; --app-color-success-bg: #DCFCE7; --app-color-success-text: #166534; --app-color-info-bg: #DBEAFE; --app-color-info-text: #1D4ED8; --app-color-warning-bg: #FEF3C7; --app-color-warning-text: #92400E;`. Cabeçalho em comentário: "Única fonte de cores da aplicação. Valores hexadecimais são proibidos fora deste arquivo." Este é o ÚNICO arquivo do projeto que pode conter hex
- [X] T007 Criar `src/styles/_theme.scss` com `@use '@angular/material' as mat;` e, em `html { ... }`: `color-scheme: light;` e `@include mat.theme((color: (theme-type: light, primary: mat.$green-palette), typography: (plain-family: var(--app-font-family), brand-family: var(--app-font-family)), density: 0));` seguido de `@include mat.theme-overrides((primary: var(--app-color-primary), on-primary: var(--app-color-on-primary), primary-container: var(--app-color-accent), on-primary-container: var(--app-color-on-surface), surface: var(--app-color-surface), background: var(--app-color-surface), surface-container-lowest: var(--app-color-surface), surface-container-low: var(--app-color-surface), surface-container: var(--app-color-surface), surface-container-high: var(--app-color-surface), surface-container-highest: var(--app-color-accent), on-surface: var(--app-color-on-surface), on-background: var(--app-color-on-surface), on-surface-variant: var(--app-color-on-surface-variant), outline: var(--app-color-on-surface-variant), error: var(--app-color-error-text), on-error: var(--app-color-surface), error-container: var(--app-color-error-bg), on-error-container: var(--app-color-error-text), secondary: var(--app-color-primary), secondary-container: var(--app-color-accent), on-secondary-container: var(--app-color-on-surface), tertiary: var(--app-color-primary)));` (research R-01/R-06). Se algum nome de token não existir na versão instalada, consultar `node_modules/@angular/material/core/tokens/` e ajustar, mantendo o mapeamento semântico. Sem bloco `prefers-color-scheme`
- [X] T008 Criar `src/styles/_typography.scss` provisório definindo apenas `:root { --app-font-family: "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif; }` (a Roboto é adicionada em US4, T036)
- [X] T009 Reescrever `src/styles.scss`: `@use 'styles/tokens'; @use 'styles/typography'; @use 'styles/theme';` + reset mínimo: `*, *::before, *::after { box-sizing: border-box; }`, `html, body { margin: 0; min-height: 100%; }`, `body { background: var(--app-color-surface); color: var(--app-color-on-surface); font-family: var(--app-font-family); }` (depende de T006–T008)
- [X] T010 [P] Criar `src/app/dev/dev.routes.ts` exportando `export const DEV_ROUTES: Routes = [{ path: 'dev/tema', title: 'Demonstração do tema', loadComponent: () => import('./theme-showcase/theme-showcase').then((module) => module.ThemeShowcase) }];` e `src/app/dev/dev.routes.prod.ts` exportando `export const DEV_ROUTES: Routes = [];` (contracts/theme-showcase-route.md)
- [X] T011 [P] Criar esqueleto `src/app/dev/theme-showcase/theme-showcase.ts` (standalone, selector `app-theme-showcase`, `templateUrl`, `styleUrl`, `changeDetection: ChangeDetectionStrategy.OnPush`), `theme-showcase.html` com `<main class="showcase"><h1>Demonstração do tema</h1></main>` e `theme-showcase.scss` contendo apenas layout (`.showcase { display: flex; flex-direction: column; gap: 24px; padding: 16px; max-width: 960px; margin: 0 auto; }` + `section` com `display: flex; flex-wrap: wrap; gap: 12px; align-items: center;`) — sem nenhuma cor
- [X] T012 Em `src/app/app.routes.ts` importar `DEV_ROUTES` de `./dev/dev.routes` e exportar `routes: Routes = [...DEV_ROUTES];` (depende de T010)
- [X] T013 Em `angular.json`, em `projects.ragFront.architect.build.configurations.production`, adicionar `"fileReplacements": [{ "replace": "src/app/dev/dev.routes.ts", "with": "src/app/dev/dev.routes.prod.ts" }]` (research R-08, FR-016)
- [X] T014 Adicionar `src/app/dev/theme-showcase/theme-showcase.spec.ts` com teste "should create" e teste que verifica o `h1` "Demonstração do tema" (depende de T011)

**Checkpoint**: `npm start` → `/dev/tema` abre a página vazia com fundo off-white; `npm run build` conclui sem erros

---

## Phase 3: User Story 1 - Componentes padrão já nascem com a identidade da marca (Priority: P1) 🎯 MVP

**Goal**: Botões, campos, cards, diálogos, snackbars e barras de progresso exibem a paleta da marca sem estilo próprio (FR-001, FR-002, FR-006, FR-006a, FR-009, FR-014)

**Independent Test**: Abrir `/dev/tema` e inspecionar: botão preenchido `#00A35C` com rótulo branco grande; fundo/cards/diálogo `#FCFAF1`; foco do campo verde; erro do campo `#991B1B`; progresso com indicador `#00A35C` e trilho `#E8F3EA`; nenhum roxo/rosa em nenhum estado

### Tests for User Story 1

- [X] T015 [US1] Ampliar `src/app/dev/theme-showcase/theme-showcase.spec.ts`: verificar que renderiza ao menos um elemento de cada tipo — `button[mat-flat-button]`, `button[mat-stroked-button]`, `button[mat-button]`, `mat-form-field`, `mat-card`, `mat-progress-bar` (2: determinate e indeterminate); que clicar no botão "Abrir diálogo" chama `MatDialog.open` (spy); e que, após marcar o controle como touched com valor vazio, o `mat-error` "Campo obrigatório." é exibido

### Implementation for User Story 1

- [X] T016 [US1] Em `src/styles/_theme.scss`, dentro de `html`, adicionar `@include mat.button-overrides((filled-label-text-size: 1.1875rem, filled-label-text-weight: 700, protected-label-text-size: 1.1875rem, protected-label-text-weight: 700, text-label-text-color: var(--app-color-on-surface), outlined-label-text-color: var(--app-color-on-surface), outlined-outline-color: var(--app-color-on-surface-variant), tonal-label-text-color: var(--app-color-on-surface)));` (19px bold ≥ 18,66px — FR-009; branco × primária = 3,28:1 só vale para texto grande; botões de texto/contornados/tonais em tamanho normal NÃO podem ter rótulo na primária — 3,14:1 — e usam on-surface, 16,48:1). Conferir nomes exatos dos tokens em `node_modules/@angular/material/button/_m3-button.scss` (ou equivalente) da versão instalada
- [X] T017 [US1] Em `src/styles/_theme.scss`, adicionar `@include mat.form-field-overrides((outlined-error-outline-color: var(--app-color-error-text), outlined-error-focus-outline-color: var(--app-color-error-text), outlined-error-hover-outline-color: var(--app-color-error-text), outlined-error-label-text-color: var(--app-color-error-text), outlined-error-focus-label-text-color: var(--app-color-error-text), outlined-error-hover-label-text-color: var(--app-color-error-text), error-text-color: var(--app-color-error-text), outlined-outline-color: var(--app-color-on-surface-variant), outlined-focus-outline-color: var(--app-color-primary), outlined-label-text-color: var(--app-color-on-surface-variant), outlined-focus-label-text-color: var(--app-color-on-surface), outlined-hover-label-text-color: var(--app-color-on-surface)));` (FR-006a; contorno 5,15:1 ≥ 3:1; foco: contorno na primária — componente de interface 3,14:1 — e rótulo em on-surface, conforme US1-3/FR-009). Garantir também que o cursor do input (`caret-color`) não precise da primária para legibilidade (é indicador, permitido)
- [X] T018 [US1] Em `src/styles/_theme.scss`, adicionar `@include mat.progress-bar-overrides((active-indicator-color: var(--app-color-primary), track-color: var(--app-color-accent)));` (US1-5; risco de contraste 2,88:1 documentado em research R-11) e `@include mat.dialog-overrides((container-color: var(--app-color-surface)));` e `@include mat.card-overrides((outlined-container-color: var(--app-color-surface), elevated-container-color: var(--app-color-surface)));`
- [X] T019 [US1] Em `src/styles/_theme.scss`, aplicar indicadores de foco fortes: `@include mat.strong-focus-indicators((border-color: var(--app-color-primary), border-width: 3px));` no nível raiz (fora de `html`, conforme API) e garantir `@include mat.core();` se exigido pela versão (FR-014; 3,14:1 sobre off-white)
- [X] T020 [P] [US1] Criar `src/app/dev/theme-showcase/showcase-dialog/showcase-dialog.ts` (+ `.html`): componente standalone com `MatDialogModule` exibindo título "Diálogo de exemplo", texto "Este diálogo usa as cores do tema." e botão `mat-button` "Fechar" com `mat-dialog-close`. Sem `.scss` de cor
- [X] T021 [US1] Em `src/app/dev/theme-showcase/theme-showcase.ts`: importar `MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatDialogModule, ReactiveFormsModule`; injetar `MatDialog` via `inject()`; criar `protected readonly nameControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });`, `protected readonly progressValue = signal(60);` e método `protected openDialog(): void` que abre `ShowcaseDialog` (depende de T020)
- [X] T022 [US1] Em `src/app/dev/theme-showcase/theme-showcase.html`, adicionar seções com `<h2>`: "Botões" (`mat-flat-button` "Salvar", `mat-stroked-button` "Cancelar", `mat-button` "Detalhes", `mat-flat-button disabled` "Indisponível"); "Formulário" (`mat-form-field appearance="outline"` com `mat-label` "Nome", `input matInput [formControl]="nameControl"` e `@if (nameControl.hasError('required')) { <mat-error>Campo obrigatório.</mat-error> }`); "Card" (`mat-card appearance="outlined"` com `mat-card-title` "Card de exemplo", conteúdo e `mat-card-actions` com `mat-button` "Ação"); "Diálogo" (botão "Abrir diálogo" chamando `openDialog()`); "Progresso" (`mat-progress-bar mode="determinate" [value]="progressValue()"` + texto `{{ progressValue() }}% concluído` e `mat-progress-bar mode="indeterminate"`). Nenhum atributo `style`/classe de cor (depende de T021)

**Checkpoint**: US1 validável isoladamente pelo quickstart (linhas US1-1 a US1-5); `npm test` verde

---

## Phase 4: User Story 2 - Tokens centralizados para componentes próprios (Priority: P2)

**Goal**: Componentes próprios usam tokens nomeados; nenhum hex fora da fonte central; mudança de cor em 1 lugar (FR-003, FR-004, FR-007, FR-008, SC-002, SC-003, SC-004)

**Independent Test**: Componente de exemplo usa só `var(--app-color-*)`; alterar `--app-color-primary` em `_tokens.scss` muda botões e o componente; `npm run lint:colors` e `npm run lint:contrast` saem com 0

### Verificação automática para User Story 2

> Checagem de contraste como script Node (sem `@types/node` nem leitura de arquivo dentro do Vitest/jsdom — research R-10, analyze U1).

- [X] T023 [P] [US2] Criar `scripts/check-color-contrast.mjs` (Node ESM, sem dependências) com funções `parseHexColor(hex)` (aceita apenas `/^#[0-9a-fA-F]{6}$/`, senão lança erro), `relativeLuminance(hex)` (WCAG 2.1: canal/255; `≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`; `0.2126R + 0.7152G + 0.0722B`) e `contrastRatio(foreground, background)` (`(Lmax+0.05)/(Lmin+0.05)`), cada uma ≤ 20 linhas. Antes das checagens, autoverificar: `contrastRatio('#FFFFFF','#000000')` = 21 e `contrastRatio('#FFFFFF','#00A35C')` = 3.28 (2 casas) — abortar com exit 1 se divergir
- [X] T024 [US2] Em `scripts/check-color-contrast.mjs`, ler `src/styles/_tokens.scss` com `readFileSync`, extrair `--app-color-<nome>: #RRGGBB` por regex e validar: (a) o arquivo declara exatamente os 14 tokens de contracts/css-tokens.md; (b) pares com mínimos declarados em um array `PAIRS` no script: on-surface×surface ≥ 4.5, on-surface×accent ≥ 4.5, on-surface-variant×surface ≥ 4.5, error-text×surface ≥ 4.5, primary×surface ≥ 3 (somente texto grande/UI), on-primary×primary ≥ 3 (somente texto grande); (c) nenhum token a distância euclidiana RGB ≤ 60 de `#FF0000, #0000FF, #FF00FF, #800080, #FF1493, #FF8000, #FFFF00` (FR-006). Imprimir tabela `par | razão | mínimo | OK/FALHA` e `process.exit(1)` se qualquer falha (depende de T023)

### Implementation for User Story 2

- [X] T025 [US2] Adicionar em `package.json` o script `"lint:contrast": "node scripts/check-color-contrast.mjs"` e rodá-lo — deve sair 0 (depende de T024)
- [X] T026 [P] [US2] Criar `scripts/check-hex-colors.mjs` (Node ESM, sem dependências): percorrer recursivamente `src/` arquivos `.scss, .css, .html, .ts` (ignorando `*.spec.ts`; `scripts/` não é varrido), excluindo `src/styles/_tokens.scss`; procurar `/#[0-9a-fA-F]{3,8}\b/` (ignorando ocorrências dentro de comentários `//` de SCSS é opcional) e `/\b(rgb|rgba|hsl|hsla)\(/`; imprimir `arquivo:linha: trecho` e `process.exit(1)` se houver ocorrências, senão imprimir "Nenhuma cor literal fora de src/styles/_tokens.scss." e sair 0 (research R-09)
- [X] T027 [US2] Adicionar em `package.json` o script `"lint:colors": "node scripts/check-hex-colors.mjs"` e rodá-lo — deve sair 0 (corrigir ocorrências se houver; depende de T026)
- [X] T028 [P] [US2] Criar componente de exemplo `src/app/dev/theme-showcase/token-swatch/token-swatch.ts` (+ `.html`, `.scss`): standalone, `input.required<string>()` `label`, exibe um bloco com o rótulo; no `.scss` usar SOMENTE `background: var(--app-color-accent); color: var(--app-color-on-surface); border-left: 6px solid var(--app-color-primary); padding: 12px 16px; border-radius: 8px;` (US2-1)
- [X] T029 [US2] Em `src/app/dev/theme-showcase/theme-showcase.html`/`.ts`, adicionar seção "Componente próprio com tokens" com `<app-token-swatch label="Este bloco usa apenas tokens centrais." />` e um link de tamanho normal `<a href="#">Link de exemplo</a>` estilizado em `theme-showcase.scss` com `color: var(--app-color-on-surface); text-decoration: underline;` (FR-009: links normais escuros e sublinhados) (depende de T028)

**Checkpoint**: US2 validável — trocar temporariamente `--app-color-primary` e observar mudança global; reverter

---

## Phase 5: User Story 3 - Mensagens de status com cores semânticas acessíveis (Priority: P2)

**Goal**: Snackbars de erro, sucesso, info e alerta aplicados apenas pelo tipo (FR-005, FR-005a, FR-010)

**Independent Test**: Em `/dev/tema`, disparar os 4 snackbars e conferir fundo/texto/botão de ação: erro `#FEE2E2`/`#991B1B`, sucesso `#DCFCE7`/`#166534`, info `#DBEAFE`/`#1D4ED8`, alerta `#FEF3C7`/`#92400E`

### Tests for User Story 3

- [X] T030 [P] [US3] Criar `src/app/core/feedback/feedback-snackbar.service.spec.ts` com `MatSnackBar` mockado (provider `{ provide: MatSnackBar, useValue: { open: vi.fn() } }`): para cada `FeedbackType` (`'error' | 'success' | 'info' | 'warning'`) verificar que `open` recebe `message`, `action` (ou `undefined` quando omitido) e config com `panelClass: ['app-snackbar', 'app-snackbar--<type>']`, `duration: 5000` (fixo para todos os tipos) e `politeness` `'assertive'` para error/warning e `'polite'` para success/info (contracts/feedback-snackbar-service.md)
- [X] T031 [P] [US3] Adicionar ao array `PAIRS` de `scripts/check-color-contrast.mjs` os pares de status (≥ 4.5 cada): error-text×error-bg, success-text×success-bg, info-text×info-bg, warning-text×warning-bg; rodar `npm run lint:contrast` (se US3 for feita antes de US2, executar T023–T025 primeiro)

### Implementation for User Story 3

- [X] T032 [P] [US3] Criar `src/app/core/feedback/feedback-type.ts` com `export type FeedbackType = 'error' | 'success' | 'info' | 'warning';`
- [X] T033 [US3] Criar `src/app/core/feedback/feedback-snackbar.service.ts` (`@Injectable({ providedIn: 'root' })`, `MatSnackBar` via `inject()`): método `open(message: string, type: FeedbackType, action?: string): MatSnackBarRef<TextOnlySnackBar>` que chama `this.snackBar.open(message, action, { duration: 5000, panelClass: ['app-snackbar', \`app-snackbar--${type}\`], politeness: ... })`; mapear politeness com um `Record<FeedbackType, AriaLivePoliteness>` constante (depende de T032; faz T030 passar)
- [X] T034 [US3] Em `src/styles/_theme.scss`, para cada tipo adicionar `.app-snackbar--<type> { @include mat.snack-bar-overrides((container-color: var(--app-color-<type>-bg), supporting-text-color: var(--app-color-<type>-text), button-color: var(--app-color-<type>-text))); }` para `error`, `success`, `info`, `warning` (research R-05; usar `@each` sobre a lista de tipos)
- [X] T035 [US3] Em `src/app/dev/theme-showcase/theme-showcase.ts`/`.html`, injetar `FeedbackSnackbarService` e adicionar seção "Mensagens" com 4 `mat-stroked-button`: "Mostrar erro" → `open('Não foi possível salvar.', 'error', 'Fechar')`, "Mostrar sucesso" → `open('Dados salvos com sucesso.', 'success', 'Fechar')`, "Mostrar informação" → `open('Há uma nova versão disponível.', 'info', 'Fechar')`, "Mostrar alerta" → `open('Sua sessão expira em breve.', 'warning', 'Fechar')`, via um método `protected showFeedback(type: FeedbackType): void` com mensagens num `Record<FeedbackType, string>`; ampliar `theme-showcase.spec.ts` verificando que cada botão chama o serviço com o tipo correto (depende de T033)

**Checkpoint**: US3 validável isoladamente (quickstart linha US1-6 / US3)

---

## Phase 6: User Story 4 - Tipografia padronizada e aparência responsiva (Priority: P3)

**Goal**: Roboto auto-hospedada (400/500/700) com fallback, escala M3 aplicada, demo sem rolagem horizontal em 360/768/1280 (FR-011, FR-012, FR-013, SC-005, SC-007, SC-009)

**Independent Test**: DevTools mostra Roboto renderizada; 0 requisições a domínios externos de fonte; com `*.woff2` bloqueado o texto aparece no fallback; sem rolagem horizontal em 360/768/1280

### Implementation for User Story 4

- [X] T036 [US4] Reescrever `src/styles/_typography.scss`: `@use '@fontsource/roboto/latin-400.css'; @use '@fontsource/roboto/latin-500.css'; @use '@fontsource/roboto/latin-700.css';` (se os arquivos `latin-*` não existirem na versão instalada, usar `400.css`/`500.css`/`700.css` — verificar em `node_modules/@fontsource/roboto/`; se `@use` de `.css` não for aceito, adicionar os três arquivos ao array `styles` de `angular.json` antes de `src/styles.scss`) e `:root { --app-font-family: Roboto, "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif; }` (research R-07; os CSS do Fontsource usam `font-display: swap`)
- [X] T037 [US4] Verificar após `npm run build` que `dist/rag-front/browser/` contém os `.woff2` da Roboto (somente pesos 400/500/700) e que `grep -r "fonts.googleapis\|fonts.gstatic" dist/` não retorna nada (SC-009); ajustar T036 se necessário
- [X] T038 [US4] Em `src/app/dev/theme-showcase/theme-showcase.scss`, garantir responsividade sem larguras fixas: `.showcase` com `width: 100%` e `max-width` fluido; `mat-form-field` com `width: 100%; max-width: 400px;`; `section` com `flex-wrap: wrap`; manter o arquivo < 4kB (orçamento `anyComponentStyle`) e sem cores além de `var(--app-color-*)`
- [X] T039 [US4] Em `src/app/dev/theme-showcase/theme-showcase.html`, adicionar seção "Tipografia" com exemplos usando as classes da escala M3 do Material: `<p class="mat-font-headline-sm">Título</p>`, `mat-font-title-md` "Subtítulo", `mat-font-body-md` "Texto de corpo", `mat-font-label-md` "Rótulo" (se as classes utilitárias não forem emitidas pela versão instalada, usar `font: var(--mat-sys-headline-small)` etc. em `theme-showcase.scss`)
- [ ] T040 [US4] Validar manualmente em DevTools (device toolbar) larguras 360, 768 e 1280px: sem rolagem horizontal (`document.documentElement.scrollWidth <= innerWidth`) e alvos interativos ≥ 44×44px; corrigir `theme-showcase.scss` se necessário (FR-013, SC-005)

**Checkpoint**: Todas as stories funcionais e independentes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Garantias de produção, documentação e validação final

- [X] T041 Validar SC-008: `npm run build` e confirmar que nenhum arquivo em `dist/rag-front/browser/` contém `Demonstração do tema` nem `app-theme-showcase` (`grep -r`); servir com `npx http-server dist/rag-front/browser -p 8080 --proxy "http://localhost:8080?"` e confirmar que `/dev/tema` não exibe a demo
- [X] T042 [P] Rodar `npm run lint:colors` (exit 0), `npm run lint:contrast` (exit 0), `npm test` (todos verdes) e `npx prettier --check "src/**/*.{ts,html,scss}" scripts` — corrigir o que falhar
- [X] T043 [P] Atualizar `README.md` com seção "Tema e cores": onde ficam os tokens (`src/styles/_tokens.scss`), regra de não usar hex fora dele, como usar `FeedbackSnackbarService`, link para `/dev/tema` (só dev), os comandos `npm run lint:colors` e `npm run lint:contrast`, e as regras de uso: (1) cor nova/complementar (FR-007) só como token em `_tokens.scss` + par em `scripts/check-color-contrast.mjs`; (2) primária como cor de texto só em texto grande (FR-009); (3) se o rótulo grande não couber num botão preenchido, usar `mat-stroked-button`/`mat-button` (caso-limite de botões compactos)
- [ ] T044 Executar todo o roteiro de `specs/001-material-visual-theme/quickstart.md` (inclui Lighthouse/axe e emulação de dark mode — deve permanecer claro) e inspecionar, em cada componente da demo (botões preenchido/contornado/texto, campo, card, diálogo, progresso, 4 snackbars), os estados default, hover, foco (Tab), ativo e desabilitado: nenhuma cor fora da paleta, nenhum roxo/rosa, nenhum rótulo de tamanho normal na primária; registrar desvios. R-11 (trilho do progresso 2,88:1) é desvio conhecido e aceito pela spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende de Setup (T001 obrigatório para `@angular/material`) — BLOQUEIA todas as stories
- **US1 (Phase 3)**: depende de Phase 2
- **US2 (Phase 4)**: depende de Phase 2; T029 usa a página da demo (já existe em Phase 2), independente de US1
- **US3 (Phase 5)**: depende de Phase 2; T031 depende de `scripts/check-color-contrast.mjs` (T023–T025, US2) — se US3 for feita antes de US2, executar T023–T025 antes de T031
- **US4 (Phase 6)**: depende de Phase 2
- **Polish (Phase 7)**: depende das stories desejadas

### Arquivos compartilhados (evitar conflito em paralelo)

- `src/styles/_theme.scss`: T007, T016–T019, T034 — sequenciais
- `theme-showcase.html/.ts/.spec.ts`: T014, T015, T021, T022, T029, T035, T039 — sequenciais

### Within Each User Story

- Testes escritos primeiro e falhando → implementação → checkpoint

### Parallel Opportunities

- Phase 1: T003 ‖ T004
- Phase 2: T010 ‖ T011 (após T006–T009 ou em paralelo a eles)
- US1: T020 ‖ T016–T019
- US2: T023 ‖ T026 ‖ T028 (T024 → T025 após T023)
- US3: T030 ‖ T031 ‖ T032
- Polish: T042 ‖ T043

---

## Parallel Example: User Story 2

```bash
Task: "Criar scripts/check-color-contrast.mjs (T023)"
Task: "Criar scripts/check-hex-colors.mjs (T026)"
Task: "Criar src/app/dev/theme-showcase/token-swatch/ (T028)"
```

## Parallel Example: User Story 3

```bash
Task: "Criar feedback-snackbar.service.spec.ts (T030)"
Task: "Adicionar pares de status em scripts/check-color-contrast.mjs (T031)"
Task: "Criar feedback-type.ts (T032)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) → Phase 2 (Foundational)
2. Phase 3 (US1) → **validar** pelo quickstart (US1-1 a US1-5)
3. Já entrega: todo componente Material com a identidade da marca

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → MVP visual
3. US2 → garantias (tokens, lint de cores, contraste automatizado)
4. US3 → feedback de status
5. US4 → Roboto + responsividade
6. Polish → validação de produção e documentação

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Commit após cada task ou grupo lógico
- Nomes de tokens de override do Material variam entre versões: sempre conferir em `node_modules/@angular/material/**/_m3-*.scss` antes de concluir uma task de override
