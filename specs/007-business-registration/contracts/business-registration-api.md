# Contract: Business Registration API

**Consumidor**: `BusinessApiService` (`core/business/business-api.service.ts`)

- `getClientBusiness(clientId: number)` — já existente (feature 006,
  [business-api.md](../../006-client-dashboard/contracts/business-api.md)); reaproveitado para a
  verificação "cliente sem negócio".
- `registerBusiness(clientId: number, request: RegisterBusinessRequestDto)` →
  `Observable<ApiResponseDto<BusinessResponseDataDto>>` — **novo**.

## 1. Verificação (GET, reaproveitado)

```http
GET {API_BASE_URL}/{clientId}/business
Authorization: Bearer <accessToken>        ← authTokenInterceptor
```

| `BusinessLoadResult` (mapper existente) | Estado da página |
|-----------------------------------------|------------------|
| `not-found` (404 ou `200` + `data: null`) | `ready` (formulário) |
| `found` | navega a `/dashboard` (`replaceUrl`) — formulário nunca exibido |
| `invalid`, rede, timeout 30 s, 4xx ≠ 401/404, 5xx | `check-failed`: "Não foi possível carregar seus dados agora. Tente novamente em instantes." + "Tentar novamente" |
| 401 / sessão expirada | interceptor → `/login` |

## 2. Cadastro (POST, novo)

```http
POST {API_BASE_URL}/{clientId}/business
Authorization: Bearer <accessToken>        ← authTokenInterceptor, nunca o serviço
Content-Type: application/json
```

- `API_BASE_URL`: dev `http://localhost:5170/api/v1`; prod `/api/v1` (placeholder — "ainda não há
  endereço de produção").
- `clientId`: `AuthSession.clientId`. Token nunca na URL/query/corpo.
- Timeout aplicado no store: 30 s.

### Corpo (`RegisterBusinessRequestDto`)

```json
{
  "name": "pet_amigo",
  "descricao": "pet shop e cuidados para animais",
  "email": "atendimento@petamigo.com.br",
  "address": "avenida das acacias - 310",
  "telephone": "35995678901",
  "detalhes": "O Pet Amigo oferece banho e tosa, produtos para cães e gatos, ..."
}
```

- Todos os textos com `trim`.
- Opcionais vazios (`descricao`, `email`, `telephone`) → `null`.
- `telephone` somente com dígitos (10 ou 11, sem parênteses, espaços ou hífen); a máscara é apenas
  de exibição no frontend (research R-06).
- Chaves `descricao` e `detalhes` (não `description`/`details`) — conforme payload do usuário (feature 008).

### Respostas → resultado (`mapBusinessRegistrationError` + store)

| Resposta | Resultado | UI |
|----------|-----------|----|
| 2xx, corpo com `success !== false` (qualquer `data`) | sucesso | `/dashboard` (`replaceUrl`) + snackbar `success` "Negócio cadastrado com sucesso." (ação "Fechar") |
| 2xx com `success: false` | `generic` | mensagem genérica, dados preservados |
| 409 | `already-registered` | snackbar `warning` "Você já possui um negócio cadastrado." + `/dashboard` (`replaceUrl`) |
| 400, 422 | `invalid-data` | "Verifique os dados informados e tente novamente." — sem destacar campos, mesmo com `error.errors` |
| 401 | interceptor | sessão descartada + `/login` |
| status 0, `TimeoutError`, 403, 404, 5xx, outro | `generic` | "Não foi possível cadastrar seu negócio agora. Tente novamente em instantes." |

Nunca exibidos: `message`, `error.title`, `error.detail`, `error.errors`, `status`, `instance`,
`correlationId`.

### Confirmado com o backend (2026-11-25, research R-02/R-03/R-06)

1. Chave `detalhes` no `POST` (o `GET` devolve `details`).
2. Opcionais vazios enviados como `null`.
3. `telephone` só com dígitos.
4. 409 para "já possui negócio"; 400/422 para validação.
5. CORS: preflight com `Authorization` e `Content-Type: application/json` liberado.

## Testes (`HttpTestingController`)

- `registerBusiness`: método `POST`, URL exata com `clientId`, corpo igual ao DTO; o serviço **não**
  adiciona `Authorization`.
- `toRegisterBusinessRequestDto`: `trim`, `null` em opcionais vazios, `description` → `descricao`,
  `details` → `detalhes`,
  telefone só com dígitos (ex.: `(35) 99567-8901` → `35995678901`).
- `mapBusinessRegistrationError`: cada linha da tabela acima.
