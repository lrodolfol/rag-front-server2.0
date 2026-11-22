# Contract: API de login (serviço de autenticação)

**Feature**: [../spec.md](../spec.md) | Fonte: `.mine/login_page/plan.md`

## Endpoint

| Ambiente | URL | Origem |
|----------|-----|--------|
| UAT (dev) | `http://localhost:5170/api/v1/auth/login` | `environment.development.ts` → `authApiUrl` + `/login` |
| Produção | `/api/v1/auth/login` (placeholder; ainda não existe) | `environment.ts` |

- Método: `POST`
- Headers: `Content-Type: application/json` (padrão do `HttpClient`); **sem** `Authorization`.
- Chamado somente por `AuthApiService.login(dto)` (`core/auth/auth-api.service.ts`).

## Requisição

```json
{ "Email": "maria@example.com", "Password": "NovaSenha123" }
```

- `Email`: trim + minúsculas. `Password`: exatamente como digitada.
- Senha nunca vai para query string, logs ou console.

## Respostas e tratamento

| Caso | Exemplo | Tratamento na UI |
|------|---------|------------------|
| 200 `success: true` com `data` completo | `data: { accessToken, tokenType: "Bearer", expiresAt: "2026-11-22T20:55:47+00:00", clientId: 1, accessCode, business: null }` | Salva `AuthSession`; vai para `/dashboard`; sem mensagem |
| 2xx sem `data` válido ou `success: false` | `data: null` / sem `accessToken` | Aviso genérico; nada salvo; fica em `/login` |
| 401 | `message: "E-mail ou senha inválidos."` | Aviso vermelho com `message` |
| 403 | `message: "O e-mail ainda não foi confirmado. …"` | Aviso vermelho com `message` |
| Outro status com texto (400, 429, 5xx…) | `message` ou `error.detail` | Aviso vermelho com o texto |
| Outro status sem texto legível / corpo não-JSON | — | Aviso genérico |
| Rede (status 0), CORS, timeout de 30 s | — | Aviso genérico |

Texto genérico: **"Não foi possível entrar agora. Tente novamente em instantes."**

Ordem de leitura do texto: `message` → `error.detail` → genérico. Nunca exibidos: `statusCode`,
`error.title`, `error.status`, `error.instance`, `error.correlationId`, `accessToken`.

## Testes de contrato (`auth-api.service.spec.ts`, `HttpTestingController`)

- `login()` faz exatamente um `POST` para `{AUTH_API_URL}/login` com o corpo acima.
- Propaga o envelope de sucesso e o `HttpErrorResponse` sem tratamento (tratamento é do store).
