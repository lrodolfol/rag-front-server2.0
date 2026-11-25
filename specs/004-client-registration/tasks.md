---

description: "Task list for feature 004 — Tela de Cadastro de Clientes (/register)"
---

# Tasks: Tela de Cadastro de Clientes (/register)

**Input**: Design documents from `/specs/004-client-registration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (auth-register-api, register-ui, routes), quickstart.md

**Tests**: INCLUDED — a constitution (Princípio VI) e o plan exigem specs para validadores, mappers,
serviço, store, formulário, página, header da landing e rotas (Vitest + jsdom via `ng test`,
`HttpTestingController`, `vi.useFakeTimers`, `RouterTestingHarness`). Escreva cada teste antes da
implementação correspondente e confirme que falha.

**Organization**: Tasks agrupadas por user story para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: User story da task (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (SPA Angular, projeto único: `src/`, `public/`)

## Convenções obrigatórias (valem para todas as tasks)

- Angular 22 standalone, `ChangeDetectionStrategy.OnPush`, Signals; TypeScript `strict`, **sem `any`**
  (corpos de erro como `unknown` + type guards). Nomes de código em inglês, autoexplicativos e
  **sem abreviações** (ex.: `IN_MILLISECONDS`, nunca `MS`); textos ao usuário em pt-BR.
- Siga o padrão da feature 003 (`src/app/features/chatbot/`): página com `providers: [Store]`,
  textos como **constantes planas** em `*-content.ts` (ver `src/app/features/chatbot/chatbot-content.ts`),
  URL por `InjectionToken` (ver `src/app/core/config/chat-api-url.token.ts`).
- Componentes só apresentam e reagem; regras (normalização, mapeamento de erros, escolha da mensagem
  de validação) ficam em funções puras/serviços. Componentes nunca chamam `subscribe()`; só o store
  assina (com `takeUntilDestroyed`). Funções/métodos com no máximo ~20 linhas.
- **Nada no console** (FR-021): sem `console.*`; todo erro do fluxo capturado no store.
- Senha nunca em URL, storage, mensagens ou logs (FR-020).
- Cores **apenas** por tokens existentes (`--app-color-success-bg`/`-text`, `--app-color-error-bg`/`-text`,
  etc.); nenhum hexadecimal fora de `_tokens.scss`. Orçamento de estilo: 4 kB warn / 8 kB error.
- **Nenhuma dependência nova.**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ícones, caminhos, configuração da URL da API

- [X] T001 [P] Adicionar SVGs do Material Symbols (mesmo formato/viewBox dos ícones existentes, ex. `public/icons/home.svg`) em `public/icons/person_add.svg`, `public/icons/visibility.svg` e `public/icons/visibility_off.svg`
- [X] T002 [P] Acrescentar `'person_add'`, `'visibility'`, `'visibility_off'` ao array `APP_ICON_NAMES` em `src/app/core/icons/app-icon-name.ts` (e ajustar `src/app/core/icons/provide-app-icons.spec.ts` se ele enumera os ícones)
- [X] T003 [P] Adicionar `register: 'register'` a `AppPaths` em `src/app/core/routing/app-paths.ts`
- [X] T004 [P] Criar `export const AUTH_API_URL = new InjectionToken<string>('AUTH_API_URL');` em `src/app/core/config/auth-api-url.token.ts`
- [X] T005 [P] Adicionar `authApiUrl: 'http://localhost:5170/api/v1/auth'` em `src/environments/environment.development.ts` e `authApiUrl: '/api/v1/auth'` (placeholder de produção, comentado como tal) em `src/environments/environment.ts` — valor é a **base**, sem `/register` (R-01)
- [X] T006 Registrar `{ provide: AUTH_API_URL, useValue: environment.authApiUrl }` em `src/app/app.config.ts` (depende de T004, T005)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelos, DTOs, textos e a casca da página/rota que todas as stories usam

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T007 [P] Criar `export type RegistrationField = 'name' | 'email' | 'password';` em `src/app/features/register/models/registration-field.ts`
- [X] T008 [P] Criar `export type RegistrationStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';` em `src/app/features/register/models/registration-status.ts`
- [X] T009 [P] Criar interface `RegistrationInput { readonly name: string; readonly email: string; readonly password: string }` em `src/app/features/register/models/registration-input.ts` (doc: name "trim; 1–100 caracteres; não pode ser só espaços"; email "trim + minúsculas; formato usuário@domínio; ≤ 254"; password "sem alteração; 8–64 caracteres; ≥ 1 letra e ≥ 1 número")
- [X] T010 [P] Criar `RegistrationFailure { readonly kind: 'email-taken' | 'invalid-fields' | 'server-message' | 'generic'; readonly message: string | null; readonly fieldErrors: Partial<Record<RegistrationField, string>> }` em `src/app/features/register/models/registration-failure.ts` (`message` é `null` no `email-taken`; `fieldErrors` vazio quando não há)
- [X] T011 [P] Criar `RegisterRequestDto { readonly Name: string; readonly Email: string; readonly Password: string }` (PascalCase = contrato do serviço) em `src/app/features/register/models/register-request.dto.ts`
- [X] T012 [P] Criar `RegisterResponseDataDto { readonly clientId: number; readonly accessCode: string; readonly name: string; readonly email: string; readonly createdAt: string }` (ISO 8601; tipado por completude, nunca guardado/exibido) em `src/app/features/register/models/register-response-data.dto.ts`
- [X] T013 [P] Criar `ApiResponseDto<T> { statusCode: number; success: boolean; message: string; data: T | null; error: ApiErrorDto | null }` e `ApiErrorDto { title: string; status: number; detail?: string; instance: string; errors?: Readonly<Record<string, readonly string[]>>; correlationId: string }` (todos `readonly`) em `src/app/features/register/models/api-response.dto.ts`
- [X] T014 [P] Criar `src/app/features/register/register-content.ts` com **constantes planas** (mesmo estilo de `chatbot-content.ts`):
  - `REGISTER_NAVIGATION_ITEMS: readonly NavigationItem[] = [{ label: 'início', icon: 'home', path: AppPaths.home }]`
  - `NAME_MAX_LENGTH = 100`, `EMAIL_MAX_LENGTH = 254`, `PASSWORD_MAX_LENGTH = 64`, `PASSWORD_MIN_LENGTH = 8`
  - `REGISTRATION_TIMEOUT_IN_MILLISECONDS = 30_000`
  - Textos de `contracts/register-ui.md` → Textos: `REGISTER_TITLE_TEXT` "Crie sua conta", `REGISTER_SUBTITLE_TEXT` "Cadastre e gerencie seus negócios no AchaLocal.", `NAME_LABEL` "Seu nome", `EMAIL_LABEL` "E-mail", `PASSWORD_LABEL` "Senha", `PASSWORD_HINT_TEXT` "Mínimo de 8 caracteres, com letras e números", `SUBMIT_BUTTON_LABEL` "criar minha conta", `SHOW_PASSWORD_LABEL` "Mostrar senha", `HIDE_PASSWORD_LABEL` "Ocultar senha", `SUBMITTING_LABEL` "Enviando cadastro", `REQUIRED_FIELD_TEXT` "Campo obrigatório", `INVALID_EMAIL_TEXT` "Informe um e-mail válido", `PASSWORD_TOO_SHORT_TEXT` "A senha deve ter pelo menos 8 caracteres", `PASSWORD_MISSING_LETTER_TEXT` "A senha deve conter pelo menos uma letra", `PASSWORD_MISSING_NUMBER_TEXT` "A senha deve conter pelo menos um número", `EMAIL_TAKEN_FALLBACK_TEXT` "Este e-mail já está cadastrado", `SUCCESS_FALLBACK_TEXT` "Cadastro realizado!", `GENERIC_ERROR_TEXT` "Não foi possível concluir o cadastro agora. Tente novamente em instantes."
- [X] T015 Criar casca de `RegisterPage` em `src/app/features/register/register-page.ts`, `.html`, `.scss`: standalone, OnPush, `imports: [SiteHeader]`, `navigationItems = REGISTER_NAVIGATION_ITEMS`, template `<app-site-header [navigationItems]>` + `<main>` centralizando um bloco `section` (`max-width: 420px; width: 100%; padding: 16px`, sem `MatCard`, sem rolagem horizontal de 320 a 1920 px — R-10). Seguir a API de inputs de `SiteHeader` usada em `src/app/features/chatbot/chatbot-page.html` (depende de T014)
- [X] T016 Adicionar rota `{ path: AppPaths.register, title: 'Cadastro — AchaLocal', loadComponent: () => import('./features/register/register-page').then(m => m.RegisterPage) }` em `src/app/app.routes.ts` (depende de T003, T015)

**Checkpoint**: `/register` abre com cabeçalho e bloco vazio; build e testes existentes verdes

---

## Phase 3: User Story 1 - Criar uma conta de cliente (Priority: P1) 🎯 MVP

**Goal**: Visitante preenche nome, e-mail e senha, envia, vê bloqueio + spinner e depois a mensagem verde do serviço com o formulário limpo.

**Independent Test**: abrir `/register`, preencher dados válidos, enviar; o `HttpTestingController` recebe `POST {authApiUrl}/register` com `{Name, Email, Password}` normalizados; durante a espera campos/botão desabilitados e spinner visível; após 201 aparece o aviso verde com `message` e o formulário está vazio.

### Tests for User Story 1 ⚠️

- [X] T017 [P] [US1] Spec de `toRegistrationInput`/`toRegisterRequestDto` em `src/app/features/register/services/registration-input.mapper.spec.ts`: `"  Maria  "` → `"Maria"`; `" Maria@Example.COM "` → `"maria@example.com"`; senha com espaços enviada exatamente como digitada; DTO `{ Name, Email, Password }`
- [X] T018 [P] [US1] Spec de `AuthApiService` em `src/app/features/register/services/auth-api.service.spec.ts` com `provideHttpClient()` + `provideHttpClientTesting()` e `AUTH_API_URL = 'http://api.test/api/v1/auth'`: `register(dto)` faz `POST http://api.test/api/v1/auth/register` com o DTO no corpo, sem query string, e emite o `ApiResponseDto` recebido
- [X] T019 [P] [US1] Spec do caminho feliz de `RegistrationStore` em `src/app/features/register/state/registration.store.spec.ts` (serviço falso via `{ provide: AuthApiService, useValue: … }`): estado inicial `idle`; `submit(input)` → `submitting` e `isSubmitting() === true`; 201 → `succeeded` com `successMessage` = `message`; `message` vazio → `SUCCESS_FALLBACK_TEXT`; segundo `submit` durante `submitting` é ignorado (uma única chamada); novo `submit` a partir de `succeeded` limpa `successMessage`
- [X] T020 [P] [US1] Spec de `RegisterForm` (caminho feliz) em `src/app/features/register/register-form/register-form.spec.ts`: renderiza título, subtítulo, campos "Seu nome"/"E-mail"/"Senha" com `autocomplete` `name`/`email`/`new-password` e `maxlength` 100/254/64, dica da senha e botão "criar minha conta"; submit válido chama `store.submit` com o valor normalizado; em `submitting` o form está `disabled`, botão desabilitado e spinner com `aria-label="Enviando cadastro"` visível; em `succeeded` form habilitado, vazio, `pristine`/`untouched` e aviso `role="status"` com a mensagem
- [X] T021 [P] [US1] Spec de integração de `RegisterPage` em `src/app/features/register/register-page.spec.ts` (store real + `HttpTestingController`): preencher, enviar, `expectOne` do POST com payload normalizado, responder 201 conforme `contracts/auth-register-api.md`, verificar aviso verde e formulário limpo; verificar que o cabeçalho é renderizado

### Implementation for User Story 1

- [X] T022 [P] [US1] Implementar funções puras `toRegistrationInput(raw: { name: string; email: string; password: string }): RegistrationInput` (trim de nome/e-mail, e-mail em minúsculas, senha intocada) e `toRegisterRequestDto(input: RegistrationInput): RegisterRequestDto` em `src/app/features/register/services/registration-input.mapper.ts`
- [X] T023 [P] [US1] Implementar `AuthApiService` (`providedIn: 'root'`, `inject(HttpClient)`, `inject(AUTH_API_URL)`) com `register(dto: RegisterRequestDto): Observable<ApiResponseDto<RegisterResponseDataDto>>` fazendo `POST \`${baseUrl}/register\`` em `src/app/features/register/services/auth-api.service.ts` — único ponto HTTP da feature; sem interceptor
- [X] T024 [US1] Implementar `RegistrationStore` (`@Injectable()` sem `providedIn`) em `src/app/features/register/state/registration.store.ts`: signals privados `status`/`successMessage`/`failure` expostos como readonly, `isSubmitting = computed(() => status() === 'submitting')`, `formErrorMessage = computed(() => failure()?.message ?? null)`; `submit(input: RegistrationInput)` ignora se `submitting`, limpa `successMessage`/`failure`, vai para `submitting` e assina `api.register(toRegisterRequestDto(input)).pipe(takeUntilDestroyed(destroyRef))`, em sucesso → `succeeded` com `message || SUCCESS_FALLBACK_TEXT`. Deixar o tratamento de erro com um `catchError` provisório que leva a `failed` com `failure` genérica (`GENERIC_ERROR_TEXT`; refinado em US3) — **nunca** deixar erro escapar para o `ErrorHandler` (depende de T022, T023)
- [X] T025 [US1] Implementar `RegisterForm` em `src/app/features/register/register-form/register-form.ts`, `.html`, `.scss`: standalone, OnPush, `inject(RegistrationStore)`, `NonNullableFormBuilder` com `FormGroup<{ name; email; password }>` (valores iniciais `''`, por ora só `Validators.required` e `maxLength(NAME_MAX_LENGTH/EMAIL_MAX_LENGTH/PASSWORD_MAX_LENGTH)` — US2 adiciona o resto); template com `<form novalidate (ngSubmit)>`, ícone `person_add` (`aria-hidden="true"`), `h1`, subtítulo (cor `on-surface-variant` via token), três `mat-form-field appearance="outline"` largura 100% com `type`/`autocomplete`/`maxlength` de `contracts/register-ui.md`, `mat-hint` da senha, linha final com `mat-progress-spinner` (`diameter=20`, `mode="indeterminate"`, `aria-label` `SUBMITTING_LABEL`, só em `isSubmitting()`) ao lado de `mat-flat-button type="submit"` `[disabled]="isSubmitting()"`; aviso verde `role="status"` com ícone `check` quando `status() === 'succeeded'` (padding 8–12 px, borda arredondada, `--app-color-success-bg`/`--app-color-success-text`). `submit()`: ler `getRawValue()` **antes** de qualquer `disable()`, normalizar com `toRegistrationInput` e chamar `store.submit`. Um `effect` reage ao `status`: `submitting` → `form.disable()`; `succeeded` → `form.enable()` + `form.reset()` (e reset do `FormGroupDirective` para limpar `submitted`) (depende de T024)
- [X] T026 [US1] Integrar em `RegisterPage` (`src/app/features/register/register-page.ts` e `.html`): `providers: [RegistrationStore]` (estado morre com a página) e `<app-register-form>` dentro da `section` (depende de T025)

**Checkpoint**: MVP — cadastro com sucesso funciona ponta a ponta com o backend UAT

---

## Phase 4: User Story 2 - Corrigir dados inválidos antes de enviar (Priority: P1)

**Goal**: Mensagens em pt-BR junto a cada campo inválido (após sair do campo ou tentar enviar), nenhum envio com campo inválido, foco no primeiro inválido e toggle mostrar/ocultar senha.

**Independent Test**: tentar enviar com cada campo inválido; verificar a mensagem exibida, o foco e que `HttpTestingController.expectNone` passa; alternar a visibilidade da senha.

### Tests for User Story 2 ⚠️

- [X] T027 [P] [US2] Spec de `notBlankValidator` em `src/app/features/register/validators/not-blank.validator.spec.ts`: `'   '` → `{ blank: true }`; `''` → `null` (deixa para `required`); `' Ana '` → `null`
- [X] T028 [P] [US2] Spec de `trimmedEmailValidator` em `src/app/features/register/validators/trimmed-email.validator.spec.ts`: `'maria@'` → `{ email: true }`; `' maria@example.com '` → `null`; `''` → `null`
- [X] T029 [P] [US2] Spec de `passwordStrengthValidator` em `src/app/features/register/validators/password-strength.validator.spec.ts`: `'abcdefgh'` → `{ missingNumber: true }`; `'1234567'` → inclui `minLength`; `'12345678'` → `{ missingLetter: true }`; `'senha123'` → `null`; `''` → `null`
- [X] T030 [P] [US2] Spec de `toFieldErrorMessage` em `src/app/features/register/services/registration-field-message.spec.ts`: `null` → `null`; `{ server: 'X', required: true }` → `'X'`; `{ required: true }` e `{ blank: true }` → `REQUIRED_FIELD_TEXT`; `{ email: true }` → `INVALID_EMAIL_TEXT`; `{ minLength: true, missingNumber: true }` → `PASSWORD_TOO_SHORT_TEXT` (uma mensagem por vez); `{ missingLetter: true }` → `PASSWORD_MISSING_LETTER_TEXT`; `{ missingNumber: true }` → `PASSWORD_MISSING_NUMBER_TEXT`; `{ maxlength: {…} }` → `null`
- [X] T031 [P] [US2] Ampliar `src/app/features/register/register-form/register-form.spec.ts`: envio com tudo vazio mostra "Campo obrigatório" nos 3 campos, não chama `store.submit` e foca "Seu nome"; e-mail `maria@` após blur → "Informe um e-mail válido"; senhas `abcdefgh`/`1234567`/`12345678` → mensagens de número/tamanho/letra; nome só com espaços → "Campo obrigatório"; toggle alterna `type` `password`↔`text`, `aria-label` "Mostrar senha"/"Ocultar senha" e `aria-pressed`
- [X] T032 [P] [US2] Ampliar `src/app/features/register/register-page.spec.ts`: envio inválido não gera requisição (`httpTesting.expectNone`)

### Implementation for User Story 2

- [X] T033 [P] [US2] Implementar `notBlankValidator: ValidatorFn` (valor não vazio que após `trim()` fica vazio → `{ blank: true }`) em `src/app/features/register/validators/not-blank.validator.ts`
- [X] T034 [P] [US2] Implementar `trimmedEmailValidator: ValidatorFn` que aplica `Validators.email` ao valor após `trim()` (vazio → `null`) em `src/app/features/register/validators/trimmed-email.validator.ts`
- [X] T035 [P] [US2] Implementar `passwordStrengthValidator: ValidatorFn` (vazio → `null`; erros acumuláveis `minLength` se `< PASSWORD_MIN_LENGTH`, `missingLetter` se sem `/\p{L}/u`, `missingNumber` se sem `/\d/`) em `src/app/features/register/validators/password-strength.validator.ts`
- [X] T036 [P] [US2] Implementar função pura `toFieldErrorMessage(errors: ValidationErrors | null): string | null` em `src/app/features/register/services/registration-field-message.ts` com prioridade `server` (texto do serviço) > `required`/`blank` > `email` > `minLength` > `missingLetter` > `missingNumber`, usando os textos de `register-content.ts`. A chave `maxlength` (de `Validators.maxLength`) devolve `null` de propósito: é inalcançável pela UI porque o atributo `maxlength` do `<input>` impede digitar/colar o excedente — documentar isso em comentário no arquivo
- [X] T037 [US2] Aplicar validadores em `src/app/features/register/register-form/register-form.ts`: `name` = `required`, `notBlankValidator`, `maxLength(NAME_MAX_LENGTH)`; `email` = `required`, `trimmedEmailValidator`, `maxLength(EMAIL_MAX_LENGTH)`; `password` = `required`, `passwordStrengthValidator`, `maxLength(PASSWORD_MAX_LENGTH)`; o componente **apenas** chama `toFieldErrorMessage(control.errors)` (sem lógica de prioridade própria) e exibe o resultado no `mat-error` de cada campo no `.html` (o `ErrorStateMatcher` padrão já exibe após `touched` ou envio) (depende de T033–T036)
- [X] T038 [US2] Em `submit()` de `src/app/features/register/register-form/register-form.ts`: se `form.invalid`, `markAllAsTouched()`, não chamar o store e focar o primeiro controle inválido na ordem nome → e-mail → senha usando `viewChildren(MatInput)` + `MatInput.focus()` (API pública, sem `ElementRef`/DOM direto)
- [X] T039 [US2] Toggle de senha em `src/app/features/register/register-form/register-form.ts` e `.html`: signal `passwordVisible = signal(false)`; `button mat-icon-button matSuffix type="button"` com `[attr.aria-label]` `SHOW_PASSWORD_LABEL`/`HIDE_PASSWORD_LABEL`, `[attr.aria-pressed]`, ícone `visibility`/`visibility_off`, `[disabled]="isSubmitting()"`; `[type]` do input alterna `password`/`text`; ordem de Tab nome → e-mail → senha → toggle → botão

**Checkpoint**: US1 + US2 — nenhum envio inválido chega ao serviço

---

## Phase 5: User Story 3 - Ser informado quando o cadastro falha (Priority: P2)

**Goal**: 409 no campo e-mail, 400 distribuído pelos campos + aviso vermelho, falha de rede/timeout de 30 s/sem texto com mensagem genérica; formulário liberado mantendo nome e e-mail.

**Independent Test**: com `HttpTestingController`, responder 409, 400 com `errors`, 500 sem corpo, erro de rede (`status 0`) e avançar 30 s com `vi.useFakeTimers`; verificar mensagens, foco, valores mantidos e que o status nunca fica preso em `submitting`.

### Tests for User Story 3 ⚠️

- [X] T040 [P] [US3] Spec de `mapRegistrationError` e `toFieldName` em `src/app/features/register/services/registration-error.mapper.spec.ts` cobrindo a tabela de R-04 / `contracts/auth-register-api.md`: `TimeoutError`, `Error` comum e `HttpErrorResponse` `status 0` → `generic` + `GENERIC_ERROR_TEXT`; 409 com `message` → `email-taken`, `message: null`, `fieldErrors.email` = `message`; 409 só com `error.detail` → detail; 409 sem texto → `EMAIL_TAKEN_FALLBACK_TEXT`; 400 com `errors: { password: ['Informe a senha.'] }` → `invalid-fields`, `message` "Um ou mais campos são inválidos.", `fieldErrors.password` = "Informe a senha."; chave `Password` (PascalCase) reconhecida; 400 só com chaves desconhecidas → 1ª mensagem de `errors` vira `message`, `fieldErrors` vazio; 500 com `message` → `server-message`; corpo HTML/string/vazio → `generic`; nenhuma saída contém `correlationId`, `instance`, "Conflito" ou número de status
- [X] T041 [P] [US3] Ampliar `src/app/features/register/state/registration.store.spec.ts`: erro HTTP → `failed` com `failure` mapeada e `formErrorMessage` correto; com `vi.useFakeTimers()`, sem resposta por `REGISTRATION_TIMEOUT_IN_MILLISECONDS` → `failed` genérico; novo `submit` a partir de `failed` limpa `failure`; destruir o injector durante `submitting` cancela a requisição sem lançar erro; espiar `console.error`/`console.warn`/`console.log` e garantir zero chamadas
- [X] T042 [P] [US3] Ampliar `src/app/features/register/register-form/register-form.spec.ts`: em `failed` com `fieldErrors.email` o `mat-error` do e-mail mostra o texto do serviço (prova de que `setErrors` sobreviveu ao `enable()`) e o foco vai para o e-mail; nome e e-mail mantidos; aviso `role="alert"` vermelho só quando `message` não é `null`; editar o campo remove o erro `server`
- [X] T043 [P] [US3] Ampliar `src/app/features/register/register-page.spec.ts`: fluxos integrados 409, 400 com `errors` e `status 0` (via `req.error(new ProgressEvent('error'))`), verificando mensagens e formulário liberado; **privacidade (FR-020/SC-005)**: após os fluxos de sucesso e de falha, `localStorage.length === 0`, `sessionStorage.length === 0` e `TestBed.inject(Router).url` não contém a senha digitada

### Implementation for User Story 3

- [X] T044 [P] [US3] Implementar em `src/app/features/register/services/registration-error.mapper.ts`, seguindo exatamente a tabela de `contracts/auth-register-api.md` → "Mapeamento completo de falhas": type guard `isApiResponse(body: unknown)`, `toFieldName(key: string): RegistrationField | null` (comparação sem diferenciar caixa) e `mapRegistrationError(error: unknown): RegistrationFailure` como orquestrador curto que delega a helpers privados (`mapHttpError`, `mapFieldErrors`, `readableMessage`) para manter cada função em ~20 linhas; textos de fallback de `register-content.ts`; só textos legíveis não vazios; nunca expor `statusCode`, `error.status`, `error.title` "Conflito", `instance`, `correlationId`, stack
- [X] T045 [US3] Completar `RegistrationStore` em `src/app/features/register/state/registration.store.ts`: pipe `timeout(REGISTRATION_TIMEOUT_IN_MILLISECONDS)` antes de `takeUntilDestroyed`, `catchError` → `failed` com `failure = mapRegistrationError(e)` (substituir o tratamento provisório de T024); garantir que nenhum caminho propaga erro ao `ErrorHandler` global (depende de T044)
- [X] T046 [US3] Estender o `effect` de `src/app/features/register/register-form/register-form.ts` para `failed`: `form.enable()` mantendo valores e **só depois** aplicar, para cada `fieldErrors[field]`, `control.setErrors({ server: mensagem })` + `markAsTouched()` (`enable()` recalcula os validadores e apagaria erros aplicados antes); focar o primeiro campo com erro (ordem nome → e-mail → senha) via `MatInput.focus()`; no `.html`, aviso vermelho `role="alert"` com `formErrorMessage()` (só se não nulo; tokens `--app-color-error-bg`/`--app-color-error-text`, mesmo estilo discreto e mesmo local do aviso verde, acima do botão); textos do serviço só por interpolação (depende de T045)

**Checkpoint**: Todas as falhas de SC-004 tratadas; formulário nunca fica preso em "enviando"

---

## Phase 6: User Story 4 - Chegar ao cadastro pela tela inicial (Priority: P2)

**Goal**: Item "registrar" (ícone `person_add`) ao lado de "testar chatbot" na landing; `/register` volta à home pelo logotipo e por "início".

**Independent Test**: abrir `/`, ver "registrar" após "testar chatbot", clicar e chegar a `/register`; em `/register`, clicar em "início" e no logotipo e voltar a `/`.

### Tests for User Story 4 ⚠️

- [X] T047 [P] [US4] Ampliar `src/app/features/landing/landing-page.spec.ts`: cabeçalho exibe "registrar" logo depois de "testar chatbot", com ícone, e o link aponta para `/register`
- [X] T048 [P] [US4] Ampliar `src/app/app.routes.spec.ts` com `RouterTestingHarness`: `/register` carrega `RegisterPage` (lazy) com título "Cadastro — AchaLocal"; navegar a `/register` e acionar "início" leva a `/`
- [X] T049 [P] [US4] Ampliar `src/app/features/register/register-page.spec.ts`: cabeçalho de `/register` tem um único item "início" (`home`) apontando para `/` e a marca "AchaLocal" aponta para `/`

### Implementation for User Story 4

- [X] T050 [US4] Acrescentar `{ label: 'registrar', icon: 'person_add', path: AppPaths.register }` **após** o item "testar chatbot" em `LANDING_NAVIGATION_ITEMS` de `src/app/features/landing/landing-content.ts` (depende de T002, T003)

**Checkpoint**: Todas as user stories funcionais de forma independente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, acessibilidade, documentação, budgets e validação final

- [X] T051 [P] Revisar `src/app/features/register/register-form/register-form.scss` e `src/app/features/register/register-page.scss`: só tokens de cor, layout sem rolagem horizontal de 320 a 1920 px (bloco 100% em < 600 px), estilos dentro do orçamento 4 kB warn / 8 kB error
- [X] T052 [P] Auditoria de segurança/privacidade e convenções em `src/app/features/register/`: nenhum `console.*`, nenhum `localStorage`/`sessionStorage`, senha nunca em URL/mensagens, `correlationId` nunca exibido, nenhum `any`, nenhum `subscribe()` em componente, nenhum acesso direto ao DOM, nenhum nome abreviado, nenhuma regra de negócio em componente
- [X] T053 [P] Conferir acessibilidade em `src/app/features/register/register-form/register-form.html`: rótulos em todos os campos/botões, ícones decorativos com `aria-hidden="true"`, `role="status"`/`role="alert"` nos avisos, ordem de Tab nome → e-mail → senha → toggle → botão
- [X] T054 [P] Atualizar `README.md` (exigência da constitution — documentação técnica): nova seção "Cadastro (`/register`)" no mesmo formato da seção "Chatbot (`/chatbot`)" descrevendo `src/app/features/register/`, `authApiUrl` por ambiente (UAT `http://localhost:5170/api/v1/auth`, produção placeholder `/api/v1/auth`), `InjectionToken` `AUTH_API_URL` provido em `app.config.ts`, necessidade de CORS para `http://localhost:4200` e o Plano B com `proxy.conf.json` (R-08); e atualizar a linha que lista os `navigationItems` por página para incluir "registrar" na landing e "início" no cadastro
- [X] T055 Rodar `npm test`, `npm run build`, `npm run lint:colors` e `npm run lint:contrast` na raiz e corrigir qualquer falha
- [ ] T056 Executar o roteiro manual de `specs/004-client-registration/quickstart.md` (passos 1–17) contra o backend UAT; se o CORS falhar, aplicar o Plano B (`proxy.conf.json` + `serve.options.proxyConfig` em `angular.json` + `authApiUrl: '/api/v1/auth'` em `src/environments/environment.development.ts`) conforme R-08 e refletir no `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as stories
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; edita `register-form.*` criado em T025 → na prática após US1
- **US3 (Phase 5)**: depende da Phase 2; edita `registration.store.ts` (T024) e `register-form.*` (T025) → após US1; usa `toFieldErrorMessage` (T036) para exibir o erro `server` → após US2
- **US4 (Phase 6)**: depende apenas de T002, T003, T015, T016 — pode rodar em paralelo com US1–US3
- **Polish (Phase 7)**: após todas as stories desejadas

### User Story Dependencies

```text
Setup ─▶ Foundational ─┬─▶ US1 (P1, MVP) ─▶ US2 (P1) ─▶ US3 (P2)
                       └─▶ US4 (P2)  (independente)
                                   all ─▶ Polish
```

### Within Each User Story

- Testes primeiro (devem falhar) → funções puras/validadores → serviço → store → componente → integração na página

### Parallel Opportunities

- Phase 1: T001–T005 em paralelo
- Phase 2: T007–T014 em paralelo (arquivos distintos)
- US1: testes T017–T021 em paralelo; T022 e T023 em paralelo
- US2: testes T027–T032 em paralelo; T033–T036 em paralelo
- US3: testes T040–T043 em paralelo; T044 em paralelo com os testes
- US4 inteira em paralelo com US1–US3
- Polish: T051–T054 em paralelo

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos:
Task: "Spec do mapper de entrada em src/app/features/register/services/registration-input.mapper.spec.ts"
Task: "Spec do AuthApiService em src/app/features/register/services/auth-api.service.spec.ts"
Task: "Spec do RegistrationStore em src/app/features/register/state/registration.store.spec.ts"

# Peças puras/HTTP da US1 juntas:
Task: "Implementar registration-input.mapper.ts"
Task: "Implementar auth-api.service.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Implementar not-blank.validator.ts"
Task: "Implementar trimmed-email.validator.ts"
Task: "Implementar password-strength.validator.ts"
Task: "Implementar registration-field-message.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1
4. **STOP and VALIDATE**: cadastro 201 ponta a ponta (quickstart passos 2, 7–9)

### Incremental Delivery

1. Setup + Foundational → `/register` acessível
2. US1 → cadastro funciona (MVP)
3. US2 → validação no cliente (fecha o P1)
4. US3 → tratamento de falhas
5. US4 → entrada pela landing (pode entrar a qualquer momento após a Phase 2)
6. Polish → docs, budgets, lint, quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Commit após cada task ou grupo lógico; parar em qualquer checkpoint para validar a story
- Evitar: dependências novas, cores fora de tokens, `console.*`, `any`, `subscribe()` em componentes, abreviações em nomes, regras de negócio em componentes
