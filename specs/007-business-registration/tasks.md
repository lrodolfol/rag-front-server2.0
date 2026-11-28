---

description: "Task list for feature 007 — Cadastro de Negócio (/dashboard/new)"
---

# Tasks: Cadastro de Negócio (/dashboard/new)

**Input**: Design documents from `/specs/007-business-registration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (business-registration-api.md, business-registration-ui.md, routes.md), quickstart.md

**Tests**: INCLUDED — exigidos pela constitution (Princípio VI: regras de negócio com testes unitários, serviços HTTP com `HttpTestingController`, fluxo crítico com integração) e listados em plan.md / research R-11. Vitest + jsdom via `npm test` (`ng test`).

**Organization**: Tarefas agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story da tarefa (US1…US5)
- Caminhos relativos à raiz do repositório (projeto Angular único: `src/app/`, `public/`)

## Convenções gerais (valem para TODAS as tarefas)

- Componentes standalone, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`, Signals; sem `any` (usar `unknown` + estreitamento); componentes não chamam `subscribe()`.
- Todos os textos pt-BR vêm de `src/app/features/business-registration/business-registration-content.ts` (nunca literais no template).
- Cores apenas via tokens CSS existentes (`--app-color-surface`, `--app-color-primary`, `--app-color-accent`, `--app-color-error-text`, …); nenhum hex em SCSS de componente.
- Nada escrito no console (FR-023); navegações com `.catch(() => undefined)`.
- Padrões de referência no código existente: `src/app/features/register/` (formulário, store, validators), `src/app/features/dashboard/` (store, página com `SiteHeader`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ícones, caminho de rota e textos que todas as histórias usam.

- [X] T001 [P] Adicionar os SVGs Material Symbols `public/icons/arrow_back.svg` e `public/icons/save.svg` (mesmo estilo/tamanho/`viewBox` dos ícones existentes em `public/icons/`) e incluir `'arrow_back'` e `'save'` em `APP_ICON_NAMES` em `src/app/core/icons/app-icon-name.ts` (ajustar `src/app/core/icons/provide-app-icons.spec.ts` se ele enumerar os nomes)
- [X] T002 [P] Adicionar `newBusiness: 'dashboard/new'` ao objeto `AppPaths` em `src/app/core/routing/app-paths.ts` (manter `registerBusiness: 'cadastrar-negocio'` inalterado)
- [X] T003 [P] Criar `src/app/features/business-registration/business-registration-content.ts` exportando constantes `as const` com TODOS os textos da tabela "Textos" de `contracts/business-registration-ui.md` (título da aba "Novo negócio — AchaLocal", "Voltar", "Novo negócio", subtítulo completo, seções "Informações básicas"/"Endereço"/"Contato", rótulos, placeholders, hint da Descrição completa, "Cadastrar negócio", "Cadastrando negócio", "Verificando seus dados", erro de verificação "Não foi possível carregar seus dados agora. Tente novamente em instantes." + "Tentar novamente", textos do diálogo, snackbars "Negócio cadastrado com sucesso." / "Você já possui um negócio cadastrado." com ação "Fechar"), as mensagens de falha de envio de data-model.md §5, os limites (`name` 2–100, `description` máx. 150, `details` 20–1000, `address` 5–200, `email` máx. 150) e `BUSINESS_REGISTRATION_TIMEOUT_MS = 30_000`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mover código compartilhado para `core/`, criar modelos, método HTTP, store (verificação básica), página-casca e rota.

**⚠️ CRITICAL**: Nenhuma user story começa antes do fim desta fase.

### Mover recurso de negócio para `core/business/` (research R-05)

- [X] T004 Mover com `git mv` para `src/app/core/business/` (sem mudar a forma dos tipos): `src/app/features/dashboard/models/business.ts`, `src/app/features/dashboard/models/business-load-result.ts`, `src/app/features/dashboard/models/business-response-data.dto.ts`, `src/app/features/dashboard/services/business-api.service.ts` (+ `.spec.ts`), `src/app/features/dashboard/services/business-response.mapper.ts` (+ `.spec.ts`); corrigir imports internos desses arquivos e dos consumidores `src/app/features/dashboard/business-card/business-card.ts`, `src/app/features/dashboard/state/dashboard.store.ts` e specs do dashboard que importem esses caminhos
- [X] T005 [P] Mover com `git mv` `src/app/features/register/validators/not-blank.validator.ts` (+ `.spec.ts`) para `src/app/core/forms/not-blank.validator.ts` (+ `.spec.ts`) e atualizar o import em `src/app/features/register/register-form/register-form.ts`
- [X] T006 Rodar `npm test` e `npm run build` e confirmar que dashboard e register continuam verdes após T004/T005 (nenhuma mudança de comportamento)

### Modelos da feature (data-model.md)

- [X] T007 [P] Criar `src/app/features/business-registration/models/business-registration-field.ts` com `type BusinessRegistrationField = 'name' | 'description' | 'details' | 'address' | 'email' | 'telephone'` e `FIELD_ORDER: readonly BusinessRegistrationField[] = ['name', 'description', 'details', 'address', 'email', 'telephone']`
- [X] T008 [P] Criar `src/app/features/business-registration/models/business-registration-status.ts` com `type BusinessRegistrationStatus = 'checking' | 'check-failed' | 'ready' | 'submitting' | 'submit-failed'`
- [X] T009 [P] Criar `src/app/features/business-registration/models/business-registration-failure.ts` com a união `{ readonly kind: 'generic' } | { readonly kind: 'invalid-data' } | { readonly kind: 'already-registered' }` (data-model.md §5)
- [X] T010 [P] Criar `src/app/features/business-registration/models/business-registration-input.ts` com interface readonly `BusinessRegistrationInput { name: string; description: string | null; details: string; address: string; email: string | null; telephone: string | null }` (telephone = "só dígitos, sem máscara (10 ou 11, ex.: `35995678901`); `null` se sem dígitos")
- [X] T011 [P] Criar `src/app/features/business-registration/models/register-business-request.dto.ts` com interface readonly `RegisterBusinessRequestDto { name: string; description: string | null; email: string | null; address: string; telephone: string | null; detalhes: string }` — chave `detalhes` em português, exatamente como no payload (research R-02)

### HTTP: `registerBusiness` (contracts/business-registration-api.md)

- [X] T012 Escrever testes em `src/app/core/business/business-api.service.spec.ts` para `registerBusiness(clientId, request)`: método `POST`, URL exata `${API_BASE_URL}/${clientId}/business`, corpo idêntico ao DTO, e o serviço NÃO adiciona `Authorization` (garantir que falham antes de T013)
- [X] T013 Implementar `registerBusiness(clientId: number, request: RegisterBusinessRequestDto): Observable<ApiResponseDto<BusinessResponseDataDto>>` em `src/app/core/business/business-api.service.ts` (mesmo `API_BASE_URL` do `getClientBusiness`; sem timeout no serviço — o timeout fica no store)

### Store (verificação básica), página-casca e rota

- [X] T014 Criar `src/app/features/business-registration/state/business-registration.store.ts` (`@Injectable()` sem `providedIn`): sinais `status` (inicial `'checking'`), `failureMessage: string | null`, computeds `isSubmitting` (`status === 'submitting'`) e `showForm` (`ready | submitting | submit-failed`); método `check()` que lê `clientId` de `AuthSessionService`, chama `BusinessApiService.getClientBusiness`, aplica `timeout(BUSINESS_REGISTRATION_TIMEOUT_MS)`, `takeUntilDestroyed(DestroyRef)`, mapeia com `toBusinessLoadResult`/`errorToBusinessLoadResult` de `src/app/core/business/business-response.mapper.ts` e, por ora, trata apenas `not-found` → `'ready'` (demais resultados completados em US3); trava de requisição em curso liberada em `finalize`; `check()` só aceito em `checking` (inicial) ou `check-failed`
- [X] T015 Criar a página `src/app/features/business-registration/business-registration-page.ts/.html/.scss` (`providers: [BusinessRegistrationStore]`, chama `store.check()` no construtor): `SiteHeader` com `DASHBOARD_NAVIGATION_ITEMS` de `src/app/features/dashboard/dashboard-content.ts` e botão projetado "Sair" via `AuthRedirectService.signOut()` (igual a `dashboard-page`); coluna central `max-width` ≈ 600 px com margens 16 px; `h1` "Novo negócio" e subtítulo; estado `checking` com `mat-progress-spinner` + texto visualmente oculto "Verificando seus dados" em container `role="status"`; slot `@if (store.showForm())` reservado para o formulário (US1); `overflow-wrap: anywhere` e sem rolagem horizontal de 320 a 1920 px
- [X] T016 Adicionar a rota em `src/app/app.routes.ts`: `{ path: AppPaths.newBusiness, canActivate: [authGuard], title: 'Novo negócio — AchaLocal' (do content), loadComponent: () => import('./features/business-registration/business-registration-page').then(m => m.BusinessRegistrationPage) }`, declarada como irmã de `dashboard` (não `children`)

**Checkpoint**: `/dashboard/new` abre com sessão, mostra spinner e, para cliente sem negócio, chega ao estado `ready`.

---

## Phase 3: User Story 1 - Cadastrar o primeiro negócio (Priority: P1) 🎯 MVP

**Goal**: Cliente sem negócio vai do dashboard ao formulário, envia dados e volta ao dashboard com o negócio e o aviso de sucesso; "← Voltar" com confirmação de descarte.

**Independent Test**: Login com cliente sem negócio → "Cadastrar agora" → `/dashboard/new` → preencher dados válidos → "Cadastrar negócio" → `/dashboard` mostra o cartão do negócio + snackbar "Negócio cadastrado com sucesso." (quickstart cenários 3, 8, 9, 15, 16).

### Tests for User Story 1

- [X] T017 [P] [US1] Testes de `toBusinessRegistrationInput` e `toRegisterBusinessRequestDto` em `src/app/features/business-registration/services/business-registration-input.mapper.spec.ts`: `trim` em todos os campos; `description`/`email` vazios ou só espaços → `null`; telefone `(35) 99567-8901` → `"35995678901"` e sem dígitos → `null`; `details` → chave `detalhes`
- [X] T018 [P] [US1] Testes de `DiscardChangesDialog` em `src/app/features/business-registration/discard-changes-dialog/discard-changes-dialog.spec.ts`: título "Descartar os dados preenchidos?", "Continuar editando" fecha com `false` e tem foco inicial, "Descartar" fecha com `true`
- [X] T019 [P] [US1] Testes do caminho feliz do submit em `src/app/features/business-registration/state/business-registration.store.spec.ts`: `submit(input)` em `ready` → `status 'submitting'` → `POST` com DTO mapeado → `navigateByUrl('/dashboard', { replaceUrl: true })` + `FeedbackSnackbarService.open('Negócio cadastrado com sucesso.', 'success', 'Fechar')`; duplo `submit()` gera 1 só requisição (SC-007); `submit()` ignorado fora de `ready`/`submit-failed`
- [X] T020 [P] [US1] Testes de `BusinessRegistrationForm` em `src/app/features/business-registration/business-registration-form/business-registration-form.spec.ts`: renderiza os 3 cartões com `h2` e os 6 rótulos; submit válido emite `submitted` com `BusinessRegistrationInput`; `submitting = true` desabilita o form, o botão e "Voltar" e mostra spinner com `aria-label="Cadastrando negócio"`; "Voltar" sem conteúdo emite `back` sem diálogo; com conteúdo abre o diálogo e só emite `back` se "Descartar"
- [X] T021 [P] [US1] Atualizar `src/app/features/dashboard/business-empty-state/business-empty-state.spec.ts` e `src/app/features/dashboard/dashboard-page.spec.ts` para esperar `href` `/dashboard/new` em "Cadastrar agora" e "Novo negócio"
- [X] T022 [P] [US1] Adicionar a `src/app/app.routes.spec.ts`: `/cadastrar-negocio` redireciona para `/dashboard/new`; `/dashboard/new` com sessão válida renderiza `BusinessRegistrationPage` e define o título "Novo negócio — AchaLocal"
- [X] T023 [US1] Teste de integração do fluxo crítico em `src/app/features/business-registration/business-registration-page.spec.ts` com `RouterTestingHarness` + `HttpTestingController`: sessão válida → `GET` 404 → formulário visível → preencher → enviar → `POST` 201 → URL `/dashboard` + snackbar de sucesso

### Implementation for User Story 1

- [X] T024 [P] [US1] Implementar `src/app/features/business-registration/services/business-registration-input.mapper.ts`: `toBusinessRegistrationInput(formValue)` (trim; opcionais vazios → `null`; telefone via `extractDigits` importada de `src/app/features/business-registration/services/phone-mask.ts` — se o arquivo ainda não existir, criá-lo agora só com `extractDigits(text)` (remove tudo que não for `0-9`); `formatPhone` entra em T038) e `toRegisterBusinessRequestDto(input)` (cópia 1:1, `details` → `detalhes`)
- [X] T025 [P] [US1] Criar `src/app/features/business-registration/discard-changes-dialog/discard-changes-dialog.ts/.html` (`MatDialogModule`): `h2 mat-dialog-title` "Descartar os dados preenchidos?"; ações "Continuar editando" (`[mat-dialog-close]="false"`, `cdkFocusInitial`) e "Descartar" (`[mat-dialog-close]="true"`)
- [X] T026 [US1] Implementar `submit(input: BusinessRegistrationInput)` em `src/app/features/business-registration/state/business-registration.store.ts`: aceito só em `ready`/`submit-failed` e sem requisição em curso; limpa `failureMessage`; `status 'submitting'`; `registerBusiness(clientId, toRegisterBusinessRequestDto(input))` com `timeout(30_000)`, `takeUntilDestroyed`, `finalize` liberando a trava; 2xx com `success !== false` → `navigateByUrl('/dashboard', { replaceUrl: true }).catch(() => undefined)` e snackbar `success` "Negócio cadastrado com sucesso." (ação "Fechar"); falhas por ora → `status 'submit-failed'` com a mensagem genérica (refinado em US5)
- [X] T027 [US1] Criar `src/app/features/business-registration/business-registration-form/business-registration-form.ts/.html/.scss`: `NonNullableFormBuilder` com controles `name`, `description`, `details`, `address`, `email`, `telephone` (todos `''`); `input()` `submitting: boolean` e `failureMessage: string | null`; `output()` `submitted: BusinessRegistrationInput` e `back: void`; três `mat-card appearance="outlined"` com `h2` ("Informações básicas": Nome do negócio, Descrição rápida, Descrição completa em `textarea` com `cdkTextareaAutosize` + hint da IA; "Endereço": Endereço completo; "Contato": E-mail `type="email"` e Telefone `type="tel"` `inputmode="numeric"`, lado a lado ≥ 600 px e em coluna abaixo); atributos `maxlength`/`autocomplete` de data-model.md §1; placeholders do content; `effect` que chama `form.disable()`/`form.enable()` conforme `submitting`
- [X] T028 [US1] No mesmo formulário, implementar a barra de ações fixa em `business-registration-form.html/.scss`: `div.actions` com `position: sticky; bottom: 0`, `z-index` acima dos cartões, fundo `var(--app-color-surface)`, borda superior com token de contorno, padding vertical 12 px; `mat-flat-button type="submit"` "Cadastrar negócio" com `mat-icon svgIcon="save"`, alinhado à direita ≥ 600 px e largura total < 600 px; durante `submitting` botão desabilitado + `mat-progress-spinner` 20 px `aria-label="Cadastrando negócio"`; `padding-bottom` no conteúdo para o último campo nunca ficar coberto; bloco `role="alert"` com `failureMessage` logo acima da barra (`@if`)
- [X] T029 [US1] Implementar "← Voltar" no formulário (`mat-button` com `mat-icon svgIcon="arrow_back"`, desabilitado durante envio): método `hasContent()` (algum controle com `value.trim().length > 0`); sem conteúdo → emite `back`; com conteúdo → abre `DiscardChangesDialog` via `MatDialog` e usa `firstValueFrom(afterClosed())`, emitindo `back` apenas se o resultado for `true`
- [X] T030 [US1] Integrar na página `src/app/features/business-registration/business-registration-page.html/.ts`: dentro do `@if (store.showForm())` renderizar `<app-business-registration-form [submitting]="store.isSubmitting()" [failureMessage]="store.failureMessage()" (submitted)="store.submit($event)" (back)="goToDashboard()" />`; `goToDashboard()` → `router.navigateByUrl('/dashboard').catch(() => undefined)`
- [X] T031 [P] [US1] Atualizar os links "Cadastrar agora" e "Novo negócio" para `AppPaths.newBusiness` em `src/app/features/dashboard/business-empty-state/business-empty-state.ts/.html` e `src/app/features/dashboard/dashboard-page.ts/.html` (FR-006)
- [X] T032 [P] [US1] Converter a rota `AppPaths.registerBusiness` em `src/app/app.routes.ts` para `{ path: AppPaths.registerBusiness, redirectTo: AppPaths.newBusiness, pathMatch: 'full' }` (manter `ComingSoonPage` para `editBusiness`/`deleteBusiness`)

**Checkpoint**: MVP — cadastro completo de ponta a ponta para cliente sem negócio.

---

## Phase 4: User Story 2 - Validação dos dados do formulário (Priority: P1)

**Goal**: Mensagens pt-BR por campo ao sair do campo e ao enviar; nada enviado com campos inválidos; foco no primeiro inválido; contadores; máscara de telefone.

**Independent Test**: Enviar o formulário vazio e com valores inválidos em cada campo; verificar mensagens, foco e que nenhum `POST` sai (quickstart cenários 4, 5, 6).

### Tests for User Story 2

- [X] T033 [P] [US2] Testes em `src/app/features/business-registration/services/phone-mask.spec.ts`: `extractDigits` remove tudo que não for `0-9` (`+55 11 98765-4321` → `5511987654321`, `11.98765.4321` → `11987654321`); `formatPhone`: `''` → `''`; 1–2 dígitos → `(XX`; 3–6 → `(XX) XXXX`; 7–10 → `(XX) XXXX-XXXX`; 11 → `(XX) XXXXX-XXXX`; > 11 → dígitos crus (não truncado)
- [X] T034 [P] [US2] Testes em `src/app/features/business-registration/validators/brazilian-phone.validator.spec.ts`: sem dígitos → `null`; 10 ou 11 dígitos (com ou sem máscara) → `null`; demais → `{ phone: true }` (inclui 9 e 13 dígitos)
- [X] T035 [P] [US2] Testes em `src/app/features/business-registration/validators/trimmed-min-length.validator.spec.ts`: `trimmedMinLength(n)` mede o valor com `trim`; vazio → `null` (obrigatoriedade fica com `required`/`notBlank`); abaixo do mínimo → `{ trimmedMinLength: { requiredLength: n, actualLength } }`
- [X] T036 [P] [US2] Testes em `src/app/features/business-registration/services/business-field-message.spec.ts`: prioridade e textos — `required`/`blank` → "Campo obrigatório."; `trimmedMinLength` → "Informe pelo menos {requiredLength} caracteres."; `maxlength` → "Use no máximo {requiredLength} caracteres."; `email` → "Informe um e-mail válido."; `phone` → "Informe um telefone válido com DDD."; `null` sem erros
- [X] T037 [US2] Ampliar `src/app/features/business-registration/business-registration-form/business-registration-form.spec.ts`: submit vazio não emite `submitted`, mostra "Campo obrigatório." em Nome/Descrição completa/Endereço e foca Nome; só espaços tratado como vazio; e-mail `abc` + blur → "Informe um e-mail válido."; telefone digitado `11987654321` → `(11) 98765-4321`; digitação para em 11 dígitos; colagem (`inputType: 'insertFromPaste'`) de `+55 11 98765-4321` mantém 13 dígitos e mostra "Informe um telefone válido com DDD."; contadores "{n}/150" e "{n}/1000"

### Implementation for User Story 2

- [X] T038 [P] [US2] Completar `src/app/features/business-registration/services/phone-mask.ts` (criado em T024 com `extractDigits`) adicionando `formatPhone(digits: string): string` conforme data-model.md §7
- [X] T039 [P] [US2] Implementar `src/app/features/business-registration/validators/brazilian-phone.validator.ts` (`ValidatorFn`: dígitos via `extractDigits`; vazio → `null`; 10 ou 11 → `null`; senão `{ phone: true }`)
- [X] T040 [P] [US2] Implementar `src/app/features/business-registration/validators/trimmed-min-length.validator.ts` (`trimmedMinLength(minLength: number): ValidatorFn`)
- [X] T041 [P] [US2] Implementar `src/app/features/business-registration/services/business-field-message.ts` (`businessFieldMessage(errors: ValidationErrors | null): string | null`, uma mensagem por vez na prioridade da tabela de data-model.md §1, textos do content)
- [X] T042 [US2] Aplicar validadores em `business-registration-form.ts` exatamente como data-model.md §1: `name` → `required`, `notBlankValidator`, `trimmedMinLength(2)`, `Validators.maxLength(100)`; `description` → `Validators.maxLength(150)`; `details` → `required`, `notBlankValidator`, `trimmedMinLength(20)`, `Validators.maxLength(1000)`; `address` → `required`, `notBlankValidator`, `trimmedMinLength(5)`, `Validators.maxLength(200)`; `email` → `trimmedEmailValidator` (de `src/app/core/forms/trimmed-email.validator.ts`), `Validators.maxLength(150)`; `telephone` → `brazilianPhoneValidator`; `notBlankValidator` importado de `src/app/core/forms/not-blank.validator.ts`; `required` nos inputs para o asterisco do Material
- [X] T043 [US2] Em `business-registration-form.html/.ts`: `mat-error` com `businessFieldMessage(control.errors)` por campo (exibido quando `touched` ou após tentativa de envio); no submit inválido `markAllAsTouched()`, não emitir e focar o primeiro inválido na ordem de `FIELD_ORDER` via `viewChildren(MatInput)` + `MatInput.focus()` (mesmo padrão de `src/app/features/register/register-form/register-form.ts`); contadores `mat-hint align="end"` "{n}/150" em Descrição rápida e "{n}/1000" em Descrição completa (via `computed`/método, sem lógica no template)
- [X] T044 [US2] Em `business-registration-form.ts/.html`: handler `(input)` do Telefone que lê o valor, extrai dígitos, limita a 11 dígitos quando `inputType` NÃO for `insertFromPaste`/`insertFromDrop`, e aplica `control.setValue(formatPhone(digits), { emitEvent: false })` + `updateValueAndValidity()` — sem acesso direto ao DOM além de `event.target` tipado

**Checkpoint**: US1 + US2 — cadastro com validação completa.

---

## Phase 5: User Story 3 - Impedir cadastro por quem já tem negócio (Priority: P1)

**Goal**: Cliente com negócio nunca vê o formulário; falha na verificação mostra erro com "Tentar novamente".

**Independent Test**: Login com cliente que já tem negócio, abrir `/dashboard/new` pela URL → `/dashboard` sem formulário; backend parado → mensagem + "Tentar novamente" (quickstart cenários 9, 10, 11).

### Tests for User Story 3

- [X] T045 [P] [US3] Ampliar `src/app/features/business-registration/state/business-registration.store.spec.ts` (check): `found` → `navigateByUrl('/dashboard', { replaceUrl: true })` e `status` nunca `ready`; `invalid`, erro de rede, 5xx, 403 → `'check-failed'`; timeout de 30 s com `vi.useFakeTimers()` → `'check-failed'`; `check()` em `check-failed` refaz o `GET` e chega a `ready`; `check()` duplicado com requisição em curso é ignorado
- [X] T046 [US3] Ampliar `src/app/features/business-registration/business-registration-page.spec.ts`: `GET` 200 com negócio → URL `/dashboard` e formulário nunca renderizado; `GET` 500 → texto "Não foi possível carregar seus dados agora. Tente novamente em instantes." em `role="alert"`, sem formulário; clicar "Tentar novamente" → novo `GET` 404 → formulário; spinner `role="status"` presente enquanto o `GET` pende

### Implementation for User Story 3

- [X] T047 [US3] Completar `check()` em `src/app/features/business-registration/state/business-registration.store.ts`: `found` → `navigateByUrl('/dashboard', { replaceUrl: true }).catch(() => undefined)`; `invalid`/erro/`TimeoutError` → `status 'check-failed'`
- [X] T048 [US3] Renderizar o estado `check-failed` em `src/app/features/business-registration/business-registration-page.html/.scss`: bloco `role="alert"` com a mensagem de erro de verificação e `mat-stroked-button` "Tentar novamente" chamando `store.check()`; nenhum formulário neste estado

**Checkpoint**: Regra "um negócio por cliente" garantida na entrada da página.

---

## Phase 6: User Story 4 - Acesso restrito a clientes autenticados (Priority: P1)

**Goal**: Sem sessão válida → `/login`; 401 na verificação ou no envio → sessão descartada + `/login`.

**Independent Test**: Abrir `/dashboard/new` sem sessão, com sessão expirada e corrompida → `/login`; apagar o token com o formulário aberto e enviar → `/login` (quickstart cenários 1, 2, 17).

### Tests for User Story 4

- [X] T049 [P] [US4] Adicionar a `src/app/app.routes.spec.ts`: `/dashboard/new` sem sessão, com sessão expirada e com sessão corrompida → `/login` (sessão descartada) sem renderizar `BusinessRegistrationPage`; `/cadastrar-negocio` sem sessão → `/login`
- [X] T050 [US4] Ampliar `src/app/features/business-registration/business-registration-page.spec.ts`: `GET` responde 401 → `/login` e sessão removida; formulário preenchido + `POST` responde 401 → `/login` e sessão removida; nenhuma requisição leva o token na URL/corpo (só no header `Authorization` via `authTokenInterceptor`)

### Implementation for User Story 4

- [X] T051 [US4] Ajustar somente se os testes T049/T050 falharem: confirmar que a rota usa `canActivate: [authGuard]` em `src/app/app.routes.ts` e que o store não emite nada/navega nada quando o interceptor completa sem emitir no 401 (trava liberada por `finalize` em `src/app/features/business-registration/state/business-registration.store.ts`); nenhuma mudança em `src/app/core/auth/`

**Checkpoint**: Segurança de acesso verificada por testes.

---

## Phase 7: User Story 5 - Tratar falha no envio do cadastro (Priority: P2)

**Goal**: Mensagens pt-BR por tipo de falha, dados preservados, reenvio possível; 409 → aviso + `/dashboard`.

**Independent Test**: Simular backend parado, 400 e 409 no envio; conferir mensagem, dados mantidos e redirecionamento no 409 (quickstart cenários 12, 13, 14).

### Tests for User Story 5

- [X] T052 [P] [US5] Testes em `src/app/features/business-registration/services/business-registration-error.mapper.spec.ts` para `mapBusinessRegistrationError(error: unknown)`: 409 → `already-registered`; 400 e 422 → `invalid-data` (mesmo com `error.errors`); status 0, `TimeoutError`, 403, 404, 500, 503, valor não-HTTP → `generic`
- [X] T053 [P] [US5] Ampliar `src/app/features/business-registration/state/business-registration.store.spec.ts` (submit): 2xx com `success: false` → `submit-failed` + mensagem genérica; 400/422 → `submit-failed` + "Verifique os dados informados e tente novamente."; 500, status 0 e timeout 30 s (`vi.useFakeTimers`) → `submit-failed` + "Não foi possível cadastrar seu negócio agora. Tente novamente em instantes."; 409 → snackbar `warning` "Você já possui um negócio cadastrado." (ação "Fechar") + `navigateByUrl('/dashboard', { replaceUrl: true })`; após falha, `submit()` aceito de novo e limpa `failureMessage`; nunca fica preso em `submitting`
- [X] T054 [US5] Ampliar `src/app/features/business-registration/business-registration-page.spec.ts`: `POST` 500 → mensagem em `role="alert"` acima da barra, valores digitados preservados e botão reabilitado; `POST` 400 com `errors` por campo → mensagem genérica e nenhum `mat-error` novo; nenhum `message`/`title`/`detail`/`correlationId` do serviço aparece na tela

### Implementation for User Story 5

- [X] T055 [P] [US5] Implementar `src/app/features/business-registration/services/business-registration-error.mapper.ts`: `mapBusinessRegistrationError(error: unknown): BusinessRegistrationFailure` (estreitar `HttpErrorResponse`; 409 → `already-registered`; 400/422 → `invalid-data`; resto → `generic`) e helper `failureMessage(failure)` com os textos de data-model.md §5
- [X] T056 [US5] Refinar `submit()` em `src/app/features/business-registration/state/business-registration.store.ts`: 2xx com `success === false` (ler com `parseApiResponseBody`/`isRecord`) → `generic`; `catchError` → `mapBusinessRegistrationError`; `already-registered` → `navigateByUrl('/dashboard', { replaceUrl: true }).catch(() => undefined)` + `FeedbackSnackbarService.open('Você já possui um negócio cadastrado.', 'warning', 'Fechar')`; `generic`/`invalid-data` → `status 'submit-failed'` + `failureMessage` correspondente; nunca exibir conteúdo bruto da resposta
- [X] T057 [US5] Garantir em `business-registration-form.ts` que, ao sair de `submitting` para `submit-failed`, o `form.enable()` mantém os valores e nenhum erro de servidor é aplicado aos controles (`setErrors` nunca chamado com dados da resposta)

**Checkpoint**: Todas as histórias funcionais e testadas independentemente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade transversal, acessibilidade, orçamento e validação final.

- [X] T058 [P] Revisar acessibilidade em `src/app/features/business-registration/**`: `h1` único, `h2` por cartão, `role="status"`/`role="alert"` corretos, `aria-label` do spinner de envio, diálogo com foco preso e devolvido ao "Voltar", todos os controles operáveis por teclado (FR-024)
- [X] T059 [P] Verificar responsividade 320–1920 px em `business-registration-page.scss` e `business-registration-form.scss`: sem rolagem horizontal, E-mail/Telefone em 2 colunas ≥ 600 px, barra fixa visível em toda rolagem sem cobrir o último campo (FR-021, SC-008)
- [X] T060 Rodar `npm run lint:colors` e `npm run lint:contrast` e corrigir qualquer hex fora de tokens ou contraste < AA nos SCSS da feature
- [X] T061 Rodar `npm run build` e confirmar que nenhum SCSS de componente passa de 4 kB (warn) / 8 kB (error) e que a rota é lazy (chunk próprio de `business-registration-page`)
- [X] T062 Buscar `console.` e `any` em `src/app/features/business-registration/` e `src/app/core/business/` e remover ocorrências (FR-023, Princípio I)
- [X] T063 [P] Atualizar `README.md` (se ele lista rotas/features) com `/dashboard/new` e o redirect de `/cadastrar-negocio`
- [ ] T064 Rodar `npm test` completo (todos verdes) e executar os 18 cenários manuais de `specs/007-business-registration/quickstart.md` contra o backend UAT

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; BLOQUEIA todas as histórias. Ordem interna: T004/T005 → T006; T007–T011 em paralelo; T012 → T013; T014 (depende de T003, T004, T008) → T015 → T016.
- **US1 (Phase 3)**: após Phase 2. MVP.
- **US2 (Phase 4)**: após Phase 2; edita o formulário criado em US1 (T027) → executar depois de T027.
- **US3 (Phase 5)**: após Phase 2; independente de US1/US2 (edita store e página, não o formulário).
- **US4 (Phase 6)**: após Phase 2 (T016); testes de 401 no envio (T050) precisam de US1 (T026, T030).
- **US5 (Phase 7)**: após US1 (refina `submit()` de T026 e usa o bloco de falha de T028).
- **Polish (Phase 8)**: após as histórias desejadas.

### User Story Dependencies

```text
Setup → Foundational ─┬─► US1 (MVP) ─┬─► US2 (form validations)
                      │              ├─► US5 (submit failures)
                      │              └─► US4 (401 on submit part)
                      ├─► US3 (check redirect / retry)
                      └─► US4 (guard part)
```

### Within Each User Story

- Testes primeiro (devem falhar), depois implementação.
- Modelos/funções puras → store → componentes → integração na página.
- Tarefas no mesmo arquivo (`business-registration.store.ts`, `business-registration-form.ts`, `business-registration-page.html`) são sequenciais.

### Parallel Opportunities

- Setup: T001, T002, T003 em paralelo.
- Foundational: T005 em paralelo com T004; T007–T011 todos em paralelo.
- US1: T017, T018, T019, T020, T021, T022 em paralelo; T024, T025, T031, T032 em paralelo.
- US2: T033–T036 em paralelo; T038–T041 em paralelo.
- US3 pode rodar em paralelo com US1 por outra pessoa (arquivos de formulário não se sobrepõem; coordenar edições no store).
- US5: T052 e T053 em paralelo; T055 em paralelo com testes.
- Polish: T058, T059, T063 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Testes de US1 juntos:
Task: "T017 Testes do input mapper em services/business-registration-input.mapper.spec.ts"
Task: "T018 Testes do DiscardChangesDialog em discard-changes-dialog/discard-changes-dialog.spec.ts"
Task: "T020 Testes do BusinessRegistrationForm em business-registration-form/business-registration-form.spec.ts"
Task: "T021 Atualizar specs de links do dashboard"

# Implementações independentes de US1 juntas:
Task: "T024 Input mapper em services/business-registration-input.mapper.ts"
Task: "T025 DiscardChangesDialog em discard-changes-dialog/"
Task: "T031 Links do dashboard → AppPaths.newBusiness"
Task: "T032 Redirect de cadastrar-negocio em app.routes.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T038 phone-mask.ts"
Task: "T039 brazilian-phone.validator.ts"
Task: "T040 trimmed-min-length.validator.ts"
Task: "T041 business-field-message.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (move para `core/`, modelos, `registerBusiness`, store/página/rota)
3. Phase 3: US1
4. **STOP and VALIDATE**: quickstart cenários 3, 8, 9, 15, 16
5. Demo

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → cadastro ponta a ponta (MVP)
3. US2 → validações e máscara
4. US3 → bloqueio para quem já tem negócio
5. US4 → testes de acesso/401
6. US5 → tratamento de falhas no envio
7. Polish → lint, build, a11y, quickstart completo

> Observação: US2, US3 e US4 são P1 junto com US1; o MVP demonstrável é US1, mas a entrega para produção requer todas as P1.

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes.
- [Story] mapeia a tarefa à user story para rastreabilidade.
- Commit após cada tarefa ou grupo lógico; parar em qualquer checkpoint para validar.
- `ComingSoonPage` continua em uso por `editBusiness`/`deleteBusiness` — não remover.
