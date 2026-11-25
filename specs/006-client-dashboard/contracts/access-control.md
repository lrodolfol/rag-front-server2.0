# Contract: Controle de acesso (core/auth)

Depende de `AuthSessionService` (feature 005, [contrato](../../005-client-login/contracts/auth-session.md)):
`read()` devolve sessão completa e não expirada ou `null` (descartando a inválida); `clear()` descarta.

## `authGuard: CanActivateFn` — `core/auth/auth.guard.ts`

| Situação | Retorno | Efeito |
|----------|---------|--------|
| `read()` → sessão | `true` | — |
| `read()` → `null` (ausente, corrompida, expirada) | `UrlTree('/login')` | sessão já descartada por `read()` |

- Síncrono; nenhum HTTP; nada no console.
- Rotas: `dashboard`, `editar-negocio`, `excluir-negocio`.
- Testes: os 4 casos da User Story 1 (sem sessão, expirada, malformada, válida) via
  `RouterTestingHarness`, incluindo navegação "voltar" após "Sair".

## `authTokenInterceptor: HttpInterceptorFn` — `core/auth/auth-token.interceptor.ts`

Escopo: `url.startsWith(API_BASE_URL + '/') && !url.startsWith(AUTH_API_URL + '/')` (o `/` evita
casar prefixos parciais, ex.: `/api/v10`). Fora do escopo → repassa sem tocar (chat, ícones, login,
cadastro).

| Situação (no escopo) | Comportamento |
|----------------------|---------------|
| `read()` → `null` | `AuthRedirectService.redirectToLogin()`; devolve `EMPTY` (requisição não enviada) |
| sessão válida | envia clone com `Authorization: <tokenType> <accessToken>` |
| resposta `401` | `redirectToLogin()`; devolve `EMPTY` |
| outros erros | repassados sem alteração |

- Nunca escreve token/erro no console; nunca altera URL/query.
- Testes: escopo (chat e `/auth/login` não recebem cabeçalho e 401 deles não redireciona),
  cabeçalho correto, sessão expirada, 401.

## `AuthRedirectService` — `core/auth/auth-redirect.service.ts` (`providedIn: 'root'`)

| Método | Efeito |
|--------|--------|
| `redirectToLogin(): void` | `session.clear()`; `router.navigateByUrl('/login')` |
| `signOut(): void` | `session.clear()`; `router.navigateByUrl('/', { replaceUrl: true })` |

Promessas de navegação com `.catch(() => undefined)`.
