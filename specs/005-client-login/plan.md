# Implementation Plan: Tela de Login de Clientes (/login)

**Branch**: `feat/login-page` (a criar; feature dir `005-client-login`; branch atual `feat/register-page`) | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-client-login/spec.md` + decisões técnicas de
`.mine/login_page/plan.md` + desenho da página de cadastro `.mine/register_page/register-page.excalidraw`

## Summary

Adicionar o item "login" ao cabeçalho da landing e criar a página `/login`, onde o cliente informa
e-mail e senha. O formulário (Reactive Forms + Angular Material, mesmo layout do cadastro) valida no
cliente (obrigatórios, formato de e-mail; **sem** regras de composição de senha), normaliza o e-mail
(trim + minúsculas) e envia `POST {Email, Password}` a `{authApiUrl}/login` (UAT
`http://localhost:5170/api/v1/auth/login`). Durante o envio, campos e botão ficam bloqueados e um
spinner aparece ao lado do botão "entrar". Sucesso: a sessão (`accessToken`, `tokenType`,
`expiresAt`, `clientId`) é guardada em `sessionStorage` por um serviço de `core/auth/` e o cliente é
levado a `/dashboard` (placeholder "em breve" até a feature de dashboard), sem mensagem. Erro (401,
403, outros com texto): a mensagem do serviço aparece num aviso vermelho discreto; rede/timeout de
30 s/erro sem texto/sucesso sem dados de sessão → mensagem genérica. Após falha, o e-mail fica, a
senha é apagada; a mensagem some ao editar um campo. Nada é escrito no console.

Abordagem: promover o que o cadastro já tem e agora é compartilhado de verdade — `AuthApiService`
(ganha `login()`), envelope `ApiResponseDto`, leitura segura do corpo de erro e `trimmedEmailValidator`
— para `core/`; criar `AuthSessionService` (core) para a sessão; e a feature `features/login/` com
página, formulário, mappers puros e `LoginStore` com Signals provido na página. **Nenhuma dependência
nova.**

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, Reactive Forms, `HttpClient` +
`withFetch`, `Router`), Angular Material/CDK 22.2 (`MatFormField`, `MatInput`, `MatError`,
`MatIconButton` com `matSuffix`, `MatButton`, `MatIcon`, `MatProgressSpinner`), RxJS 7.8
(`timeout`, `catchError`, `takeUntilDestroyed`). **Nenhuma dependência nova.**

**Storage**: `sessionStorage` (chave `achalocal.auth-session`) apenas para a sessão do cliente,
com cópia em memória como fallback quando o storage estiver indisponível (research R-03). Credenciais
digitadas só em memória (FormGroup). Nada em `localStorage`.

**Testing**: Vitest + jsdom via `ng test`; `HttpTestingController` para `AuthApiService` e
integração da página; `vi.useFakeTimers` para o timeout de 30 s; `RouterTestingHarness` para rotas e
redirecionamento; `sessionStorage` do jsdom para `AuthSessionService`; `npm run lint:colors` e
`npm run lint:contrast`

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (320–1920 px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: rota `/login` lazy (`loadComponent`); feedback visual do envio no mesmo frame
do clique

**Constraints**: zero saída no console (FR-022); textos pt-BR; cores só via tokens existentes;
orçamento de estilo por componente 4 kB warn / 8 kB error; WCAG 2.1 AA; backend UAT precisa aceitar
CORS de `http://localhost:4200` (mesma situação do cadastro, research R-09); timeout de 30 s (FR-017)

**Scale/Scope**: 2 rotas novas (`/login`, `/dashboard` placeholder), 2 componentes (página +
formulário), 1 serviço HTTP estendido, 1 serviço de sessão novo, 3 mappers, 1 store, 1 ícone novo
(`login`), 0 tokens de cor novos; refatoração de 4 arquivos do cadastro para `core/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, OnPush, Signals no store, RxJS no fluxo HTTP. Sem `any`: corpo de erro e `data` lidos como `unknown` e estreitados por type guards; `business` tipado como `unknown`. Componentes não chamam `subscribe()` (o store assina com `takeUntilDestroyed`). |
| II. Responsabilidade única / por feature | PASS | `features/login/` com página, `login-form/`, `models/`, `services/` (mappers), `state/`, `login-content.ts`. Sessão em `core/auth/` (será consumida pelo dashboard). Normalização, mapeamento de erro, validação da resposta, duplo envio, timeout e redirecionamento ficam fora dos componentes. Nomes em inglês. |
| III. HTTP tipado | PASS | Só `AuthApiService` faz HTTP. DTOs `LoginRequestDto` (PascalCase) e `ApiResponseDto<LoginResponseDataDto>` separados dos modelos `LoginInput`/`AuthSession`; `login-input.mapper`, `login-session.mapper` e `login-error.mapper` convertem. Sem interceptor nesta feature: não há requisição autenticada ainda (o interceptor de `Authorization` nasce com o dashboard — YAGNI); tratamento de erro é específico do endpoint (ver Complexity Tracking). |
| IV. Segurança (NÃO NEGOCIÁVEL) | PASS c/ justificativa | Rota `/login` pública. Senha só no `FormControl`; apagada após falha; nunca em URL/storage/mensagens/console. Token em `sessionStorage` (morre ao fechar a aba; nunca `localStorage`, URL, logs ou tela) e descartado ao ler se expirado — ver Complexity Tracking e R-03. `/dashboard` é só placeholder sem dados; guard pertence à feature de dashboard (R-06). Textos do serviço renderizados por interpolação. Sem acesso direto ao DOM (foco via `MatInput.focus()`). `correlationId` nunca exibido. |
| V. UX e identidade visual | PASS | Textos pt-BR; 100% Material; mesmo layout/estilos do cadastro; tokens `--app-color-error-*` existentes; estados `idle`/`submitting`/`succeeded`/`failed`; Reactive Forms; responsivo. |
| VI. Testes | PASS | Specs: `AuthSessionService`, mappers, `AuthApiService.login` (`HttpTestingController`), `LoginStore` (transições, timeout, duplo envio, cancelamento, redirecionamento), `LoginForm` (validação, toggle, bloqueio, foco, limpeza da senha, sumiço do aviso), `LoginPage` (integração), cabeçalho da landing e rotas. Specs movidos junto com os arquivos promovidos a `core/`. |
| VII. Dependências mínimas | PASS | Zero dependências novas. Extração para `core/` só do que passa a ter 2 usos reais (previsto no plano 004). Toggle de senha e estilos do aviso duplicados de propósito (poucas linhas; extrair um componente genérico agora seria abstração prematura). Reuso de `SiteHeader`, `NavigationItem`, `AppPaths`, `ComingSoonPage`, `AUTH_API_URL`. |
| SDD | PASS | Spec aprovada; fora do escopo respeitado (logout, recuperação de senha, reenvio de confirmação, lembrar-me, links login↔cadastro, dashboard real). Ambiguidade "nome × e-mail" já resolvida na spec (e-mail). |

**Re-check pós-design (Phase 1)**: PASS — contratos e data model não introduzem dependências, cores
fora de tokens nem armazenamento persistente. Riscos: (a) CORS no UAT — mitigação: proxy do dev
server (R-09/quickstart); (b) caixa das chaves no corpo (`Email`/`password` no exemplo) — ASP.NET
associa sem diferenciar maiúsculas; enviamos PascalCase como no cadastro (R-02); (c) relógio do
cliente adiantado pode fazer a sessão parecer expirada — validação de expiração fica na leitura, não
no login (R-04); (d) a refatoração do cadastro precisa manter todos os testes do 004 verdes (R-01).

## Project Structure

### Documentation (this feature)

```text
specs/005-client-login/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── auth-login-api.md      # contrato HTTP do login + mapeamento de respostas
│   ├── auth-session.md        # contrato do AuthSessionService (consumido pelo dashboard)
│   ├── login-ui.md            # contrato de UI: textos, estados, acessibilidade
│   └── routes.md              # rotas e navegação
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
public/icons/
└── login.svg                                   # NOVO — item "login" e ícone do cartão (Material Symbols)
src/app/
├── app.routes.ts                               # + login → LoginPage; + dashboard → ComingSoonPage
├── app.routes.spec.ts                          # + /login e /dashboard
├── core/
│   ├── api/                                    # NOVO (promovido do cadastro)
│   │   ├── api-response.dto.ts                 # ← features/register/models/api-response.dto.ts
│   │   └── api-response-body.ts/.spec.ts       # isApiResponse, parseApiResponseBody, readableMessage, isRecord
│   ├── auth/                                   # NOVO
│   │   ├── auth-api.service.ts/.spec.ts        # ← features/register/services/…; + login(dto)
│   │   ├── auth-session.ts                     # modelo AuthSession
│   │   └── auth-session.service.ts/.spec.ts    # save / read / clear (sessionStorage + memória)
│   ├── forms/
│   │   └── trimmed-email.validator.ts/.spec.ts # ← features/register/validators/…
│   ├── icons/app-icon-name.ts                  # + 'login'
│   └── routing/app-paths.ts                    # + login: 'login', dashboard: 'dashboard'
└── features/
    ├── landing/
    │   ├── landing-content.ts                  # + { 'login', 'login', AppPaths.login } após "registrar"
    │   └── landing-page.spec.ts                # + item "login"
    ├── register/                               # só imports atualizados (models/, services/, validators/, store, form)
    │   └── services/registration-error.mapper.ts  # passa a usar core/api/api-response-body
    └── login/                                  # NOVO
        ├── login-page.ts/.html/.scss/.spec.ts  # header ("início") + cartão; providers: [LoginStore]
        ├── login-content.ts                    # navegação, textos, limites, timeout
        ├── login-form/
        │   └── login-form.ts/.html/.scss/.spec.ts
        ├── models/
        │   ├── login-request.dto.ts            # { Email, Password }
        │   ├── login-response-data.dto.ts      # { accessToken, tokenType, expiresAt, clientId, accessCode, business }
        │   ├── login-input.ts                  # { email, password } (apresentação)
        │   ├── login-field.ts                  # 'email' | 'password'
        │   └── login-status.ts                 # 'idle' | 'submitting' | 'succeeded' | 'failed'
        ├── services/
        │   ├── login-input.mapper.ts/.spec.ts    # normaliza e converte para DTO
        │   ├── login-session.mapper.ts/.spec.ts  # resposta → AuthSession | null
        │   ├── login-error.mapper.ts/.spec.ts    # erro → texto legível
        │   └── login-field-message.ts/.spec.ts   # ValidationErrors → texto pt-BR
        └── state/
            └── login.store.ts/.spec.ts
```

**Structure Decision**: Nova feature isolada em `features/login/`, espelhando `features/register/`
(página + subcomponente, `models/`, `services/`, `state/`, `*-content.ts`). O que passa a ser usado
por duas features (cliente HTTP de auth, envelope, leitura do corpo de erro, validador de e-mail) é
promovido a `core/`, conforme previsto no plano 004. A sessão vai para `core/auth/` porque o dashboard
(e o futuro interceptor/guard) a consumirá. `SiteHeader` e `ComingSoonPage` reutilizados sem mudança.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| Token em `sessionStorage` (Princípio IV cita "locais inseguros", ex. `localStorage`) | FR-014/FR-015: sessão precisa sobreviver a navegação e recarga dentro da aba e morrer ao fechar a aba/navegador; `.mine/dash-board_page` pede "token guardado na sessão" | Só memória: recarregar `/dashboard` derrubaria o login a cada F5. `localStorage`: proibido (sobrevive ao fechamento). Cookie HttpOnly: exige mudança no backend (fora do escopo). Mitigações: expiração validada na leitura, nunca em URL/log/tela, sem `innerHTML` de conteúdo externo |
| Tratamento de erro HTTP no mapper/store e não em Interceptor | Mensagens são específicas do login (401/403 → texto do serviço; sucesso sem sessão → genérico) e voltam ao formulário | Interceptor global aplicaria regras de login a todo HTTP (ícones, chat, cadastro) — mesma decisão das features 003/004 |
| `effect` no `LoginForm` sincronizando status do store → `FormGroup` (disable/enable, limpar senha) | Reactive Forms não aceitam binding `[disabled]`; o fim do fluxo HTTP só o store conhece | Chamar `form.disable()` no `submit()` exigiria que o componente acompanhasse o HTTP (`subscribe()` no componente) |
| Rota `/dashboard` sem guard | Destino do redirecionamento precisa existir agora (spec, Assumptions); é só a página "em breve", sem dado autenticado | Criar o guard agora anteciparia regras da feature de dashboard (expiração, redirecionamento para `/login`) que ainda não foram especificadas |
