# Implementation Plan: Área do Cliente (/dashboard)

**Branch**: `feat/dashboard-page` (a criar; feature dir `006-client-dashboard`; branch atual `feat/register-page`) | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-client-dashboard/spec.md` + decisões técnicas de
`.mine/dash-board_page/plan.md` + esboços `.mine/dash-board_page/dash.excalidraw` (sem negócio) e
`.mine/dash-board_page/dash02.excalidraw` (com negócio)

## Summary

Trocar o placeholder de `/dashboard` pela área do cliente "Meus negócios", protegida por um
`authGuard` funcional que só libera a rota quando `AuthSessionService.read()` devolve uma sessão
completa e não expirada (caso contrário a sessão já é descartada e o guard devolve `UrlTree` para
`/login`). Ao abrir, o `DashboardStore` (Signals, provido na página) pede
`GET {API_BASE_URL}/{clientId}/business` (UAT `http://localhost:5170/api/v1/{clientId}/business`)
pelo `BusinessApiService`; o cabeçalho `Authorization: Bearer <token>` é incluído por um
`authTokenInterceptor`, que também trata 401/sessão expirada (descarta a sessão e leva a `/login`).
A resposta vira um de quatro estados: `loading` → `loaded` (cartão do negócio, `dash02`), `empty`
(estado vazio + "Novo negócio", `dash`; 404 ou `data: null`), `failed` (mensagem fixa + "Tentar
novamente"; rede, timeout de 30 s, 5xx, dados inválidos). Cabeçalho reaproveita `SiteHeader` com os
itens "Testar Chatbot", "Meus negócios" e um botão "Sair" projetado; abaixo do conteúdo, o cartão
"Veja como aparece no chatbot". "Cadastrar agora"/"Novo negócio" levam a `cadastrar-negocio`
(placeholder existente); "Editar"/"Excluir" levam a dois novos placeholders protegidos. **Nenhuma
dependência nova.**

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, `HttpClient` + `withFetch` +
`withInterceptors`, `Router` com `CanActivateFn`), Angular Material/CDK 22.2 (`MatButton`,
`MatIconButton`, `MatIcon`, `MatCard`, `MatProgressSpinner`), RxJS 7.8 (`timeout`, `catchError`,
`takeUntilDestroyed`). **Nenhuma dependência nova.**

**Storage**: nenhum armazenamento novo. Sessão continua em `sessionStorage` via
`AuthSessionService` (feature 005); dados do negócio só em memória (signal do store), refeitos a
cada abertura (FR-009).

**Testing**: Vitest + jsdom via `ng test`; `HttpTestingController` para `BusinessApiService`,
interceptor e integração da página; `vi.useFakeTimers` para o timeout de 30 s;
`RouterTestingHarness` para guard, rotas e "Sair"; `npm run lint:colors` e `npm run lint:contrast`

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (320–1920 px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: rota `/dashboard` lazy (`loadComponent`); estado correto exibido em ≤ 3 s em
rede normal (SC-002); guard síncrono (sem ida à rede antes de decidir)

**Constraints**: zero saída no console (FR-020); textos pt-BR; cores só via tokens existentes;
orçamento de estilo por componente 4 kB warn / 8 kB error; WCAG 2.1 AA; token nunca em URL, tela,
log ou `localStorage` (FR-018); backend UAT precisa aceitar CORS de `http://localhost:4200` com
cabeçalho `Authorization` (preflight); timeout 30 s (FR-014)

**Scale/Scope**: 3 rotas (1 trocada, 2 novas), 1 página + 3 subcomponentes, 1 serviço HTTP, 1
mapper, 1 store, 1 guard, 1 interceptor, 1 serviço de redirecionamento de auth, 1 token de config
novo, 6 ícones novos, 0 tokens de cor novos; 1 ajuste em `SiteHeader` (`<ng-content />`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, OnPush, Signals no store, guard e interceptor funcionais, RxJS no fluxo HTTP. Sem `any`: resposta lida como `unknown` e estreitada (`isRecord`, `readableMessage`). Componentes não chamam `subscribe()` (o store assina com `takeUntilDestroyed`). |
| II. Responsabilidade única / por feature | PASS | `features/dashboard/` com página, `business-card/`, `business-empty-state/`, `chatbot-preview-card/`, `models/`, `services/`, `state/`, `dashboard-content.ts`. Controle de acesso (guard, interceptor, redirecionamento) em `core/auth/`. Decisão de estado (404 → vazio etc.) no mapper/store, não no template. Nomes em inglês. |
| III. HTTP tipado | PASS | Só `BusinessApiService` faz HTTP. `ApiResponseDto<BusinessResponseDataDto>` separado do modelo `Business`; `business-response.mapper` converte e valida. **Autenticação via Interceptor** (`authTokenInterceptor`), como exige o princípio. |
| IV. Segurança (NÃO NEGOCIÁVEL) | PASS | `/dashboard`, `editar-negocio` e `excluir-negocio` protegidos por `authGuard` (expiração verificada). Token só no cabeçalho `Authorization`, só para URLs do `API_BASE_URL` fora do serviço de auth (nunca para o chat). 401 → sessão descartada. "Sair" descarta a sessão e usa `replaceUrl`. Nome do negócio por interpolação. Sem acesso direto ao DOM. |
| V. UX e identidade visual | PASS | Textos pt-BR; 100% Material; estados carregando/sucesso/erro/vazio (exigência explícita do princípio); tokens existentes (`--app-color-primary`, `--app-color-accent`, `--app-color-error-text`…); layout dos esboços; responsivo. |
| VI. Testes | PASS | Specs: `authGuard`, `authTokenInterceptor`, `AuthRedirectService`, `BusinessApiService` (`HttpTestingController`), mapper, `DashboardStore` (transições, 404, timeout, retry, cancelamento), 3 subcomponentes, `DashboardPage` (integração), `SiteHeader` (projeção), rotas. Fluxo crítico login → dashboard → sair coberto por integração com `RouterTestingHarness`. |
| VII. Dependências mínimas | PASS | Zero dependências novas. `AuthRedirectService` só porque guard, interceptor e página precisam do mesmo "descartar + navegar" (3 usos reais). `SiteHeader` ganha só `<ng-content />` em vez de um cabeçalho novo. Reuso de `AuthSessionService`, `ApiResponseDto`, `api-response-body`, `ComingSoonPage`, `AppPaths`, `NavigationItem`. |
| SDD | PASS | Spec com clarificações registradas; fora do escopo respeitado (CRUD real do negócio, modo escuro, planos, múltiplos negócios). Contrato do endpoint vem de `.mine/dash-board_page/plan.md`; resposta "sem negócio" não especificada → decisão técnica documentada (R-04) e marcada como risco a confirmar com o backend. |

**Re-check pós-design (Phase 1)**: PASS — contratos e data model não introduzem dependências, cores
fora de tokens nem armazenamento novo. Riscos: (a) formato da resposta "cliente sem negócio" não
documentado pelo backend — tratamos 404 **e** `200` com `data: null` como vazio (R-04); confirmar
antes de `/speckit-implement`; (b) a API não devolve imagem — cartão sempre mostra o ícone padrão
(R-05); (c) CORS com `Authorization` exige preflight liberado no UAT (R-09); (d) `clientId` vem da
sessão do login — se o backend esperar outro identificador, só o `BusinessApiService` muda.

## Project Structure

### Documentation (this feature)

```text
specs/006-client-dashboard/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── business-api.md        # GET /{clientId}/business + mapeamento de respostas → estados
│   ├── access-control.md      # authGuard, authTokenInterceptor, AuthRedirectService
│   ├── dashboard-ui.md        # textos, estados, acessibilidade, responsividade
│   └── routes.md              # rotas, títulos e navegação
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
public/icons/
├── add.svg  edit.svg  delete.svg  image.svg  logout.svg  grid_view.svg   # NOVOS (Material Symbols)
src/environments/
├── environment.ts                              # + apiBaseUrl: '/api/v1'
└── environment.development.ts                  # + apiBaseUrl: 'http://localhost:5170/api/v1'
src/app/
├── app.config.ts                               # + withInterceptors([authTokenInterceptor]); + API_BASE_URL
├── app.routes.ts                               # dashboard → DashboardPage + authGuard; + editar/excluir-negocio
├── app.routes.spec.ts                          # + guard, novas rotas
├── core/
│   ├── auth/
│   │   ├── auth.guard.ts/.spec.ts              # NOVO — CanActivateFn
│   │   ├── auth-token.interceptor.ts/.spec.ts  # NOVO — Bearer + 401/expirada → /login
│   │   └── auth-redirect.service.ts/.spec.ts   # NOVO — redirectToLogin() / signOut()
│   ├── config/api-base-url.token.ts            # NOVO
│   ├── icons/app-icon-name.ts                  # + add, edit, delete, image, logout, grid_view
│   ├── layout/site-header/site-header.html     # + <ng-content /> após os itens (+ spec)
│   └── routing/app-paths.ts                    # + editBusiness: 'editar-negocio', deleteBusiness: 'excluir-negocio'
└── features/
    └── dashboard/                              # NOVO
        ├── dashboard-page.ts/.html/.scss/.spec.ts   # header + título + switch de estado + cartão do chatbot; providers: [DashboardStore]
        ├── dashboard-content.ts                # navegação, textos, timeout
        ├── business-card/
        │   └── business-card.ts/.html/.scss/.spec.ts          # input: business; ações Editar/Excluir
        ├── business-empty-state/
        │   └── business-empty-state.ts/.html/.scss/.spec.ts   # "Nenhum negócio ainda" + "Cadastrar agora"
        ├── chatbot-preview-card/
        │   └── chatbot-preview-card.ts/.html/.scss/.spec.ts   # "Veja como aparece no chatbot" + "Abrir o chat"
        ├── models/
        │   ├── business-response-data.dto.ts   # { name, description, email, telephone, address, details, createdAt, updatedAt }
        │   ├── business.ts                     # modelo de apresentação { name }
        │   ├── business-load-result.ts         # union: found | not-found | invalid
        │   └── dashboard-status.ts             # 'loading' | 'loaded' | 'empty' | 'failed'
        ├── services/
        │   ├── business-api.service.ts/.spec.ts      # único ponto HTTP da feature
        │   └── business-response.mapper.ts/.spec.ts  # resposta/erro → BusinessLoadResult
        └── state/
            └── dashboard.store.ts/.spec.ts
```

**Structure Decision**: Nova feature isolada em `features/dashboard/`, espelhando `features/login/`
(página + subcomponentes, `models/`, `services/`, `state/`, `*-content.ts`). Tudo que é controle de
acesso e será reutilizado por qualquer área autenticada futura (guard, interceptor, redirecionamento)
vai para `core/auth/`, ao lado do `AuthSessionService`. `BusinessApiService` fica na feature: só o
dashboard o consome hoje (YAGNI; promover quando o CRUD do negócio existir). `SiteHeader` e
`ComingSoonPage` reutilizados.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| `SiteHeader` ganha `<ng-content />` | "Sair" é uma ação (descartar sessão), não um link de rota como os demais `NavigationItem` | Cabeçalho próprio do dashboard duplicaria marca/estilos; rota `/sair` com guard de efeito colateral esconde a ação numa navegação e quebra o modelo de guard "só decide" |
| Interceptor com regra de 401 → `/login` | FR-004 + Princípio III (erro transversal via interceptor) | Tratar no store deixaria cada futura tela autenticada repetindo a regra; o escopo é restrito às URLs do `API_BASE_URL` fora do auth, então o 401 de credencial errada do login **não** dispara redirecionamento |
| Duas formas de "sem negócio" (404 e `data: null`) | Contrato do backend para cliente sem negócio não foi informado (R-04) | Escolher só uma arriscaria exibir erro a todo cliente novo; cobrir ambas custa um ramo no mapper e é removível quando o backend confirmar |
