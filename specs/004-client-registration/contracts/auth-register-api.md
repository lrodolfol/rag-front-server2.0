# Contract: API de cadastro de cliente (serviço de autenticação)

**Feature**: [../spec.md](../spec.md) | Fonte: `.mine/register_page/plan.md` (responsável, 2026-11-22)

## Endpoint

| Ambiente | `environment.authApiUrl` (base) | URL final |
|----------|---------------------------------|-----------|
| development (UAT) | `http://localhost:5170/api/v1/auth` | `http://localhost:5170/api/v1/auth/register` |
| production | `/api/v1/auth` (placeholder — ainda não existe) | `/api/v1/auth/register` |

- **Method**: `POST`
- **Headers**: `Content-Type: application/json` (padrão do `HttpClient`); nenhum token.
- **Autenticação**: nenhuma (endpoint público).
- **Timeout no cliente**: 30 s → tratado como falha genérica.
- **CORS**: UAT precisa aceitar a origem `http://localhost:4200` (ver research R-08).

## Request — `RegisterRequestDto`

```json
{
  "Name": "Maria da Silva",
  "Email": "maria@example.com",
  "Password": "senhaSegura1"
}
```

| Campo | Origem | Regra no cliente |
|-------|--------|------------------|
| `Name` | campo "Seu nome" | `trim`; 1–100 |
| `Email` | campo "E-mail" | `trim` + minúsculas; formato válido; ≤ 254 |
| `Password` | campo "Senha" | exatamente como digitada; 8–64; letra + número |

Enviado no corpo (nunca em query string). Uma requisição por envio.

## Responses — envelope `ApiResponseDto<T>`

### 201 Created — sucesso

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail",
  "data": {
    "clientId": 2,
    "accessCode": "sE1CMP8iqfYV",
    "name": "Maria da Silva",
    "email": "maria@example.com",
    "createdAt": "2026-11-22T19:27:48.2031803+00:00"
  },
  "error": null
}
```

Tela: aviso verde com `message` (fallback "Cadastro realizado!"); formulário limpo. `data` ignorado.

### 409 Conflict — e-mail já cadastrado

```json
{
  "statusCode": 409,
  "success": false,
  "message": "Já existe uma conta cadastrada com este e-mail.",
  "data": null,
  "error": {
    "title": "Conflito",
    "status": 409,
    "detail": "Já existe uma conta cadastrada com este e-mail.",
    "instance": "/api/v1/auth/register",
    "correlationId": "14a5a141-061f-4d10-a0bf-3fb0ee60dc8d"
  }
}
```

Tela: erro no campo E-mail com `message` → `error.detail` → "Este e-mail já está cadastrado". Sem
aviso geral.

### 400 Bad Request — campos inválidos

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Um ou mais campos são inválidos.",
  "data": null,
  "error": {
    "title": "Um ou mais campos são inválidos.",
    "status": 400,
    "instance": "/api/v1/auth/register",
    "errors": { "password": ["Informe a senha."] },
    "correlationId": "72e74af4-de35-4248-9c8e-f3fca71ae9f1"
  }
}
```

Tela: aviso vermelho com `message`; cada chave de `error.errors` reconhecida (`name`, `email`,
`password`, sem diferenciar caixa) recebe a **primeira** mensagem no campo correspondente. Se
nenhuma chave for reconhecida, a primeira mensagem de `errors` substitui o aviso geral.

## Mapeamento completo de falhas (`mapRegistrationError`)

| Condição | Aviso geral (vermelho) | Erro em campo |
|----------|------------------------|---------------|
| `success: true` com status 2xx | — (sucesso) | — |
| 409 | — | E-mail: texto do serviço ou fallback |
| 400 com `error.errors` | `message` / `error.title` / genérico | por chave reconhecida |
| 400 sem `errors`, 422, 5xx, outros com `message` ou `error.detail` legível | esse texto | — |
| Sem corpo legível (HTML, vazio, não-JSON) | genérico | — |
| `status 0` (rede/CORS), `TimeoutError` (30 s), erro não-HTTP | genérico | — |

Texto genérico (FR-018): **"Não foi possível concluir o cadastro agora. Tente novamente em instantes."**

Nunca exibidos: `statusCode`, `error.status`, `error.title` "Conflito", `instance`, `correlationId`,
stack. Nada é escrito no console (FR-021).
