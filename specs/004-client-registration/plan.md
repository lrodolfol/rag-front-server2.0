# Implementation Plan: Tela de Cadastro de Clientes (/register)

**Branch**: `feat/register-page` (feature dir `004-client-registration`) | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-client-registration/spec.md` + decisões técnicas de
`.mine/register_page/plan.md` + desenho `.mine/register_page/register-page.excalidraw`

## Summary

Adicionar o item "registrar" ao cabeçalho da landing e criar a página `/register`, onde o visitante
informa nome, e-mail e senha. O formulário (Reactive Forms + Angular Material) valida no cliente
(obrigatórios, formato de e-mail, senha ≥ 8 com letra e número), normaliza (trim, e-mail em
minúsculas) e envia `POST {Name, Email, Password}` ao serviço de autenticação (UAT
`http://localhost:5170/api/v1/auth/register`). Durante o envio, todos os campos e o botão ficam
bloqueados e um spinner aparece ao lado do botão. Sucesso: a mensagem devolvida pelo serviço aparece
num aviso verde discreto, o formulário é limpo e o visitante continua na página. Erro: 409 vai para o
campo e-mail; 400 distribui `error.errors` pelos campos e mostra `message` num aviso vermelho
discreto; falha de rede/timeout de 30 s/erro sem texto mostra a mensagem genérica. Nada é escrito no
console.

Abordagem: `AuthApiService` (único ponto HTTP) + mappers puros (entrada → DTO; erro HTTP →
`RegistrationFailure`) + `RegistrationStore` com Signals provido na página (estado morre com ela).
O componente do formulário só apresenta e reage ao estado do store. **Nenhuma dependência nova.**

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, Reactive Forms, `HttpClient` +
`withFetch`), Angular Material/CDK 22.2 (`MatFormField`, `MatInput`, `MatError`, `MatHint`,
`MatIconButton` com `matSuffix`, `MatButton`, `MatIcon`, `MatProgressSpinner`), RxJS 7.8
(`timeout`, `catchError`, `finalize`, `takeUntilDestroyed`). **Nenhuma dependência nova.**

**Storage**: N/A — dados só em memória (FormGroup + Signals); nada em `localStorage`/`sessionStorage`
(FR-020)

**Testing**: Vitest + jsdom via `ng test`; `HttpTestingController` para `AuthApiService` e testes de
integração da página; `vi.useFakeTimers` para o timeout de 30 s; `RouterTestingHarness` para rotas;
`npm run lint:colors` e `npm run lint:contrast`

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (320–1920 px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: rota `/register` lazy (`loadComponent`) para não pesar na landing; feedback
visual do envio (spinner/bloqueio) no mesmo frame do clique

**Constraints**: zero saída no console (FR-021); textos pt-BR; cores só via tokens; orçamento de
estilo por componente 4 kB warn / 8 kB error; WCAG 2.1 AA (rótulos, `role="alert"`/`role="status"`,
foco no primeiro campo inválido); backend UAT precisa aceitar CORS de `http://localhost:4200` (ver
research R-08); timeout de 30 s (FR-018)

**Scale/Scope**: 1 rota, 2 componentes (página + formulário), 1 serviço HTTP, 2 mappers, 3
validadores, 1 store, 1 token de injeção, 3 ícones novos, 0 tokens de cor novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, OnPush, Signals (`signal`, `computed`) no store, RxJS no fluxo HTTP. Sem `any`: corpo de erro lido como `unknown` e estreitado por type guards. Componentes não chamam `subscribe()`: o store assina com `takeUntilDestroyed`. |
| II. Responsabilidade única / por feature | PASS | `features/register/` com página, `register-form/`, `services/`, `validators/`, `state/`, `models/` e `register-content.ts` (textos). Regras (normalização, mapeamento de erros, bloqueio de duplo envio, timeout) fora dos componentes. Nomes em inglês. |
| III. HTTP tipado | PASS | Só `AuthApiService` faz HTTP. DTOs `RegisterRequestDto` (PascalCase, contrato) e `ApiResponseDto<RegisterResponseDataDto>` separados do modelo `RegistrationInput`; `registration-input.mapper` e `registration-error.mapper` fazem as conversões. Sem interceptor: o tratamento é específico deste endpoint (ver Complexity Tracking). |
| IV. Segurança | PASS | Rota pública (sem guard — spec: acesso público). Senha só no `FormControl` em memória; nunca em URL, storage, mensagens ou console; campo limpo no sucesso. URL da API em arquivo de ambiente (não é segredo). Textos do serviço renderizados só por interpolação. Sem acesso direto ao DOM: foco via API pública `MatInput.focus()`. `correlationId` nunca exibido. |
| V. UX e identidade visual | PASS | Textos pt-BR; 100% Material; tokens existentes `--app-color-success-*`/`--app-color-error-*`; estados `idle`/`submitting`/`succeeded`/`failed` tratados; Reactive Forms com mensagens amigáveis; responsivo (cartão `max-width` + 100% em telas pequenas). |
| VI. Testes | PASS | Specs: validadores, mappers, serviço (`HttpTestingController`), store (todas as transições + timeout + cancelamento), formulário (validação, toggle de senha, bloqueio, foco), página, header da landing e rotas. Fluxo crítico coberto por teste de integração da página com `HttpTestingController`. E2E fora do escopo (sem ferramenta definida). |
| VII. Dependências mínimas | PASS | Zero dependências novas. Envelope `ApiResponseDto` fica em `features/register/models/` (único uso real hoje; promover a `core/` quando o login existir). Reuso de `SiteHeader`, `NavigationItem`, `AppPaths`, padrão de token de URL e de ambientes da feature 003. |
| SDD | PASS | Spec aprovada e atualizada com as decisões da etapa de plano (Clarifications, sessão 2). Fora do escopo respeitado: sem modo escuro, planos, login, recuperação de senha. |

**Re-check pós-design (Phase 1)**: PASS — contratos e data model não introduzem dependências nem
cores fora de tokens. Riscos: (a) CORS no backend UAT — mitigação: proxy do dev server documentado
(R-08/quickstart); (b) nome das chaves em `error.errors` pode variar em caixa (`password` vs
`Password`) — mapper compara sem diferenciar maiúsculas (R-04); (c) `provideBrowserGlobalErrorListeners`
escreveria erros não tratados no console — todo erro do fluxo é capturado no store (R-07).

## Project Structure

### Documentation (this feature)

```text
specs/004-client-registration/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── auth-register-api.md   # contrato HTTP do cadastro + mapeamento de erros
│   ├── register-ui.md         # contrato de UI: textos, estados, acessibilidade
│   └── routes.md              # rotas e navegação
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
public/icons/
├── person_add.svg                              # NOVO — item "registrar" e ícone do cartão
├── visibility.svg                              # NOVO — mostrar senha
└── visibility_off.svg                          # NOVO — ocultar senha
src/
├── environments/
│   ├── environment.ts                          # + authApiUrl (placeholder de produção)
│   └── environment.development.ts              # + authApiUrl UAT http://localhost:5170/api/v1/auth
└── app/
    ├── app.config.ts                           # + { provide: AUTH_API_URL, useValue: environment.authApiUrl }
    ├── app.routes.ts                           # + register → loadComponent RegisterPage
    ├── app.routes.spec.ts                      # + expectativas da rota /register
    ├── core/
    │   ├── config/auth-api-url.token.ts        # NOVO — InjectionToken<string>
    │   ├── icons/app-icon-name.ts              # + 'person_add', 'visibility', 'visibility_off'
    │   └── routing/app-paths.ts                # + register: 'register'
    └── features/
        ├── landing/
        │   ├── landing-content.ts              # + { 'registrar', 'person_add', AppPaths.register } após "testar chatbot"
        │   └── landing-page.spec.ts            # + item "registrar" no cabeçalho
        └── register/
            ├── register-page.ts/.html/.scss/.spec.ts      # header ("início") + cartão; providers: [RegistrationStore]
            ├── register-content.ts                        # navegação, textos, limites, timeout
            ├── register-form/
            │   └── register-form.ts/.html/.scss/.spec.ts  # campos, toggle de senha, botão + spinner, avisos
            ├── models/
            │   ├── register-request.dto.ts                # { Name, Email, Password }
            │   ├── register-response-data.dto.ts          # { clientId, accessCode, name, email, createdAt }
            │   ├── api-response.dto.ts                    # envelope + ApiErrorDto
            │   ├── registration-input.ts                  # { name, email, password } (apresentação)
            │   ├── registration-field.ts                  # 'name' | 'email' | 'password'
            │   ├── registration-failure.ts                # { kind, message, fieldErrors }
            │   └── registration-status.ts                 # 'idle' | 'submitting' | 'succeeded' | 'failed'
            ├── services/
            │   ├── auth-api.service.ts/.spec.ts           # register(dto) → Observable<ApiResponseDto<…>>
            │   ├── registration-input.mapper.ts/.spec.ts  # normaliza e converte para DTO
            │   └── registration-error.mapper.ts/.spec.ts  # HttpErrorResponse/timeout → RegistrationFailure
            ├── validators/
            │   ├── not-blank.validator.ts/.spec.ts
            │   ├── trimmed-email.validator.ts/.spec.ts
            │   └── password-strength.validator.ts/.spec.ts
            └── state/
                └── registration.store.ts/.spec.ts
```

**Structure Decision**: Nova feature isolada em `features/register/`, seguindo exatamente o padrão da
feature 003 (`chatbot`): página + subcomponente, `models/`, `services/`, `state/`, textos em
`*-content.ts`, URL por `InjectionToken` alimentado pelo `environment`. `validators/` entra porque há
regras de formulário reutilizáveis e testáveis isoladamente. O `SiteHeader` de `core/layout/` é
reutilizado sem mudanças. O envelope `ApiResponseDto` não vai para `core/` ainda (YAGNI).

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| Tratamento de erro HTTP no store/mapper e não em Interceptor | 409 → campo e-mail e 400 → erros por campo são regras deste endpoint e precisam voltar ao formulário | Interceptor global aplicaria regras de cadastro a todo HTTP (ícones, chat) e precisaria de canal extra para devolver erros por campo ao formulário (mesma decisão da feature 003) |
| `effect` no `RegisterForm` sincronizando estado do store → `FormGroup` (disable/enable, erros do servidor, reset, foco) | Reactive Forms não aceitam binding `[disabled]`; o estado vem do store (Signals) | `form.disable()` chamado direto no `submit()` deixaria o componente responsável pelo fim do fluxo HTTP (que só o store conhece) e exigiria `subscribe()` no componente |
