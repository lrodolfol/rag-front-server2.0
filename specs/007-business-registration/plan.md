# Implementation Plan: Cadastro de Negócio (/dashboard/new)

**Branch**: `feat/new-business-page` (feature dir `007-business-registration`) | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-business-registration/spec.md` + decisões técnicas
de `.mine/cadastro-de-negocios/plan.md` + esboço `.mine/cadastro-de-negocios/cadastro-page.excalidraw`

## Summary

Trocar o placeholder "em breve" do cadastro de negócio por um formulário real em `/dashboard/new`,
protegido pelo `authGuard` existente. Ao abrir, o `BusinessRegistrationStore` (Signals, provido na
página) verifica se o cliente já tem negócio reutilizando o `GET {API_BASE_URL}/{clientId}/business`
da feature 006: sem negócio → formulário; com negócio → `/dashboard` (`replaceUrl`); falha →
mensagem + "Tentar novamente". O formulário (Reactive Forms + Angular Material) segue o esboço:
"← Voltar", título "Novo negócio", três cartões (Informações básicas, Endereço, Contato) e uma
**barra de ações fixa** (`position: sticky`) com "Cadastrar negócio". Campos e obrigatoriedade seguem
o mapeamento do usuário (Nome, Descrição completa → `detalhes` e Endereço obrigatórios; Descrição
rápida, E-mail e Telefone opcionais), com máscara de telefone própria. O envio faz
`POST {API_BASE_URL}/{clientId}/business` (dev `http://localhost:5170/api/v1/{clientId}/business`)
com o payload do usuário; o token entra pelo `authTokenInterceptor`. Sucesso → `/dashboard` +
snackbar "Negócio cadastrado com sucesso."; 409 → snackbar "Você já possui um negócio cadastrado." +
`/dashboard`; 400/422 e demais falhas → mensagem genérica com dados preservados. O serviço de negócio
sobe de `features/dashboard/` para `core/business/` (dois consumidores). **Nenhuma dependência nova.**

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, Reactive Forms, `HttpClient` +
`withInterceptors`, `Router`), Angular Material/CDK 22.2 (`MatFormField`, `MatInput`, `MatCard`,
`MatButton`, `MatIcon`, `MatProgressSpinner`, `MatDialog`, `MatSnackBar` via
`FeedbackSnackbarService`, `CdkTextareaAutosize`), RxJS 7.8 (`timeout`, `catchError`, `finalize`,
`takeUntilDestroyed`). **Nenhuma dependência nova** (máscara de telefone própria — research R-06).

**Storage**: nenhum armazenamento novo. Sessão continua em `sessionStorage` via `AuthSessionService`
(feature 005); dados do formulário só em memória (sem rascunho — fora do escopo).

**Testing**: Vitest + jsdom via `ng test`; `HttpTestingController` (serviço, store, integração);
`vi.useFakeTimers` (timeout 30 s); `RouterTestingHarness` (rotas, guard, redirecionamentos);
`MatDialogHarness`/`MatSnackBarHarness` quando úteis; `npm run lint:colors` e `npm run lint:contrast`

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (320–1920 px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: rota lazy (`loadComponent`); verificação + formulário visíveis em ≤ 3 s em rede
normal; negócio visível no dashboard em ≤ 3 s após o sucesso (SC-006)

**Constraints**: zero saída no console (FR-023); textos pt-BR; cores só via tokens existentes;
orçamento de estilo por componente 4 kB warn / 8 kB error; WCAG 2.1 AA; token nunca em URL, tela,
log ou `localStorage` (FR-022); timeout 30 s; backend UAT precisa aceitar CORS (preflight com
`Authorization` e `Content-Type: application/json`) de `http://localhost:4200`; botão de envio sempre
visível durante a rolagem (decisão do usuário)

**Scale/Scope**: 1 rota nova (`dashboard/new`) + 1 rota convertida em redirect (`cadastrar-negocio`);
1 página + 2 subcomponentes (formulário, diálogo de descarte); 1 store; 1 método HTTP novo; 2 mappers;
2 validadores novos + 1 movido; 1 utilitário de máscara; 2 ícones novos; 0 tokens de cor novos;
5 arquivos movidos de `features/dashboard/` para `core/business/`; 2 links do dashboard atualizados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, OnPush, Signals no store, `input()`/`output()` entre página e formulário, RxJS no fluxo HTTP. Sem `any`: respostas/erros lidos como `unknown` e estreitados (`isRecord`, `parseApiResponseBody`). Componentes não chamam `subscribe()`: store assina com `takeUntilDestroyed`; o diálogo usa `firstValueFrom(afterClosed())`. |
| II. Responsabilidade única / por feature | PASS | Nova pasta `features/business-registration/` (página, `business-registration-form/`, `discard-changes-dialog/`, `models/`, `services/`, `state/`, `validators/`, `*-content.ts`). Regras (máscara, validação, mapeamento de erro, decisão de estado) em funções/serviços, não em templates. Recurso compartilhado em `core/business/`. Nomes em inglês. |
| III. HTTP tipado | PASS | Só `BusinessApiService` faz HTTP. `RegisterBusinessRequestDto` separado de `BusinessRegistrationInput` (mapper entre eles); resposta tipada `ApiResponseDto<BusinessResponseDataDto>`. Token e 401 continuam no `authTokenInterceptor` (sem mudança). |
| IV. Segurança (NÃO NEGOCIÁVEL) | PASS | `dashboard/new` com `authGuard` (controle de acesso); `cadastrar-negocio` redireciona para ela (passa pelo guard). A verificação "cliente sem negócio" é **regra de negócio**, não controle de acesso (decisão do usuário, 2026-11-25): a página chama o `GET {clientId}/business`; se retornar dados, o cliente já tem negócio e é levado a `/dashboard`; se não retornar (404 ou `data: null`), o formulário é exibido. O backend reforça a regra com 409 no `POST`. Formulário só renderiza após confirmar "sem negócio". Token só no cabeçalho via interceptor. Sem acesso direto ao DOM: máscara via `FormControl.setValue`, foco via `MatInput.focus()`. Textos do usuário só por interpolação. |
| V. UX e identidade visual | PASS | Textos pt-BR; 100% Material (form-field, card, dialog, snackbar, spinner); estados verificando/pronto/enviando/erro tratados; tokens existentes (`--app-color-surface`, `--app-color-primary`, `--app-color-accent`, `--app-color-error-text`…); layout do esboço; responsivo; Reactive Forms com mensagens amigáveis. |
| VI. Testes | PASS | Specs para serviço (`HttpTestingController`), mappers, máscara, validadores, mensagens, store, formulário, diálogo, página (integração com `RouterTestingHarness`) e rotas. Fluxo crítico dashboard → cadastro → dashboard por integração. |
| VII. Dependências mínimas | PASS | Zero dependências novas (máscara própria em vez de `ngx-mask`). Extrações para `core/` só onde há dois consumidores reais (`BusinessApiService` e afins; `notBlankValidator`). Reuso de `authGuard`, `authTokenInterceptor`, `AuthRedirectService`, `FeedbackSnackbarService`, `SiteHeader`, `trimmedEmailValidator`, `api-response-body`, `DASHBOARD_NAVIGATION_ITEMS`. |
| SDD | PASS | Spec com clarificações; divergências entre spec e as decisões do usuário (campos obrigatórios, textos do esboço, "Voltar" no lugar de "Cancelar") foram resolvidas a favor do input do usuário e **refletidas na spec** (FR-007, FR-012). Contrato do backend (chave `detalhes`, `null` em opcionais, telefone só com dígitos, 409/400/422, CORS) confirmado pelo usuário (research R-02, R-03, R-06). |

**Re-check pós-design (Phase 1)**: PASS — data model e contratos não introduzem dependências, cores
fora de tokens nem armazenamento novo. Contrato do backend confirmado pelo usuário (2026-11-25):
chave `detalhes` no POST, `null` para opcionais, telefone só com dígitos, 409 para "cliente já
possui negócio", 400/422 para dados inválidos e CORS liberado. Única pendência herdada: a forma
"sem negócio" do `GET` (risco R-04 da feature 006), já coberta pelo mapper existente (404 e
`data: null`).

## Project Structure

### Documentation (this feature)

```text
specs/007-business-registration/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── business-registration-api.md   # POST /{clientId}/business + GET reaproveitado → estados
│   ├── business-registration-ui.md    # textos, campos, estados, botão fixo, a11y, responsividade
│   └── routes.md                      # dashboard/new, redirect de cadastrar-negocio, navegações
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
public/icons/
├── arrow_back.svg  save.svg                    # NOVOS (Material Symbols)
src/app/
├── app.routes.ts                               # + dashboard/new (authGuard, lazy); cadastrar-negocio → redirectTo
├── app.routes.spec.ts                          # + nova rota, redirect, guard
├── core/
│   ├── business/                               # MOVIDO de features/dashboard/ (+ specs)
│   │   ├── business-api.service.ts/.spec.ts    # + registerBusiness(clientId, request) → POST
│   │   ├── business-response.mapper.ts/.spec.ts
│   │   ├── business-response-data.dto.ts
│   │   ├── business.ts
│   │   └── business-load-result.ts
│   ├── forms/
│   │   └── not-blank.validator.ts/.spec.ts     # MOVIDO de features/register/validators/
│   ├── icons/app-icon-name.ts                  # + arrow_back, save
│   └── routing/app-paths.ts                    # + newBusiness: 'dashboard/new'
└── features/
    ├── dashboard/                              # imports → core/business; links → AppPaths.newBusiness
    │   ├── dashboard-page.ts / business-empty-state.ts (+ specs)
    │   └── state/dashboard.store.ts
    ├── register/                               # import do notBlankValidator → core/forms
    └── business-registration/                  # NOVO
        ├── business-registration-page.ts/.html/.scss/.spec.ts   # header + estados + formulário; providers: [BusinessRegistrationStore]
        ├── business-registration-content.ts    # textos, limites, timeout
        ├── business-registration-form/
        │   └── business-registration-form.ts/.html/.scss/.spec.ts  # 3 cartões + barra fixa; inputs: submitting, failureMessage; outputs: submitted, back
        ├── discard-changes-dialog/
        │   └── discard-changes-dialog.ts/.html/.spec.ts            # MatDialog → boolean
        ├── models/
        │   ├── business-registration-input.ts  # valores normalizados do formulário
        │   ├── register-business-request.dto.ts
        │   ├── business-registration-field.ts  # 'name' | 'description' | 'details' | 'address' | 'email' | 'telephone'
        │   ├── business-registration-status.ts # 'checking' | 'check-failed' | 'ready' | 'submitting' | 'submit-failed'
        │   └── business-registration-failure.ts
        ├── services/
        │   ├── business-registration-input.mapper.ts/.spec.ts  # form → input (trim) → DTO (null em opcionais, detalhes)
        │   ├── business-registration-error.mapper.ts/.spec.ts  # erro HTTP → falha
        │   ├── business-field-message.ts/.spec.ts              # ValidationErrors → texto pt-BR
        │   └── phone-mask.ts/.spec.ts                          # extractDigits / formatPhone
        ├── validators/
        │   ├── brazilian-phone.validator.ts/.spec.ts
        │   └── trimmed-min-length.validator.ts/.spec.ts
        └── state/
            └── business-registration.store.ts/.spec.ts
```

**Structure Decision**: Nova feature isolada em `features/business-registration/`, espelhando
`features/register/` e `features/dashboard/` (página + subcomponentes, `models/`, `services/`,
`state/`, `validators/`, `*-content.ts`). O que passa a ter dois consumidores sobe para `core/`
(`core/business/` para o recurso de negócio; `core/forms/not-blank.validator.ts`). Controle de acesso
reutiliza integralmente `core/auth/`. Rota irmã `dashboard/new` em vez de rotas filhas para não
transformar `DashboardPage` em layout.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| Mover 5 arquivos de `features/dashboard/` para `core/business/` | Cadastro precisa do mesmo `GET` (verificação) e do novo `POST` no mesmo recurso | Importar de outra feature acopla features; duplicar o serviço repete URL e contrato |
| Máscara de telefone própria (`phone-mask.ts` + handler `(input)`) | FR-007a exige máscara, aceitar colagem formatada e não truncar colagem > 11 dígitos | `ngx-mask` é dependência nova para um único campo (Princípio VII) e não cobre "não truncar colagem" sem customização |
| Verificação "sem negócio" na página, não em guard | FR-005 exige indicador de carregamento e erro com "Tentar novamente" | Guard assíncrono deixa a navegação pendente sem feedback visual e não tem estado de erro com retry |
| `cadastrar-negocio` vira `redirectTo` | Landing e chatbot já linkam essa rota pública | Remover quebraria links; manter o "em breve" contradiz FR-006 |
