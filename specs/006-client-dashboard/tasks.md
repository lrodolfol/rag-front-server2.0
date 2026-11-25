---

description: "Task list — Área do Cliente (/dashboard)"
---

# Tasks: Área do Cliente (/dashboard)

**Input**: Design documents from `/specs/006-client-dashboard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: INCLUÍDOS — a constitution (Princípio VI) exige testes unitários para regras de negócio,
`HttpTestingController` para serviços HTTP, testes de componentes e integração para fluxos críticos;
o plan.md lista cada `*.spec.ts`. Em cada fase, escrever o spec antes (ou junto) da implementação e
vê-lo falhar primeiro.

**Organization**: Tarefas agrupadas por user story. A camada de dados (serviço, mapper, store), o
`authGuard` e o esqueleto da página ficam na Phase 2: US2, US3 e US4 são apenas estados diferentes
do mesmo store, e a rota `/dashboard` já nasce protegida (nunca existe uma janela sem guard). Cada
story adiciona só a UI/comportamento do seu escopo e pode ser testada isoladamente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story da tarefa (US1…US5)
- Todos os caminhos são relativos à raiz do repositório (projeto Angular único: `src/app/`, `public/`)

## Convenções do projeto (valem para todas as tarefas)

- Componentes standalone, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`, Signals; arquivos
  `nome.ts/.html/.scss/.spec.ts` (sem sufixo `.component`), como em `src/app/features/login/`.
- Nenhum `any` (corpos de tipo incerto lidos como `unknown` e estreitados com
  `isRecord`/`readableMessage` de `src/app/core/api/api-response-body.ts`); nenhum `console.*`;
  nenhum hexadecimal em `.scss` (só tokens `--app-color-*`); textos pt-BR centralizados em
  `dashboard-content.ts`; nomes em inglês.
- Serviços HTTP retornam o envelope tipado `Observable<ApiResponseDto<…Dto>>` (padrão de
  `src/app/core/auth/auth-api.service.ts`, Princípio III).
- Componentes não chamam `subscribe()`; o store assina com `takeUntilDestroyed`.
- Navegação com `routerLink` + `toRouterLink(AppPaths.x)` de `src/app/core/routing/app-paths.ts`.
- Testes: Vitest + jsdom via `npm test`; `HttpTestingController`, `RouterTestingHarness`,
  `vi.useFakeTimers()` para o timeout de 30 s; `vi.spyOn(console, ...)` para garantir zero saída.
- **Nenhuma dependência nova.**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ícones, configuração de URL da API e caminhos de rota usados por toda a feature

- [X] T001 [P] Adicionar 6 SVGs Material Symbols em `public/icons/`: `add.svg`, `edit.svg`, `delete.svg`, `image.svg`, `logout.svg`, `grid_view.svg` — mesmo estilo/`viewBox`/atributos dos existentes (usar `public/icons/storefront.svg` como referência), sem cores fixas além das que os existentes usam
- [X] T002 Acrescentar `'add'`, `'edit'`, `'delete'`, `'image'`, `'logout'`, `'grid_view'` ao array `APP_ICON_NAMES` em `src/app/core/icons/app-icon-name.ts` (depende de T001; `src/app/core/icons/provide-app-icons.spec.ts` deve continuar verde)
- [X] T003 [P] Adicionar `apiBaseUrl` aos environments: `apiBaseUrl: 'http://localhost:5170/api/v1'` em `src/environments/environment.development.ts` e `apiBaseUrl: '/api/v1'` em `src/environments/environment.ts` (placeholder de produção, mantendo o comentário existente)
- [X] T004 [P] Criar `API_BASE_URL = new InjectionToken<string>(...)` em `src/app/core/config/api-base-url.token.ts`, espelhando `src/app/core/config/auth-api-url.token.ts`
- [X] T005 Registrar `{ provide: API_BASE_URL, useValue: environment.apiBaseUrl }` em `src/app/app.config.ts` (depende de T003, T004)
- [X] T006 [P] Acrescentar `editBusiness: 'editar-negocio'` e `deleteBusiness: 'excluir-negocio'` ao objeto `AppPaths` em `src/app/core/routing/app-paths.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: modelos, textos, guard e redirecionamento de auth, camada de dados e esqueleto da
página (já protegido) — pré-requisitos de todas as user stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase terminar.

### Modelos e conteúdo

- [X] T007 [P] Criar `BusinessResponseDataDto` em `src/app/features/dashboard/models/business-response-data.dto.ts` com campos `readonly` exatamente como data-model.md: `name: string` ("Obrigatório para considerar a resposta válida"), `description: string`, `email: string`, `telephone: string`, `address: string`, `details: string`, `createdAt: string` (ISO 8601), `updatedAt: string` (ISO 8601); JSDoc indicando que só `name` é lido nesta feature
- [X] T008 [P] Criar modelo de apresentação `Business { readonly name: string }` em `src/app/features/dashboard/models/business.ts` — regra: "`trim()` aplicado; não vazio"; sem campo de imagem (research R-05)
- [X] T009 [P] Criar a união discriminada `BusinessLoadResult = { kind: 'found'; business: Business } | { kind: 'not-found' } | { kind: 'invalid' }` em `src/app/features/dashboard/models/business-load-result.ts`
- [X] T010 [P] Criar `type DashboardStatus = 'loading' | 'loaded' | 'empty' | 'failed'` em `src/app/features/dashboard/models/dashboard-status.ts`
- [X] T011 [P] Criar `src/app/features/dashboard/dashboard-content.ts` (padrão de `src/app/features/login/login-content.ts`) com: `DASHBOARD_PAGE_TITLE = 'Meus negócios — AchaLocal'`; `DASHBOARD_NAVIGATION_ITEMS: readonly NavigationItem[]` = `[{ label: 'Testar Chatbot', icon: 'chat', path: AppPaths.chatbot }, { label: 'Meus negócios', icon: 'grid_view', path: AppPaths.dashboard }]`; `SIGN_OUT_LABEL = 'Sair'`; `DASHBOARD_TIMEOUT_MS = 30_000`; `DASHBOARD_HEADING = 'Meus negócios'`; `DASHBOARD_SUBHEADING = 'Gerencie os negócios que você cadastrou no diretório.'`; `NEW_BUSINESS_LABEL = 'Novo negócio'`; `LOADING_TEXT = 'Carregando seus dados'`; `LOAD_ERROR_TEXT = 'Não foi possível carregar seus dados agora. Tente novamente em instantes.'`; `RETRY_LABEL = 'Tentar novamente'`; `EMPTY_HEADING = 'Nenhum negócio ainda'`; `EMPTY_TEXT = 'Cadastre seu primeiro negócio para aparecer no chatbot.'`; `REGISTER_NOW_LABEL = 'Cadastrar agora'`; `EDIT_LABEL = 'Editar'`; `DELETE_ARIA_LABEL = 'Excluir negócio'`; `CHATBOT_PREVIEW_HEADING = 'Veja como aparece no chatbot'`; `CHATBOT_PREVIEW_TEXT = 'Teste perguntas como "estou com fome" no simulador.'`; `OPEN_CHAT_LABEL = 'Abrir o chat'`

### Controle de acesso (core/auth)

- [X] T012 [P] Escrever `src/app/core/auth/auth-redirect.service.spec.ts`: `redirectToLogin()` chama `AuthSessionService.clear()` e `router.navigateByUrl('/login')`; `signOut()` chama `clear()` e `navigateByUrl('/', { replaceUrl: true })`; navegação rejeitada não gera erro não tratado nem saída no console
- [X] T013 Implementar `AuthRedirectService` (`@Injectable({ providedIn: 'root' })`) em `src/app/core/auth/auth-redirect.service.ts` conforme contracts/access-control.md: `redirectToLogin(): void` e `signOut(): void`, promessas de navegação com `.catch(() => undefined)` (depende de T012)
- [X] T014 [P] Escrever `src/app/core/auth/auth.guard.spec.ts` (`RouterTestingHarness` com rota protegida de teste e rota `login`): sem sessão → URL final `/login` e componente protegido nunca instanciado; sessão expirada → `/login` e chave `achalocal.auth-session` removida; JSON malformado → `/login` e chave removida; sessão válida → rota ativada; nenhuma chamada HTTP; zero `console.*`
- [X] T015 Implementar `authGuard: CanActivateFn` em `src/app/core/auth/auth.guard.ts` conforme contracts/access-control.md: devolve `true` quando `inject(AuthSessionService).read()` não é `null`; senão `inject(Router).createUrlTree([toRouterLink(AppPaths.login)])`; síncrono, sem HTTP (depende de T014)

### Camada de dados da feature

- [X] T016 [P] Escrever `src/app/features/dashboard/services/business-api.service.spec.ts` com `HttpTestingController`: `getClientBusiness(42)` faz `GET` em `${API_BASE_URL}/42/business` (URL exata, sem query), sem corpo, e **não** define o cabeçalho `Authorization`; emite o envelope recebido sem alteração
- [X] T017 Implementar `BusinessApiService` (`providedIn: 'root'`) em `src/app/features/dashboard/services/business-api.service.ts`, no padrão de `src/app/core/auth/auth-api.service.ts`: injeta `HttpClient` e `API_BASE_URL`; `getClientBusiness(clientId: number): Observable<ApiResponseDto<BusinessResponseDataDto>>` implementado com `http.get<ApiResponseDto<BusinessResponseDataDto>>(...)` na URL `{baseUrl}/{clientId}/business` (contracts/business-api.md, Princípio III); único ponto HTTP da feature; erros propagados sem tratamento e sem timeout aqui (depende de T004, T007, T016)
- [X] T018 [P] Escrever `src/app/features/dashboard/services/business-response.mapper.spec.ts` cobrindo cada linha da tabela "Mapeamento" de contracts/business-api.md: sucesso com `data.name` não vazio → `found` com `name` em `trim`; `data: null` → `not-found`; `HttpErrorResponse` 404 → `not-found`; `success: false`, `data` não-objeto, `name` ausente/vazio/só espaços/não-string → `invalid`; `HttpErrorResponse` status 0, 400, 403, 500, 503, `TimeoutError` e erro qualquer → `invalid`
- [X] T019 Implementar `src/app/features/dashboard/services/business-response.mapper.ts` com duas funções puras: `toBusinessLoadResult(response: ApiResponseDto<BusinessResponseDataDto>): BusinessLoadResult` — a tipagem descreve o contrato, mas o servidor pode mandar qualquer coisa, então validar defensivamente tratando `response` e `response.data` como `unknown` com `isRecord`/`readableMessage` de `src/app/core/api/api-response-body.ts` (regra: `success !== false` e `data` objeto com `name` texto não vazio → `found`; `data === null` → `not-found`; resto → `invalid`) — e `errorToBusinessLoadResult(error: unknown): BusinessLoadResult` (`HttpErrorResponse` 404 → `not-found`; qualquer outro → `invalid`). Comentário marcando o ramo duplo 404/`data: null` como pendente de confirmação com o backend (R-04) (depende de T007–T009, T018)
- [X] T020 [P] Escrever `src/app/features/dashboard/state/dashboard.store.spec.ts` (TestBed com `AuthSessionService` contendo sessão válida `clientId: 42`, `AuthRedirectService` espionado e `HttpTestingController`): estado inicial `loading`; `found` → `loaded` + `business()`; 404 e `data: null` → `empty` + `business() === null`; 500, rede (status 0), dados inválidos → `failed`; sem resposta em 30 000 ms (`vi.useFakeTimers()`) → `failed`; `load()` a partir de `failed` volta a `loading` e limpa `business`; `load()` durante `loading` com requisição em curso é ignorado (só 1 requisição); **`load()` sem sessão válida (sessão expirada/limpa antes da chamada) → `redirectToLogin()` chamado uma vez, nenhuma requisição (`expectNone`) e status inalterado**; destruir o injector cancela a requisição pendente sem erro; zero `console.*`
- [X] T021 Implementar `DashboardStore` (`@Injectable()`, sem `providedIn`) em `src/app/features/dashboard/state/dashboard.store.ts` conforme data-model.md "Transições" e "Regras": `status = signal<DashboardStatus>('loading')`, `business = signal<Business | null>(null)` (expostos como readonly); `load(): void` que (1) ignora a chamada se já houver requisição em curso; (2) lê a sessão com `AuthSessionService.read()` e, se `null`, chama `AuthRedirectService.redirectToLogin()` e retorna sem requisição e sem mudar o status; (3) senão coloca `loading`, limpa `business` e assina `BusinessApiService.getClientBusiness(session.clientId).pipe(map(toBusinessLoadResult), timeout(DASHBOARD_TIMEOUT_MS), catchError((error: unknown) => of(errorToBusinessLoadResult(error))), takeUntilDestroyed(destroyRef))`, aplicando `found → loaded`, `not-found → empty`, `invalid → failed` (depende de T010, T011, T013, T017, T019, T020)

### Esqueleto da página e rota protegida

- [X] T022 Criar `DashboardPage` em `src/app/features/dashboard/dashboard-page.ts/.html/.scss` (padrão de `src/app/features/login/login-page.ts`): `selector: 'app-dashboard-page'`, `providers: [DashboardStore]`, imports `SiteHeader`, `MatProgressSpinner`; chama `store.load()` no construtor; template com `<app-site-header [navigationItems]="navigationItems" />` (`DASHBOARD_NAVIGATION_ITEMS`), `<main>` com contêiner central (máx. 1240 px, padding lateral 16 px), cabeçalho da seção (`h1` `DASHBOARD_HEADING` + `p` `DASHBOARD_SUBHEADING`) e `@switch (status())` com o caso `loading` implementado (`mat-progress-spinner` indeterminado dentro de contêiner `role="status"` com texto visualmente oculto `LOADING_TEXT`) e os casos `loaded`/`empty`/`failed` vazios para as stories; sem rolagem horizontal em 320 px (depende de T011, T021)
- [X] T023 Trocar a rota `AppPaths.dashboard` em `src/app/app.routes.ts`: remover o placeholder `ComingSoonPage` (e o comentário "Placeholder até a feature de dashboard") e usar `title: 'Meus negócios — AchaLocal'`, `canActivate: [authGuard]` e `loadComponent: () => import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage)` — a rota já nasce protegida (depende de T015, T022)
- [X] T024 Criar `src/app/features/dashboard/dashboard-page.spec.ts` com setup base (sessão válida em `AuthSessionService`, `provideHttpClient()`, `provideHttpClientTesting()`, `provideRouter([])`, `API_BASE_URL`, ícones) e testes do esqueleto: `h1` "Meus negócios", subtítulo exato, spinner com `role="status"` e texto "Carregando seus dados" enquanto a requisição está pendente, exatamente 1 `GET …/42/business` ao abrir (depende de T022)

**Checkpoint**: rota protegida pelo guard, camada de dados testada e página exibindo carregamento —
user stories podem começar

---

## Phase 3: User Story 1 - Acesso restrito a clientes autenticados (Priority: P1) 🎯 MVP

**Goal**: `/dashboard` só abre com sessão completa e não expirada (guard da Phase 2); toda
requisição ao serviço leva a credencial, e quando a sessão expira com a página aberta ou o serviço
a recusa (401), a sessão é descartada e o cliente vai a `/login`, sem ver conteúdo nem erro técnico.

**Independent Test**: abrir `/dashboard` (a) sem sessão, (b) com `expiresAt` no passado, (c) com JSON
malformado em `sessionStorage['achalocal.auth-session']`, (d) com sessão válida — só (d) exibe a área
do cliente; com a página aberta, expirar a sessão e acionar "Tentar novamente" ou receber 401 →
`/login` (quickstart passos 1–3, 5, 10).

### Tests for User Story 1 ⚠️

- [X] T025 [P] [US1] Escrever `src/app/core/auth/auth-token.interceptor.spec.ts` (`provideHttpClient(withInterceptors([authTokenInterceptor]))` + `HttpTestingController`, `API_BASE_URL = 'http://api.test/api/v1'`, `AUTH_API_URL = 'http://api.test/api/v1/auth'`, `AuthRedirectService` espionado): URL no escopo com sessão válida recebe `Authorization: Bearer <accessToken>` e URL inalterada; URL de chat (`CHAT_API_URL`), `…/auth/login` e `http://api.test/api/v10/x` (prefixo parcial) passam sem cabeçalho e seu 401 **não** redireciona; sem sessão válida no escopo → `redirectToLogin()` e nenhuma requisição enviada (`expectNone`), observable completa sem emitir; resposta 401 no escopo → `redirectToLogin()` e completa sem erro; 403/404/500 repassados como erro sem redirecionar; token nunca em `console.*`
- [X] T026 [P] [US1] Em `src/app/app.routes.spec.ts`, cobrir com `RouterTestingHarness` e as rotas reais: `/dashboard` sem sessão, expirada e malformada → `/login` sem renderizar `app-dashboard-page`; com sessão válida → `DashboardPage` e título da aba `Meus negócios — AchaLocal` (FR-001–003, SC-001)

### Implementation for User Story 1

- [X] T027 [US1] Implementar `authTokenInterceptor: HttpInterceptorFn` em `src/app/core/auth/auth-token.interceptor.ts` conforme research R-02 e contracts/access-control.md: escopo `req.url.startsWith(apiBaseUrl + '/') && !req.url.startsWith(authApiUrl + '/')` (fora do escopo → `next(req)` intacto); `read()` nulo → `AuthRedirectService.redirectToLogin()` + `return EMPTY`; senão envia `req.clone({ setHeaders: { Authorization: tokenType + ' ' + accessToken } })` com `catchError` que, para `HttpErrorResponse` com status 401, chama `redirectToLogin()` e devolve `EMPTY`, repassando os demais com `throwError(() => error)` (depende de T004, T013, T025)
- [X] T028 [US1] Em `src/app/app.config.ts`, trocar `provideHttpClient(withFetch())` por `provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor]))` (depende de T027)
- [X] T029 [US1] Em `src/app/features/dashboard/dashboard-page.spec.ts`, adicionar cenários US1-5/US4-3 com o interceptor registrado: (a) serviço responde 401 → sessão removida, navegação para `/login`, nenhuma mensagem de erro exibida; (b) página em `failed`, sessão expirada em seguida, clicar "Tentar novamente" → `/login` sem nova requisição (depende de T028)
- [X] T030 [US1] Rodar `npm test` e confirmar que os specs das features 004/005 (`src/app/features/register/**`, `src/app/features/login/**`, `src/app/core/auth/auth-api.service.spec.ts`) continuam verdes com o interceptor registrado

**Checkpoint**: US1 completa — acesso protegido em toda forma de navegação; token só em `Authorization`

---

## Phase 4: User Story 2 - Ver o próprio negócio (Priority: P1)

**Goal**: cliente com negócio vê o cartão (ícone de imagem padrão + nome) com "Editar" e "Excluir",
sem "Novo negócio"; as ações levam a páginas "em breve" protegidas.

**Independent Test**: com sessão válida e resposta 200 com `data.name`, a página mostra o cartão com
o nome; "Editar" → `/editar-negocio`, "Excluir" → `/excluir-negocio`; nenhum "Novo negócio"
(quickstart passos 4–6).

### Tests for User Story 2 ⚠️

- [X] T031 [P] [US2] Escrever `src/app/features/dashboard/business-card/business-card.spec.ts`: renderiza nome em `h2` com atributo `title` igual ao nome completo; ícone `image` com `aria-hidden="true"`; link/botão "Editar" com `routerLink` `/editar-negocio`; botão de ícone com `aria-label="Excluir negócio"` levando a `/excluir-negocio`; nome muito longo não gera rolagem horizontal (classe de ellipsis aplicada); nome com HTML é exibido como texto (interpolação)

### Implementation for User Story 2

- [X] T032 [US2] Criar `BusinessCard` em `src/app/features/dashboard/business-card/business-card.ts/.html/.scss` (`selector: 'app-business-card'`, `business = input.required<Business>()`) conforme contracts/dashboard-ui.md: `mat-card appearance="outlined"` de até 600 px; área superior com `mat-icon svgIcon="image" aria-hidden="true"` sobre `--app-color-accent`; `h2` com `{{ business().name }}` em uma linha (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`) e `[title]`; `a mat-stroked-button` com ícone `edit` "Editar" → `toRouterLink(AppPaths.editBusiness)`; `a mat-icon-button` com ícone `delete` em `--app-color-error-text` e `aria-label` `DELETE_ARIA_LABEL` → `toRouterLink(AppPaths.deleteBusiness)`; ambos operáveis por teclado (depende de T002, T006, T008, T011, T031)
- [X] T033 [US2] Adicionar em `src/app/app.routes.ts` as rotas `AppPaths.editBusiness` (`title: 'Edição de negócio — em breve'`, `data: { featureName: 'Edição de negócio' }`) e `AppPaths.deleteBusiness` (`title: 'Exclusão de negócio — em breve'`, `data: { featureName: 'Exclusão de negócio' }`), ambas com `loadComponent: loadComingSoonPage` e `canActivate: [authGuard]` (depende de T006, T015)
- [X] T034 [US2] Em `src/app/app.routes.spec.ts`, testar que `/editar-negocio` e `/excluir-negocio` exibem `ComingSoonPage` com sessão válida (título da aba correto) e redirecionam a `/login` sem sessão (depende de T033)
- [X] T035 [US2] Em `src/app/features/dashboard/dashboard-page.html/.ts`, preencher `@case ('loaded')` com `<app-business-card [business]="business" />` (usar `@if (store.business(); as business)` ou `computed` não nulo; sem lógica complexa no template) e importar `BusinessCard` (depende de T032)
- [X] T036 [US2] Em `src/app/features/dashboard/dashboard-page.spec.ts`, cobrir US2: spinner visível até a resposta; resposta 200 com negócio → cartão com o nome e sem botão "Novo negócio"; spinner removido (depende de T035)

**Checkpoint**: US1 + US2 funcionam — cliente com negócio vê e acessa as ações "em breve"

---

## Phase 5: User Story 3 - Ser convidado a cadastrar o primeiro negócio (Priority: P1)

**Goal**: cliente sem negócio vê o estado vazio e o botão "Novo negócio" ao lado do título; ambos
levam a `/cadastrar-negocio` com 1 clique.

**Independent Test**: com resposta 404 (ou 200 com `data: null`), a página mostra "Nenhum negócio
ainda", o texto de convite, "Cadastrar agora" e "Novo negócio", ambos com destino
`/cadastrar-negocio` (quickstart passo 8).

### Tests for User Story 3 ⚠️

- [X] T037 [P] [US3] Escrever `src/app/features/dashboard/business-empty-state/business-empty-state.spec.ts`: ícone `storefront` com `aria-hidden="true"`; `h2` "Nenhum negócio ainda"; texto "Cadastre seu primeiro negócio para aparecer no chatbot."; botão "Cadastrar agora" com ícone `add` e `routerLink` `/cadastrar-negocio`

### Implementation for User Story 3

- [X] T038 [US3] Criar `BusinessEmptyState` em `src/app/features/dashboard/business-empty-state/business-empty-state.ts/.html/.scss` (`selector: 'app-business-empty-state'`, sem inputs) conforme contracts/dashboard-ui.md: `mat-card appearance="outlined"` centralizado; ícone `storefront` em quadrado `--app-color-accent` (`aria-hidden`); `h2` `EMPTY_HEADING`; `p` `EMPTY_TEXT`; `a mat-flat-button` com ícone `add` `REGISTER_NOW_LABEL` → `toRouterLink(AppPaths.registerBusiness)` (depende de T002, T011, T037)
- [X] T039 [US3] Em `src/app/features/dashboard/dashboard-page.ts/.html/.scss`: preencher `@case ('empty')` com `<app-business-empty-state />`; adicionar `showNewBusinessAction = computed(() => store.status() === 'empty')` e, no cabeçalho da seção, `@if (showNewBusinessAction())` um `a mat-flat-button` com ícone `add` `NEW_BUSINESS_LABEL` → `toRouterLink(AppPaths.registerBusiness)` à direita do título; SCSS: ≥ 600 px título à esquerda e botão à direita; < 600 px empilhados com botão em largura total (depende de T038)
- [X] T040 [US3] Em `src/app/features/dashboard/dashboard-page.spec.ts`, cobrir US3: resposta 404 e resposta 200 com `data: null` → estado vazio completo + botão "Novo negócio"; ambos com `href` `/cadastrar-negocio`; "Novo negócio" ausente nos estados `loading`, `loaded` e `failed` (depende de T039)

**Checkpoint**: US1–US3 funcionam — todo cliente (com ou sem negócio) vê um estado útil

---

## Phase 6: User Story 4 - Tratar falha ao obter os dados do negócio (Priority: P2)

**Goal**: falha de rede, timeout de 30 s, 4xx (≠401/404), 5xx ou dados inválidos exibem a mensagem
fixa em pt-BR com "Tentar novamente", sem detalhes técnicos e sem prender a página em carregamento.

**Independent Test**: com o serviço respondendo 500 (ou sem resposta por 30 s), a página exibe
"Não foi possível carregar seus dados agora. Tente novamente em instantes." e "Tentar novamente";
acionar o botão mostra o spinner e, com resposta 200, o cartão (quickstart passo 9).

### Implementation for User Story 4

- [X] T041 [US4] Em `src/app/features/dashboard/dashboard-page.ts/.html/.scss`, preencher `@case ('failed')` com bloco `role="alert"` contendo `p` `LOAD_ERROR_TEXT` e `button mat-stroked-button` `RETRY_LABEL` com `(click)="retry()"`, onde `retry(): void` chama `store.load()`; importar `MatButton`; nunca exibir `message`, `status`, `title`, `instance` ou `correlationId` do serviço (depende de T022)
- [X] T042 [US4] Em `src/app/features/dashboard/dashboard-page.spec.ts`, cobrir US4: 500, 503, 403, erro de rede (status 0) e 200 com `data` sem `name` → mensagem fixa + "Tentar novamente" dentro de `role="alert"`; sem resposta em 30 000 ms (`vi.useFakeTimers()`) → mesma mensagem e spinner removido; o texto `message` do envelope de erro nunca aparece no DOM; clicar "Tentar novamente" → spinner visível e nova `GET` → resposta 200 → cartão; duplo clique gera só 1 requisição; zero `console.*` (depende de T041)

**Checkpoint**: US1–US4 funcionam — a página nunca fica presa nem expõe detalhes técnicos

---

## Phase 7: User Story 5 - Navegar e sair pela área do cliente (Priority: P2)

**Goal**: cabeçalho com "Testar Chatbot", "Meus negócios" e "Sair"; "Sair" descarta a sessão, leva à
tela inicial e impede voltar sem novo login; cartão "Veja como aparece no chatbot" leva ao chatbot.

**Independent Test**: na área do cliente, verificar os três itens com ícones; "Sair" → `/` e sessão
removida; voltar/abrir `/dashboard` → `/login`; "Testar Chatbot"/"Abrir o chat" → `/chatbot`;
logotipo → `/` (quickstart passos 7 e 11).

### Tests for User Story 5 ⚠️

- [X] T043 [P] [US5] Em `src/app/core/layout/site-header/site-header.spec.ts`, adicionar teste de projeção: um host de teste projeta `<button>` dentro de `<app-site-header>` e o botão aparece dentro da `mat-toolbar`, depois dos itens de navegação; testes existentes continuam verdes
- [X] T044 [P] [US5] Escrever `src/app/features/dashboard/chatbot-preview-card/chatbot-preview-card.spec.ts`: ícone `chat` com `aria-hidden`; `h2` "Veja como aparece no chatbot"; texto exato `Teste perguntas como "estou com fome" no simulador.`; botão "Abrir o chat" com `routerLink` `/chatbot`

### Implementation for User Story 5

- [X] T045 [US5] Em `src/app/core/layout/site-header/site-header.html`, adicionar `<ng-content />` logo após o bloco `@for` dos itens de navegação (dentro de `.container`); sem outras mudanças em `site-header.ts`/`.scss` e sem alterar o cabeçalho da tela inicial (depende de T043)
- [X] T046 [US5] Criar `ChatbotPreviewCard` em `src/app/features/dashboard/chatbot-preview-card/chatbot-preview-card.ts/.html/.scss` (`selector: 'app-chatbot-preview-card'`, sem inputs) conforme contracts/dashboard-ui.md: `mat-card` com fundo `--app-color-accent`, ícone `chat` (`aria-hidden`), `h2` `CHATBOT_PREVIEW_HEADING`, `p` `CHATBOT_PREVIEW_TEXT`, `a mat-stroked-button` `OPEN_CHAT_LABEL` → `toRouterLink(AppPaths.chatbot)` (depende de T011, T044)
- [X] T047 [US5] Em `src/app/features/dashboard/dashboard-page.ts/.html`: projetar dentro do `app-site-header` `<button mat-button type="button" (click)="signOut()"><mat-icon svgIcon="logout" aria-hidden="true" />{{ signOutLabel }}</button>`, onde `signOut(): void` delega a `inject(AuthRedirectService).signOut()`; renderizar `<app-chatbot-preview-card />` abaixo do `@switch`, visível em todos os estados; importar `MatIcon`, `ChatbotPreviewCard` (depende de T013, T045, T046)
- [X] T048 [US5] Em `src/app/features/dashboard/dashboard-page.spec.ts`, cobrir US5: cabeçalho com logotipo "AchaLocal" (link `/`), "Testar Chatbot" (`/chatbot`, ícone `chat`), "Meus negócios" (`/dashboard`, ícone `grid_view`) e botão "Sair" (ícone `logout`); clicar "Sair" → chave `achalocal.auth-session` removida e URL `/`; cartão do chatbot presente nos estados `loading`, `loaded`, `empty` e `failed` com "Abrir o chat" → `/chatbot` (depende de T047)

**Checkpoint**: todas as user stories funcionam de forma independente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: fluxo crítico ponta a ponta, conformidade com a constitution, documentação e validação
final

- [X] T049 Em `src/app/app.routes.spec.ts`, teste de integração do fluxo crítico (Princípio VI) com `RouterTestingHarness`, as rotas reais e `provideLocationMocks()`: sessão salva (simulando login) → `/dashboard` exibe a área → "Sair" → `/` → `Location.back()` (via `SpyLocation`) e também `navigateByUrl('/dashboard')` → ambos terminam em `/login` (FR-017, SC-004). Não usar `window.history.back()` (instável no jsdom)
- [X] T050 [P] Auditar os arquivos novos/alterados (`src/app/core/auth/`, `src/app/core/config/api-base-url.token.ts`, `src/app/features/dashboard/`) com busca por `console.`, `localStorage`, `any`, `accessToken` em templates e hexadecimais em `.scss`; corrigir qualquer ocorrência (FR-018, FR-020, SC-006)
- [X] T051 [P] Rodar `npm run lint:colors` e `npm run lint:contrast` e corrigir falhas
- [X] T052 Rodar `npm run build` e confirmar build de produção sem erros, `/dashboard` em chunk lazy e cada `.scss` da feature dentro do orçamento de 4 kB (warn) / 8 kB (error)
- [X] T053 Rodar `npm test` completo e confirmar tudo verde (incluindo features 001–005); opcionalmente `npm test -- --coverage` para conferir ≥ 70% nas regras de negócio da feature (mapper, store, guard, interceptor)
- [X] T054 [P] Atualizar `README.md` (exigência da constitution: documentação técnica atualizada em mudança de arquitetura) com uma seção `## Área do cliente (/dashboard)` no mesmo estilo das seções de `/register` e `/login`: rota protegida por `authGuard` (padrão para futuras rotas autenticadas), `authTokenInterceptor` (envia `Authorization` só para `API_BASE_URL` fora de `/auth`; 401 → `/login`), nova variável `apiBaseUrl` nos environments, endpoint `GET {apiBaseUrl}/{clientId}/business` e a nota de CORS (UAT precisa liberar o cabeçalho `Authorization` no preflight)
- [ ] T055 Executar o roteiro manual de `specs/006-client-dashboard/quickstart.md` (passos 1–15) com as contas A (com negócio) e B (sem negócio), incluindo 320/768/1920 px, navegação por teclado, console vazio e tempo até o estado correto ≤ 3 s (SC-002)
- [ ] T056 Confirmar com o backend o formato de "cliente sem negócio" (404 ou 200 + `data: null`, research R-04); se confirmado um só, remover o ramo não usado em `src/app/features/dashboard/services/business-response.mapper.ts` e o teste correspondente em `business-response.mapper.spec.ts`, e atualizar `specs/006-client-dashboard/contracts/business-api.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — começa imediatamente
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories. Ao final, a rota
  `/dashboard` já está protegida pelo `authGuard` (T023)
- **US1 (Phase 3)**: depende da Phase 2; adiciona interceptor (credencial + 401) e testes de rota
- **US2, US3, US4, US5 (Phases 4–7)**: dependem só da Phase 2; podem rodar em paralelo entre si
  e com a US1 — mas todas editam `dashboard-page.html/.ts/.spec.ts`, então em paralelo é preciso
  coordenar merges nesses arquivos
- **Polish (Phase 8)**: depende de todas as stories

### User Story Dependencies

- **US1 (P1)**: independente após Phase 2
- **US2 (P1)**: independente após Phase 2 (T033 usa o `authGuard` da Phase 2)
- **US3 (P1)**: independente após Phase 2
- **US4 (P2)**: independente após Phase 2 (os cenários de 401/sessão expirada ficam em T029, US1)
- **US5 (P2)**: independente após Phase 2 (usa `AuthRedirectService` da Phase 2)

### Within Each User Story

- Spec do componente/serviço antes da implementação (deve falhar primeiro)
- Subcomponente antes de integrá-lo à página
- Integração na página antes do teste de integração da página
- Story concluída e verde antes de passar à próxima prioridade

### Parallel Opportunities

- Phase 1: T001, T003, T004, T006 em paralelo (T002 após T001; T005 após T003/T004)
- Phase 2: T007–T012, T014, T016, T018, T020 em paralelo (modelos, conteúdo e specs); depois T013,
  T015, T017, T019 em paralelo; T021 → T022 → T023/T024
- US1: T025 e T026 em paralelo
- Subcomponentes de stories diferentes em paralelo: T031–T032 (US2), T037–T038 (US3), T043–T046 (US5)
- Phase 8: T050, T051 e T054 em paralelo

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Modelos, textos e specs ao mesmo tempo:
Task: "T007 BusinessResponseDataDto em src/app/features/dashboard/models/business-response-data.dto.ts"
Task: "T008 Business em src/app/features/dashboard/models/business.ts"
Task: "T009 BusinessLoadResult em src/app/features/dashboard/models/business-load-result.ts"
Task: "T010 DashboardStatus em src/app/features/dashboard/models/dashboard-status.ts"
Task: "T011 Textos e navegação em src/app/features/dashboard/dashboard-content.ts"
Task: "T012 Spec do AuthRedirectService em src/app/core/auth/auth-redirect.service.spec.ts"
Task: "T014 Spec do authGuard em src/app/core/auth/auth.guard.spec.ts"
Task: "T016 Spec do BusinessApiService em src/app/features/dashboard/services/business-api.service.spec.ts"
Task: "T018 Spec do mapper em src/app/features/dashboard/services/business-response.mapper.spec.ts"
Task: "T020 Spec do store em src/app/features/dashboard/state/dashboard.store.spec.ts"
```

## Parallel Example: User Story 1

```bash
Task: "T025 Spec do authTokenInterceptor em src/app/core/auth/auth-token.interceptor.spec.ts"
Task: "T026 Testes de rota protegida em src/app/app.routes.spec.ts"
```

## Parallel Example: subcomponentes de US2, US3 e US5

```bash
Task: "T031–T032 BusinessCard em src/app/features/dashboard/business-card/"
Task: "T037–T038 BusinessEmptyState em src/app/features/dashboard/business-empty-state/"
Task: "T044, T046 ChatbotPreviewCard em src/app/features/dashboard/chatbot-preview-card/"
Task: "T043, T045 Projeção no SiteHeader em src/app/core/layout/site-header/"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — as três P1)

1. Phase 1: Setup
2. Phase 2: Foundational (CRÍTICO — bloqueia todas as stories; rota já protegida ao final)
3. Phase 3: US1 → **validar**: quickstart passos 1–3, 5 e 10
4. Phase 4: US2 → **validar**: passos 4–6
5. Phase 5: US3 → **validar**: passo 8
6. MVP pronto: área do cliente protegida mostrando o estado correto para todo cliente

US1 sozinha é a menor fatia segura (a página só com "carregando"/título, mas protegida); não faz
sentido publicar sem US2 e US3, pois todo cliente ficaria preso no spinner sem conteúdo.

### Incremental Delivery

1. Setup + Foundational → base pronta, rota protegida
2. + US1 → credencial nas requisições e tratamento de 401/sessão expirada
3. + US2 + US3 → MVP (demo)
4. + US4 → resiliência a falhas
5. + US5 → navegação completa e "Sair"
6. Polish → fluxo ponta a ponta, lints, build, README, roteiro manual, confirmação R-04

### Parallel Team Strategy

1. Equipe conclui Setup + Foundational junta
2. Depois:
   - Dev A: US1 (interceptor, testes de rota)
   - Dev B: US2 + US3 (subcomponentes + estados `loaded`/`empty`)
   - Dev C: US5 (SiteHeader, ChatbotPreviewCard, "Sair") e US4
3. Coordenar edições em `dashboard-page.html/.ts/.spec.ts` e `app.routes.ts`/`app.routes.spec.ts`

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- [USx] mapeia a tarefa à user story para rastreabilidade
- Commit após cada tarefa ou grupo lógico; parar em cada checkpoint para validar a story
- Riscos abertos (plan.md): formato "sem negócio" (R-04, T056); API sem imagem (R-05, ícone padrão);
  CORS com `Authorization` no UAT (R-09, plano B: proxy do dev server); `clientId` da sessão como
  identificador do endpoint
- Fora do escopo: CRUD real do negócio, modo escuro, planos, múltiplos negócios, endpoint de logout,
  renovação de sessão
