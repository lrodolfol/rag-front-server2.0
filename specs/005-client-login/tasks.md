---

description: "Lista de tarefas da feature 005 — Tela de Login de Clientes (/login)"
---

# Tasks: Tela de Login de Clientes (/login)

**Input**: Documentos de design em `/specs/005-client-login/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: INCLUÍDOS — a constitution (Princípio VI) exige testes unitários para regras de negócio,
`HttpTestingController` para serviços HTTP e testes de integração para fluxos críticos; o plano lista
os specs obrigatórios. Escreva cada spec ANTES da implementação correspondente e confirme que falha.

**Organization**: tarefas agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: user story da tarefa (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (projeto Angular único: `src/app/`, `public/`)

## Convenções gerais (valem para TODAS as tarefas)

- Angular 22.2 standalone, `ChangeDetectionStrategy.OnPush`, Signals, `inject()`; TypeScript estrito,
  **sem `any`** (corpos desconhecidos como `unknown` + type guards).
- Nenhuma dependência nova. Nenhum `console.*` (FR-022). Textos ao usuário em pt-BR.
- Cores só via tokens `--app-color-*` existentes (nenhum hexadecimal fora de `_tokens.scss`).
- Componentes não chamam `subscribe()`; o store assina com `takeUntilDestroyed`.
- Espelhar a estrutura e o estilo de `src/app/features/register/` (página, subcomponente de
  formulário, `models/`, `services/`, `state/`, `*-content.ts`).
- Testes: Vitest + jsdom via `npm test` (`ng test`).

---

## Phase 1: Setup (Infraestrutura compartilhada)

**Purpose**: ícone, caminhos de rota e estrutura de pastas.

- [X] T001 [P] Criar `public/icons/login.svg` com o ícone "login" do Material Symbols (Outlined, peso 400), `viewBox="0 -960 960 960"`, `fill="currentColor"`, sem `width`/`height` fixos — mesmo formato de `public/icons/person_add.svg`
- [X] T002 [P] Adicionar `'login'` à lista `APP_ICON_NAMES` em `src/app/core/icons/app-icon-name.ts` (mantendo a ordem/estilo existentes)
- [X] T003 [P] Adicionar `login: 'login'` e `dashboard: 'dashboard'` ao objeto `AppPaths` em `src/app/core/routing/app-paths.ts`
- [X] T004 Criar as pastas `src/app/core/api/`, `src/app/core/auth/`, `src/app/core/forms/` e `src/app/features/login/{login-form,models,services,state}/` (vazias até as próximas tarefas)

---

## Phase 2: Foundational (Pré-requisitos bloqueantes)

**Purpose**: promover para `core/` o código do cadastro que passa a ter dois consumidores (research
R-01), criar o modelo/serviço de sessão e o método `login()` no cliente HTTP. Refatoração SEM mudança
de comportamento: todos os specs da feature 004 devem continuar verdes.

**⚠️ CRITICAL**: nenhuma user story começa antes do fim desta fase.

### Promoção para `core/` (refatoração do cadastro)

- [X] T005 [P] Mover `src/app/features/register/models/api-response.dto.ts` para `src/app/core/api/api-response.dto.ts` sem alterar o conteúdo (`ApiResponseDto<T>`: `statusCode`, `success`, `message`, `data: T | null`, `error: ApiErrorDto | null`; `ApiErrorDto`: `title`, `status`, `detail?`, `instance`, `errors?`, `correlationId`) e atualizar os imports em `src/app/features/register/state/registration.store.ts`, `src/app/features/register/state/registration.store.spec.ts`, `src/app/features/register/register-form/register-form.spec.ts` e `src/app/features/register/services/auth-api.service.spec.ts`
- [X] T006 [P] Escrever `src/app/core/api/api-response-body.spec.ts` cobrindo: `isRecord` (objeto → true; `null`, array, string → false); `isApiResponse` (objeto com `message`, `error` ou `success` → true; objeto sem essas chaves → false); `parseApiResponseBody` (objeto envelope → objeto; string JSON de envelope → objeto; string não-JSON → `null`; JSON que não é envelope → `null`; `null`/`undefined` → `null`); `readableMessage` (string com conteúdo → string com trim; `''`, `'   '`, número, `null` → `null`)
- [X] T007 Criar `src/app/core/api/api-response-body.ts` exportando `UnknownRecord = Readonly<Record<string, unknown>>`, `isRecord`, `isApiResponse`, `parseApiResponseBody(body: unknown): UnknownRecord | null` (aceita objeto ou string JSON; JSON inválido → `null`, sem lançar) e `readableMessage(value: unknown): string | null`, extraídos verbatim dos helpers privados de `src/app/features/register/services/registration-error.mapper.ts` (`parseBody`→`parseApiResponseBody`, `parseJson` permanece privado); T006 deve passar (depende de T006)
- [X] T008 Refatorar `src/app/features/register/services/registration-error.mapper.ts` para importar `UnknownRecord`, `isRecord`, `isApiResponse`, `parseApiResponseBody` e `readableMessage` de `src/app/core/api/api-response-body.ts`, removendo as cópias locais; manter `isApiResponse` reexportado (`export { isApiResponse } from '../../../core/api/api-response-body'`) OU atualizar o import em `src/app/features/register/services/registration-error.mapper.spec.ts` para o caminho de `core/`; `npm test` dos specs do cadastro continua verde (depende de T007)
- [X] T009 [P] Mover `src/app/features/register/validators/trimmed-email.validator.ts` e `trimmed-email.validator.spec.ts` para `src/app/core/forms/` sem mudar o conteúdo; atualizar o import em `src/app/features/register/register-form/register-form.ts` (e o import relativo dentro do spec movido)
- [X] T010 Mover `src/app/features/register/services/auth-api.service.ts` e `auth-api.service.spec.ts` para `src/app/core/auth/`; ajustar imports internos (`ApiResponseDto` de `../api/api-response.dto`, `AUTH_API_URL` de `../config/auth-api-url.token`, `RegisterRequestDto`/`RegisterResponseDataDto` continuam vindo de `../../features/register/models/`) e atualizar os imports em `src/app/features/register/state/registration.store.ts`, `registration.store.spec.ts` e `src/app/features/register/register-form/register-form.spec.ts` (depende de T005)
- [X] T011 Executar `npm test` e confirmar que todos os specs existentes (cadastro, landing, rotas, chatbot) passam após T005–T010, sem nenhum arquivo restante em `src/app/features/register/models/api-response.dto.ts`, `src/app/features/register/services/auth-api.service*.ts` ou `src/app/features/register/validators/trimmed-email.validator*.ts`

### Sessão do cliente (`core/auth/`)

- [X] T012 [P] Criar `src/app/core/auth/auth-session.ts` com `export interface AuthSession { readonly accessToken: string; readonly tokenType: string; readonly expiresAt: string; /* ISO 8601 */ readonly clientId: number; }` (contracts/auth-session.md)
- [X] T013 [P] Escrever `src/app/core/auth/auth-session.service.spec.ts` (contracts/auth-session.md, "Testes"): `save` + `read` devolve a sessão; `save` grava JSON em `sessionStorage` na chave `achalocal.auth-session`; segundo `save` sobrescreve o primeiro; `expiresAt <= Date.now()` → `read()` devolve `null` e remove a chave (usar `vi.useFakeTimers`/`vi.setSystemTime`); JSON corrompido ou sem um dos campos (`accessToken` vazio, `tokenType` vazio, `expiresAt` não interpretável por `Date.parse`, `clientId` não numérico/não finito) no storage → `null` e chave removida; storage cujo `setItem`/`getItem`/`removeItem` lança (`vi.spyOn(Storage.prototype, …)`) → `save`/`read`/`clear` não lançam e a sessão continua disponível em memória; `clear()` limpa memória e storage; `localStorage` permanece vazio em todos os casos; nenhum `console.*` chamado
- [X] T014 Implementar `src/app/core/auth/auth-session.service.ts` (`@Injectable({ providedIn: 'root' })`): constante `AUTH_SESSION_STORAGE_KEY = 'achalocal.auth-session'`; campo privado em memória `AuthSession | null`; `save(session)` → memória ← session + `sessionStorage.setItem(KEY, JSON.stringify(session))` em `try/catch` silencioso; `read(): AuthSession | null` → memória, senão `sessionStorage.getItem` + `JSON.parse` + type guard (`accessToken`/`tokenType` strings não vazias, `expiresAt` com `Date.parse` válido, `clientId` número finito); inválida ou `Date.parse(expiresAt) <= Date.now()` → `clear()` e `null`; `clear()` → memória ← null + `removeItem(KEY)` em `try/catch`; nunca usa `localStorage`, nunca loga; T013 deve passar (depende de T012, T013)

### Cliente HTTP de login

- [X] T015 [P] Criar `src/app/features/login/models/login-request.dto.ts` com `export interface LoginRequestDto { readonly Email: string; readonly Password: string; }` (PascalCase, research R-02)
- [X] T016 [P] Criar `src/app/features/login/models/login-response-data.dto.ts` com `export interface LoginResponseDataDto { readonly accessToken: string; readonly tokenType: string; readonly expiresAt: string; readonly clientId: number; readonly accessCode: string; readonly business: unknown; }` (`business` é `unknown`: hoje `null`, formato não especificado)
- [X] T017 Adicionar ao `src/app/core/auth/auth-api.service.spec.ts` (`HttpTestingController`) os casos de `login()`: faz exatamente um `POST` para `${AUTH_API_URL}/login` com corpo `{ Email: 'maria@example.com', Password: 'NovaSenha123' }` e sem header `Authorization`; propaga o envelope 200 (`ApiResponseDto<LoginResponseDataDto>`) sem alterar; propaga `HttpErrorResponse` 401 sem tratamento (contracts/auth-login-api.md, "Testes de contrato") (depende de T010, T015, T016)
- [X] T018 Implementar `login(dto: LoginRequestDto): Observable<ApiResponseDto<LoginResponseDataDto>>` em `src/app/core/auth/auth-api.service.ts` → `this.http.post<…>(\`${this.baseUrl}/login\`, dto)` seguindo o mesmo padrão do método de cadastro existente; T017 deve passar (depende de T017)

**Checkpoint**: `npm test` verde; `core/api`, `core/auth` (API + sessão) e `core/forms` prontos; cadastro inalterado em comportamento.

---

## Phase 3: User Story 1 - Entrar na conta (Priority: P1) 🎯 MVP

**Goal**: em `/login`, o cliente informa e-mail e senha válidos, o formulário bloqueia com spinner
durante o envio, a sessão é guardada e o cliente vai para `/dashboard` sem mensagem.

**Independent Test**: abrir `/login` (digitando a URL), preencher `" Maria@Example.COM "` + senha,
enviar e verificar: 1 `POST` com `{"Email":"maria@example.com","Password":…}`; campos/botão
desabilitados e spinner "Entrando" visíveis durante a espera; após 200, `sessionStorage`
`achalocal.auth-session` contém `accessToken`, `tokenType`, `expiresAt`, `clientId` e a URL é
`/dashboard` ("Área do cliente — em breve").

### Tests for User Story 1 ⚠️ (escrever primeiro; devem falhar)

- [X] T019 [P] [US1] Escrever `src/app/features/login/services/login-input.mapper.spec.ts`: `toLoginInput({ email: '  Maria@Example.COM ', password: ' Senha 1 ' })` → `{ email: 'maria@example.com', password: ' Senha 1 ' }` (senha intacta); `toLoginRequestDto({ email, password })` → `{ Email: email, Password: password }`
- [X] T020 [P] [US1] Escrever `src/app/features/login/services/login-session.mapper.spec.ts` (research R-04): envelope `success: true` com `data` completo → `AuthSession` só com `accessToken`, `tokenType`, `expiresAt`, `clientId` (sem `accessCode`/`business`); `success` ausente com `data` completo → sessão; `success: false` → `null`; `data: null` → `null`; `accessToken` ausente ou `''` → `null`; `tokenType` ausente ou `''` → `null`; `expiresAt` não interpretável por `Date.parse` → `null`; `clientId` string/`NaN` → `null`; `expiresAt` já no passado → **sessão** (não rejeita; expiração é verificada na leitura); entrada não-objeto (`null`, string) → `null`
- [X] T021 [P] [US1] Escrever `src/app/features/login/state/login.store.spec.ts` (parte US1), com `LoginStore` provido via `TestBed` junto a `provideHttpClient()`, `provideHttpClientTesting()`, `provideRouter([])` e `{ provide: AUTH_API_URL, useValue: 'http://auth.test' }`: estado inicial `status === 'idle'`, `errorMessage === null`, `isSubmitting() === false`; `submit(input)` → `status === 'submitting'`, `isSubmitting() === true` e 1 `POST` para `http://auth.test/login` com o DTO normalizado; segundo `submit` enquanto `submitting` → nenhuma requisição extra (duplo envio); resposta 200 válida → `status === 'succeeded'`, `AuthSessionService.save` chamado com a sessão mapeada e `Router.navigateByUrl('/dashboard')` chamado (spy); novo login com sessão anterior salva → sessão substituída; destruir o injector do store com requisição pendente → requisição cancelada (`req.cancelled === true`), `save` não chamado, nenhum `console.*`
- [X] T022 [P] [US1] Escrever `src/app/features/login/login-form/login-form.spec.ts` (parte US1): renderiza `mat-form-field` "E-mail" (`autocomplete="email"`, `type="email"`, `maxlength="254"`) e "Senha" (`autocomplete="current-password"`, `type="password"`, `maxlength="64"`) e botão "entrar" `type="submit"`; formulário válido + clique em "entrar" ou Enter em um campo → `LoginStore.submit` chamado uma vez com `{ email, password }` normalizado; com status `submitting` → inputs, toggle e botão desabilitados e `mat-progress-spinner` com `aria-label="Entrando"` visível ao lado do botão; com status `succeeded` → continua desabilitado e spinner oculto
- [X] T023 [P] [US1] Adicionar a `src/app/app.routes.spec.ts` (com `RouterTestingHarness`): `/login` renderiza `LoginPage` com título da aba "Login — AchaLocal"; `/dashboard` renderiza `ComingSoonPage` com "Área do cliente" e título "Área do cliente — em breve"

### Implementation for User Story 1

- [X] T024 [P] [US1] Criar `src/app/features/login/models/login-input.ts` (`export interface LoginInput { readonly email: string; readonly password: string; }`), `src/app/features/login/models/login-field.ts` (`export type LoginField = 'email' | 'password';` + `export const LOGIN_FIELDS: readonly LoginField[] = ['email', 'password'];` na ordem da tela) e `src/app/features/login/models/login-status.ts` (`export type LoginStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';`)
- [X] T025 [P] [US1] Criar `src/app/features/login/login-content.ts` com os textos de contracts/login-ui.md e constantes: `LOGIN_PAGE_TITLE = 'Login — AchaLocal'`, navegação do cabeçalho `[{ label: 'início', icon: 'home', path: '/' }]` no formato `NavigationItem` usado pelo `SiteHeader`, `LOGIN_HEADING = 'Acesse sua conta'`, `LOGIN_SUBHEADING = 'Gerencie seus negócios no AchaLocal.'`, `EMAIL_LABEL = 'E-mail'`, `PASSWORD_LABEL = 'Senha'`, `SUBMIT_LABEL = 'entrar'`, `SHOW_PASSWORD_LABEL = 'Mostrar senha'`, `HIDE_PASSWORD_LABEL = 'Ocultar senha'`, `SUBMITTING_LABEL = 'Entrando'`, `REQUIRED_TEXT = 'Campo obrigatório'`, `INVALID_EMAIL_TEXT = 'Informe um e-mail válido'`, `GENERIC_ERROR_TEXT = 'Não foi possível entrar agora. Tente novamente em instantes.'`, `EMAIL_MAX_LENGTH = 254`, `PASSWORD_MAX_LENGTH = 64`, `LOGIN_TIMEOUT_MS = 30_000` (espelhar `src/app/features/register/register-content.ts`)
- [X] T026 [US1] Implementar `src/app/features/login/services/login-input.mapper.ts`: `toLoginInput(raw: { email: string; password: string }): LoginInput` (e-mail `trim().toLowerCase()`, senha sem alteração) e `toLoginRequestDto(input: LoginInput): LoginRequestDto`; T019 deve passar (depende de T015, T024)
- [X] T027 [US1] Implementar `src/app/features/login/services/login-session.mapper.ts`: `toAuthSession(response: unknown): AuthSession | null` usando `isRecord` de `src/app/core/api/api-response-body.ts`; aceita só quando `response.success !== false` e `response.data` tem `accessToken` string não vazia, `tokenType` string não vazia, `expiresAt` string com `!Number.isNaN(Date.parse(expiresAt))` e `clientId` com `Number.isFinite`; devolve objeto novo só com os 4 campos; T020 deve passar (depende de T007, T012)
- [X] T028 [US1] Implementar `src/app/features/login/state/login.store.ts` (`@Injectable()` sem `providedIn`, provido em `LoginPage`), espelhando `src/app/features/register/state/registration.store.ts`: signals `status = signal<LoginStatus>('idle')`, `errorMessage = signal<string | null>(null)` (expostos como readonly), `isSubmitting = computed(() => status() === 'submitting')`; `submit(input: LoginInput)`: ignora se `isSubmitting()` ou `status() === 'succeeded'`; `errorMessage ← null`; `status ← 'submitting'`; `AuthApiService.login(toLoginRequestDto(input))` com `timeout(LOGIN_TIMEOUT_MS)`, `takeUntilDestroyed(inject(DestroyRef))`, `catchError(() => EMPTY)` (ramo de erro completado em T037); no `next`: `toAuthSession(res)` → se válida `AuthSessionService.save(session)`, `status ← 'succeeded'`, `void router.navigateByUrl('/' + AppPaths.dashboard).catch(() => undefined)`; se `null` → `status ← 'failed'`, `errorMessage ← GENERIC_ERROR_TEXT`; `dismissError()` → `errorMessage ← null`; nenhum `console.*`; specs US1 de T021 devem passar (depende de T014, T018, T025, T026, T027)
- [X] T029 [US1] Criar `src/app/features/login/login-form/login-form.ts` + `login-form.html` + `login-form.scss`, espelhando `src/app/features/register/register-form/`: componente standalone OnPush, `imports` de `ReactiveFormsModule`, `MatFormField`, `MatLabel`, `MatInput`, `MatError`, `MatSuffix`, `MatIconButton`, `MatButton`, `MatIcon`, `MatProgressSpinner`; injeta `LoginStore` e `NonNullableFormBuilder`; `form = fb.group({ email: ['', [Validators.required, trimmedEmailValidator, Validators.maxLength(254)]], password: ['', [Validators.required, Validators.maxLength(64)]] })` (`trimmedEmailValidator` de `src/app/core/forms/trimmed-email.validator.ts`); template: cabeçalho do cartão com `<mat-icon svgIcon="login">`, `<h1>` "Acesse sua conta", `<p>` subtítulo; `<form novalidate (ngSubmit)="submit()">` com campos `appearance="outline"` (atributos `maxlength`, `autocomplete`, `type` conforme T022), ações à direita com `@if (store.isSubmitting()) { <mat-progress-spinner mode="indeterminate" diameter="24" aria-label="Entrando" /> }` à esquerda do botão `mat-flat-button type="submit"` "entrar" (`[disabled]` quando status ≠ `idle`/`failed`); `effect` sincronizando status → form: `submitting`/`succeeded` → `form.disable({ emitEvent: false })`; `submit()` válido chama `store.submit(toLoginInput(form.getRawValue()))`; SCSS copiado da estrutura do cadastro (heading, field, actions), só tokens `--app-color-*`, ≤ 4 kB; specs US1 de T022 devem passar (depende de T002, T026, T028)
- [X] T030 [US1] Criar `src/app/features/login/login-page.ts` + `login-page.html` + `login-page.scss`, espelhando `src/app/features/register/register-page.*`: componente standalone OnPush, `providers: [LoginStore]`, renderiza `<app-site-header>` com a navegação de `login-content.ts` ("início" → `/`) e `<main>` centralizado com o cartão contendo `<app-login-form />`; largura 100% em telas pequenas, `max-width` igual ao cadastro, sem rolagem horizontal de 320 a 1920 px (depende de T025, T029)
- [X] T031 [US1] Registrar em `src/app/app.routes.ts` as rotas `{ path: AppPaths.login, title: 'Login — AchaLocal', loadComponent: () => import('./features/login/login-page').then((m) => m.LoginPage) }` e `{ path: AppPaths.dashboard, title: 'Área do cliente — em breve', loadComponent: () => import('./features/coming-soon/coming-soon-page').then((m) => m.ComingSoonPage), data: { featureName: 'Área do cliente' } }` (sem guard; mesmo formato da rota `cadastrar-negocio`); T023 deve passar (depende de T003, T030)
- [X] T032 [US1] Escrever `src/app/features/login/login-page.spec.ts` (integração, `HttpTestingController` + `RouterTestingHarness`): navega para `/login`, vê cabeçalho com "início", ícone, "Acesse sua conta", subtítulo, campos e botão "entrar"; preenche `" Maria@Example.COM "` + `"NovaSenha123"`, envia → 1 `POST` com `{ Email: 'maria@example.com', Password: 'NovaSenha123' }`, campos/botão desabilitados e spinner visível; responde 200 com `data` completo → URL `/dashboard`, `sessionStorage['achalocal.auth-session']` com os 4 campos (e sem `accessCode`), `localStorage` vazio, nenhuma mensagem de sucesso (depende de T031)

**Checkpoint**: US1 funcional e testável — login com sucesso leva a `/dashboard` com sessão salva.

---

## Phase 4: User Story 2 - Ser informado quando o login falha (Priority: P1)

**Goal**: falhas (401, 403, outro status com texto, rede, timeout de 30 s, erro sem texto, sucesso
sem sessão) mostram aviso vermelho discreto em pt-BR; formulário liberado com e-mail mantido e senha
apagada; aviso some ao editar ou reenviar; nada salvo.

**Independent Test**: simular 401 (`message: "E-mail ou senha inválidos."`), 403, status 0 e
timeout de 30 s; verificar o texto no aviso (`role="alert"`), e-mail mantido, senha vazia,
formulário habilitado, `sessionStorage` sem nova sessão e aviso sumindo ao digitar.

### Tests for User Story 2 ⚠️ (escrever primeiro; devem falhar)

- [X] T033 [P] [US2] Escrever `src/app/features/login/services/login-error.mapper.spec.ts` (research R-05, contracts/auth-login-api.md): `Error` comum / `TimeoutError` / valor não-`HttpErrorResponse` → `GENERIC_ERROR_TEXT`; `HttpErrorResponse` status 0 → genérica; 401 com `{ message: 'E-mail ou senha inválidos.' }` → esse texto; 403 com `message` → esse texto; 500 com `message: '   '` e `error.detail: 'Detalhe'` → `'Detalhe'`; 429 com corpo como string JSON de envelope → `message`; corpo não-JSON (HTML) → genérica; corpo sem `message` nem `detail` legíveis → genérica; nunca devolve `title`, `status`, `instance`, `correlationId` (assert explícito com corpo que só tem esses campos → genérica)
- [X] T034 [P] [US2] Adicionar a `src/app/features/login/state/login.store.spec.ts` (parte US2): 401 → `status === 'failed'`, `errorMessage === 'E-mail ou senha inválidos.'`, `AuthSessionService.save` não chamado, `navigateByUrl` não chamado; erro de rede (`req.error(new ProgressEvent('error'))`) → mensagem genérica; sem resposta por 30 s (`vi.useFakeTimers()` + `vi.advanceTimersByTime(30_000)`) → `failed` com genérica e requisição cancelada; 200 com `success: false` ou `data: null` → `failed` com genérica e nada salvo; falha com sessão anterior já salva → sessão anterior preservada; `submit` a partir de `failed` → `errorMessage` volta a `null` e nova requisição feita; `dismissError()` → `errorMessage === null`; nenhum `console.*`
- [X] T035 [P] [US2] Adicionar a `src/app/features/login/login-form/login-form.spec.ts` (parte US2): com store em `failed` + `errorMessage` → aviso com `role="alert"` mostra o texto (via interpolação), campos e botão habilitados, e-mail mantido, senha `''` e sem "Campo obrigatório" visível (pristine/untouched); evento `input` em qualquer campo → `store.dismissError()` chamado e aviso some; o `reset` programático da senha NÃO chama `dismissError`; aviso oculto em `idle`/`submitting`/`succeeded`

### Implementation for User Story 2

- [X] T036 [US2] Implementar `src/app/features/login/services/login-error.mapper.ts`: `mapLoginError(error: unknown): string` — se não for `HttpErrorResponse` ou `status === 0` → `GENERIC_ERROR_TEXT`; senão `body = parseApiResponseBody(error.error)`, `errorBody = isRecord(body?.['error']) ? … : null`, devolve `readableMessage(body?.['message']) ?? readableMessage(errorBody?.['detail']) ?? GENERIC_ERROR_TEXT` (helpers de `src/app/core/api/api-response-body.ts`); nunca usa `title`/`status`/`instance`/`correlationId`; T033 deve passar (depende de T007, T025)
- [X] T037 [US2] Completar o tratamento de erro em `src/app/features/login/state/login.store.ts`: `catchError((e) => { status.set('failed'); errorMessage.set(mapLoginError(e)); return EMPTY; })` (o `TimeoutError` do `timeout(30_000)` cai aqui → genérica); garantir que falhas nunca chamam `AuthSessionService.save`/`clear` nem navegam; specs US2 de T034 devem passar (depende de T028, T036)
- [X] T038 [US2] Atualizar `src/app/features/login/login-form/login-form.ts`/`.html`/`.scss`: no `effect`, status `failed` → `form.enable({ emitEvent: false })` + `form.controls.password.reset('')`; no template, entre os campos e as ações, `@if (store.errorMessage(); as message) { <p class="notice notice--error" role="alert">{{ message }}</p> }`; `(input)="store.dismissError()"` no `<form>`; SCSS do aviso copiado de `src/app/features/register/register-form/register-form.scss` usando `--app-color-error-bg` e `--app-color-error-text`; specs US2 de T035 devem passar (depende de T029, T037)
- [X] T039 [US2] Adicionar a `src/app/features/login/login-page.spec.ts` (integração): envio com resposta 401 `{ success: false, message: 'E-mail ou senha inválidos.' }` → aviso vermelho com o texto, e-mail mantido, senha vazia, formulário habilitado, permanece em `/login`, `sessionStorage` sem sessão; digitar no e-mail → aviso some; envio e navegação para `/` antes da resposta → requisição cancelada, nenhuma sessão salva, nenhum `console.*` (spy em `console.error`/`console.warn`/`console.log`) (depende de T032, T038)

**Checkpoint**: US1 + US2 completas — fluxo de sucesso e todas as falhas tratadas.

---

## Phase 5: User Story 3 - Corrigir dados inválidos antes de enviar (Priority: P2)

**Goal**: mensagens de validação em pt-BR junto ao campo (ao sair do campo ou tentar enviar),
bloqueio de envio inválido com foco no primeiro campo inválido e toggle mostrar/ocultar senha.

**Independent Test**: com o formulário vazio clicar em "entrar" → "Campo obrigatório" nos 2 campos,
foco em "E-mail", nenhuma requisição; `maria@` + blur → "Informe um e-mail válido"; senha `a`
aceita; botão do olho alterna `type` e `aria-label`.

### Tests for User Story 3 ⚠️ (escrever primeiro; devem falhar)

- [X] T040 [P] [US3] Escrever `src/app/features/login/services/login-field-message.spec.ts`: `toLoginFieldErrorMessage(null)` → `null`; `{ required: true }` → "Campo obrigatório"; `{ email: true }` → "Informe um e-mail válido"; `{ required: true, email: true }` → "Campo obrigatório" (prioridade); `{ maxlength: {…} }` → `null` (inalcançável pelo atributo `maxlength`)
- [X] T041 [P] [US3] Adicionar a `src/app/features/login/login-form/login-form.spec.ts` (parte US3): submit com tudo vazio → `mat-error` "Campo obrigatório" nos dois campos, foco no input de e-mail e `store.submit` não chamado; e-mail válido + senha vazia → foco na senha; `maria@` + blur → "Informe um e-mail válido"; senha `a` (sem regra de composição) + e-mail válido → envio aceito; sem erros visíveis antes de tocar o campo; toggle `type="button"` com `aria-label="Mostrar senha"` e `aria-pressed="false"` → clique → input `type="text"`, `aria-label="Ocultar senha"`, `aria-pressed="true"`; toggle desabilitado em `submitting`

### Implementation for User Story 3

- [X] T042 [US3] Implementar `src/app/features/login/services/login-field-message.ts`: `toLoginFieldErrorMessage(errors: ValidationErrors | null): string | null` com prioridade `required` → `REQUIRED_TEXT`, `email` → `INVALID_EMAIL_TEXT` (textos de `login-content.ts`), demais → `null`; T040 deve passar (depende de T025)
- [X] T043 [US3] Atualizar `src/app/features/login/login-form/login-form.ts`/`.html`: `<mat-error>` por campo com `toLoginFieldErrorMessage(form.controls.<campo>.errors)`; `submit()` inválido → `form.markAllAsTouched()` + foco no primeiro `MatInput` inválido na ordem `LOGIN_FIELDS` (via `viewChildren(MatInput)`/`viewChild` e `.focus()`, sem acesso direto ao DOM) e retorna sem chamar o store; toggle de senha com `signal` `passwordVisible`, botão `matIconButton matSuffix type="button"` com `[attr.aria-label]` dinâmico ("Mostrar senha"/"Ocultar senha"), `[attr.aria-pressed]`, ícones `visibility`/`visibility_off` existentes e `[disabled]` acompanhando o estado do formulário; input senha `[type]="passwordVisible() ? 'text' : 'password'"`; specs US3 de T041 devem passar (depende de T038, T042)

**Checkpoint**: US1–US3 completas — validação no cliente impede requisições inúteis.

---

## Phase 6: User Story 4 - Chegar ao login pela tela inicial (Priority: P2)

**Goal**: item "login" com ícone no cabeçalho da landing, após "testar chatbot" e "registrar",
levando a `/login`.

**Independent Test**: abrir `/`, ver no cabeçalho "testar chatbot", "registrar", "login" (nessa
ordem, com ícones) e clicar em "login" → `/login`; em `/login`, clicar em "AchaLocal" ou "início" → `/`.

### Tests for User Story 4 ⚠️ (escrever primeiro; devem falhar)

- [X] T044 [P] [US4] Adicionar a `src/app/features/landing/landing-page.spec.ts`: o cabeçalho tem exatamente os itens "testar chatbot", "registrar", "login" nessa ordem; "login" tem ícone `login` e `href` `/login`; clicar em "login" navega para `/login` (`RouterTestingHarness`)
- [X] T045 [P] [US4] Adicionar a `src/app/features/login/login-page.spec.ts`: link da marca "AchaLocal" e item "início" apontam para `/`

### Implementation for User Story 4

- [X] T046 [US4] Adicionar em `src/app/features/landing/landing-content.ts` o item `{ label: 'login', icon: 'login', path: '/' + AppPaths.login }` (mesmo formato dos demais `NavigationItem`) imediatamente após "registrar"; T044 e T045 devem passar (depende de T002, T003, T031)

**Checkpoint**: todas as user stories funcionais e acessíveis a partir da tela inicial.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: validação final de qualidade, segurança e documentação.

- [X] T047 [P] Revisar `src/app/features/login/**` e `src/app/core/{api,auth,forms}/**` para garantir: nenhum `any`, nenhum `console.*`, nenhum `subscribe()` em componentes, nenhum `innerHTML`, nenhum uso de `localStorage`, senha/token nunca em URL, mensagem ou log (FR-020–FR-022)
- [X] T048 [P] Atualizar `README.md` com a rota `/login`, a rota placeholder `/dashboard` e a chave `achalocal.auth-session` em `sessionStorage` (seção de funcionalidades/rotas existente)
- [X] T049 Executar `npm test`, `npm run build` (sem erros e dentro do orçamento de 4 kB warn / 8 kB error por estilo de componente), `npm run lint:colors` e `npm run lint:contrast`; corrigir qualquer falha
- [ ] T050 Executar o roteiro manual de `specs/005-client-login/quickstart.md` (passos 1–19), incluindo largura 320 px sem rolagem horizontal, navegação só por teclado e console vazio; registrar desvios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories. Dentro dela:
  T005/T009 → T010 → T011; T006 → T007 → T008 → T011; T012/T013 → T014; T010+T015+T016 → T017 → T018.
- **US1 (Phase 3)**: depende da Phase 2.
- **US2 (Phase 4)**: depende de US1 (estende `LoginStore`, `LoginForm` e `login-page.spec.ts` criados em US1).
- **US3 (Phase 5)**: depende de US1 (estende `LoginForm`); pode rodar em paralelo com US2 apenas nos arquivos de mensagens (T040, T042), pois T043 edita o mesmo `login-form.*` de T038.
- **US4 (Phase 6)**: depende só da rota `/login` existir (T031); independente de US2/US3.
- **Polish (Phase 7)**: depende de todas as stories desejadas.

### User Story Dependencies

- **US1 (P1)**: após Foundational — sem dependência de outras stories.
- **US2 (P1)**: após US1 (mesmos arquivos de store/form/página).
- **US3 (P2)**: após US1; ordem recomendada após US2 para evitar conflitos em `login-form.*`.
- **US4 (P2)**: após T031; pode ser feita em paralelo com US2/US3.

### Within Each User Story

- Specs escritos e falhando antes da implementação.
- Modelos → mappers → store → componentes → rotas → integração.

### Parallel Opportunities

- Phase 1: T001, T002, T003 em paralelo.
- Phase 2: T005, T006, T009, T012, T013, T015, T016 em paralelo.
- US1: T019–T023 (specs) em paralelo; T024 e T025 em paralelo.
- US2: T033, T034, T035 em paralelo.
- US3: T040 e T041 em paralelo; T040/T042 em paralelo com a Phase 4.
- US4 (T044–T046) em paralelo com US2/US3 após T031.
- Polish: T047 e T048 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Specs da US1 juntos (devem falhar):
Task: "T019 login-input.mapper.spec.ts em src/app/features/login/services/"
Task: "T020 login-session.mapper.spec.ts em src/app/features/login/services/"
Task: "T021 login.store.spec.ts (parte US1) em src/app/features/login/state/"
Task: "T022 login-form.spec.ts (parte US1) em src/app/features/login/login-form/"
Task: "T023 rotas /login e /dashboard em src/app/app.routes.spec.ts"

# Modelos e conteúdo juntos:
Task: "T024 login-input.ts, login-field.ts, login-status.ts em src/app/features/login/models/"
Task: "T025 login-content.ts em src/app/features/login/"
```

## Parallel Example: User Story 2

```bash
Task: "T033 login-error.mapper.spec.ts em src/app/features/login/services/"
Task: "T034 login.store.spec.ts (parte US2) em src/app/features/login/state/"
Task: "T035 login-form.spec.ts (parte US2) em src/app/features/login/login-form/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (refatoração do cadastro verde + sessão + `login()`)
3. Phase 3: US1
4. **STOP and VALIDATE**: login com sucesso em `/login` → `/dashboard` com sessão salva (quickstart passos 2, 7–10)

### Incremental Delivery

1. Setup + Foundational → base pronta (cadastro inalterado)
2. US1 → login feliz (MVP)
3. US2 → mensagens de falha (P1; recomendado entregar junto com US1 em produção)
4. US3 → validação no cliente e toggle de senha
5. US4 → item "login" na landing
6. Polish → build, lint, quickstart manual

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes.
- Specs do cadastro movidos para `core/` devem continuar passando sem alteração de asserções.
- Fora do escopo (não implementar): logout, recuperação de senha, reenvio de confirmação,
  "lembrar de mim", links login↔cadastro, guard/interceptor e conteúdo real do `/dashboard`.
- Commit após cada tarefa ou grupo lógico.
