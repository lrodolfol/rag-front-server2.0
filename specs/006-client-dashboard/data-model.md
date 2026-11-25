# Data Model: Área do Cliente (/dashboard)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## AuthSession *(existente — `core/auth/auth-session.ts`, feature 005)*

| Campo | Tipo | Uso nesta feature |
|-------|------|-------------------|
| `accessToken` | `string` | Valor do cabeçalho `Authorization` (interceptor). Nunca exibido/logado. |
| `tokenType` | `string` | Prefixo do cabeçalho (`Bearer`). |
| `expiresAt` | `string` ISO 8601 | Guard e interceptor: `read()` devolve `null` se ≤ agora. |
| `clientId` | `number` | Segmento da URL `/{clientId}/business`. |

Sem mudanças no modelo nem no `AuthSessionService`.

## BusinessResponseDataDto *(novo — `features/dashboard/models/business-response-data.dto.ts`)*

Contrato da API, lido dentro de `ApiResponseDto<BusinessResponseDataDto>` (`core/api/`).

| Campo | Tipo | Observação |
|-------|------|------------|
| `name` | `string` | Obrigatório para considerar a resposta válida. |
| `description` | `string` | Não exibido nesta feature. |
| `email` | `string` | Não exibido. |
| `telephone` | `string` | Não exibido. |
| `address` | `string` | Não exibido. |
| `details` | `string` | Não exibido. |
| `createdAt` | `string` ISO 8601 | Não exibido. |
| `updatedAt` | `string` ISO 8601 | Não exibido. |

O DTO é tipado completo (documenta o contrato); o mapper só valida e lê o que o modelo usa.

## Business *(novo — modelo de apresentação, `features/dashboard/models/business.ts`)*

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `string` | `trim()` aplicado; não vazio. |

Sem imagem (R-05): o cartão sempre usa o ícone padrão. Relação com o cliente: **1:1** — cada
cliente tem 0 ou 1 `Business`.

## BusinessLoadResult *(novo — `features/dashboard/models/business-load-result.ts`)*

União discriminada produzida pelo mapper (R-04):

```text
{ kind: 'found', business: Business }
{ kind: 'not-found' }
{ kind: 'invalid' }
```

## DashboardStatus *(novo — `features/dashboard/models/dashboard-status.ts`)*

`'loading' | 'loaded' | 'empty' | 'failed'`

### Transições (`DashboardStore`)

```text
          (abrir página / load())
                   │
                   ▼
              ┌─────────┐   found        ┌────────┐
              │ loading │ ─────────────▶ │ loaded │  business = Business
              └─────────┘                └────────┘
               │   │   not-found (404 ou data null)
               │   └──────────────────▶ ┌───────┐
               │                        │ empty │  business = null
               │                        └───────┘
               │ invalid / rede / timeout 30 s / 4xx≠401,404 / 5xx
               ▼
          ┌────────┐  "Tentar novamente" → load()
          │ failed │ ─────────────────────────────▶ loading
          └────────┘

   401 ou sessão expirada em qualquer momento → interceptor: descarta sessão, navega a /login
   (a página é destruída; a requisição pendente é cancelada por takeUntilDestroyed)
```

Regras:
- `load()` com `status === 'loading'` e requisição em curso → ignorado (exceto a primeira chamada).
- `load()` sem sessão válida (`AuthSessionService.read()` → `null`, ex.: sessão expirou com a página
  aberta e o cliente acionou "Tentar novamente") → `AuthRedirectService.redirectToLogin()`; nenhuma
  requisição é feita e o status não muda (a página é destruída pela navegação).
- Entrar em `loading` limpa `business`.
- Nenhuma transição escreve no console.

## Conteúdo estático *(`features/dashboard/dashboard-content.ts`)*

Itens de navegação, textos pt-BR (ver [contracts/dashboard-ui.md](./contracts/dashboard-ui.md)),
`DASHBOARD_TIMEOUT_MS = 30_000`, título da aba.
