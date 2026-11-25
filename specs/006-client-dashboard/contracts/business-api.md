# Contract: Business API (consulta do negócio do cliente)

**Consumidor**: `BusinessApiService.getClientBusiness(clientId: number)` →
`Observable<ApiResponseDto<BusinessResponseDataDto>>`

## Requisição

```http
GET {API_BASE_URL}/{clientId}/business
Authorization: Bearer <accessToken>        ← incluído pelo authTokenInterceptor, nunca pelo serviço
```

- `API_BASE_URL`: dev `http://localhost:5170/api/v1`; prod `/api/v1` (placeholder).
- `clientId`: `AuthSession.clientId` (número). Nunca o token na URL/query.
- Sem corpo. Timeout aplicado no store: 30 s.

## Respostas

### 200 — negócio encontrado

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Negócio encontrado com sucesso.",
  "data": {
    "name": "Padaria Pão Quente",
    "description": "Padaria artesanal com pães de fermentação natural.",
    "email": "contato@paoquente.com.br",
    "telephone": "(11) 98765-4321",
    "address": "Rua das Flores, 123 - Centro, São Paulo - SP",
    "details": "Aberto de seg. a sáb., 6h às 20h.",
    "createdAt": "2026-11-01T14:32:10+00:00",
    "updatedAt": "2026-11-20T09:15:44+00:00"
  },
  "error": null
}
```

### Cliente sem negócio *(forma não informada pelo backend — ambas aceitas, research R-04)*

- `404` com envelope (`success: false`, `data: null`), **ou**
- `200` com `data: null`.

### 401 — token ausente/inválido/expirado

Tratado pelo interceptor (ver [access-control.md](./access-control.md)); nunca chega ao mapper.

## Mapeamento (`business-response.mapper.ts`)

| Entrada | `BusinessLoadResult` | `DashboardStatus` |
|---------|----------------------|-------------------|
| sucesso, `success !== false`, `data.name` texto não vazio | `found` (`name` com trim) | `loaded` |
| sucesso, `data === null` | `not-found` | `empty` |
| `HttpErrorResponse` 404 | `not-found` | `empty` |
| sucesso com `success: false`, `data` não-objeto ou sem `name` válido | `invalid` | `failed` |
| `HttpErrorResponse` status 0, 400, 403, 5xx; `TimeoutError`; qualquer outro | (erro) | `failed` |

Mensagem exibida em `failed`: sempre
"Não foi possível carregar seus dados agora. Tente novamente em instantes." — nunca `message`,
`title`, `status`, `instance` nem `correlationId` do serviço.

## Testes (`HttpTestingController`)

- método `GET`, URL exata com `clientId`, sem corpo; o serviço **não** adiciona `Authorization`.
- mapper: cada linha da tabela acima.
