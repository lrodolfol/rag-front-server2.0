# Data Model: Tela de Login de Clientes (/login)

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Tudo vive no navegador; o único dado que sobrevive à página é a `AuthSession` (em `sessionStorage`,
research R-03).

## Modelos de apresentação (`features/login/models/`)

### LoginField

`'email' | 'password'` — ordem dos campos na tela; define o foco no primeiro inválido.

### LoginInput

| Campo | Tipo | Regra |
|-------|------|-------|
| `email` | `string` | trim + minúsculas; formato usuário@domínio; ≤ 254 caracteres |
| `password` | `string` | sem alteração; obrigatório; ≤ 64 caracteres; **sem** regra de composição |

### Formulário (`LoginForm`)

| Controle | Validadores | Mensagem (prioridade) | `autocomplete` |
|----------|-------------|------------------------|----------------|
| `email` | `required`, `trimmedEmailValidator` (core), `maxLength(254)` | `required` → "Campo obrigatório"; `email` → "Informe um e-mail válido" | `email` |
| `password` | `required`, `maxLength(64)` | `required` → "Campo obrigatório" | `current-password` |

`maxlength` no `<input>` torna o erro `maxlength` inalcançável (sem mensagem), como no cadastro.

### LoginStatus

`'idle' | 'submitting' | 'succeeded' | 'failed'`

## Modelo compartilhado (`core/auth/auth-session.ts`)

### AuthSession

| Campo | Tipo | Origem | Regra |
|-------|------|--------|-------|
| `accessToken` | `string` | `data.accessToken` | não vazio; nunca exibido/logado |
| `tokenType` | `string` | `data.tokenType` | não vazio (ex.: `Bearer`) |
| `expiresAt` | `string` (ISO 8601) | `data.expiresAt` | `Date.parse` válido; sessão inválida quando `≤ Date.now()` na leitura |
| `clientId` | `number` | `data.clientId` | número finito |

Não guardados: `accessCode`, `business` (R-03).

## DTOs

### LoginRequestDto — enviado (`features/login/models/login-request.dto.ts`)

```ts
{ readonly Email: string; readonly Password: string }
```

### ApiResponseDto\<T\> — envelope (`core/api/api-response.dto.ts`, movido do cadastro, sem mudança)

`statusCode`, `success`, `message`, `data: T | null`, `error: ApiErrorDto | null`
(`title`, `status`, `detail?`, `instance`, `errors?`, `correlationId`).

### LoginResponseDataDto — `data` do 200 (`features/login/models/login-response-data.dto.ts`)

| Campo | Tipo |
|-------|------|
| `accessToken` | `string` |
| `tokenType` | `string` |
| `expiresAt` | `string` (ISO 8601) |
| `clientId` | `number` |
| `accessCode` | `string` |
| `business` | `unknown` (hoje `null`; formato não especificado) |

## Mapeamentos (`features/login/services/`)

| Função | Entrada → Saída | Regra |
|--------|-----------------|-------|
| `toLoginInput(raw)` | `{email, password}` bruto → `LoginInput` | trim + lower no e-mail; senha intacta |
| `toLoginRequestDto(input)` | `LoginInput` → `LoginRequestDto` | renomeia para PascalCase |
| `toAuthSession(response)` | `unknown` → `AuthSession \| null` | R-04 |
| `mapLoginError(error)` | `unknown` → `string` | R-05; nunca expõe status/título/instance/correlationId |
| `toLoginFieldErrorMessage(errors)` | `ValidationErrors \| null` → `string \| null` | tabela do formulário |

Helpers compartilhados (`core/api/api-response-body.ts`): `isRecord`, `isApiResponse`,
`parseApiResponseBody` (aceita objeto ou string JSON), `readableMessage` (string com conteúdo, com
trim).

## Estado (`LoginStore`, provido em `LoginPage`)

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `status` | `LoginStatus` | estado do envio |
| `errorMessage` | `string \| null` | texto do aviso vermelho |
| `isSubmitting` | `computed` | `status === 'submitting'` |

Métodos: `submit(input: LoginInput)`, `dismissError()`.

### Transições

| De | Evento | Para | Efeitos |
|----|--------|------|---------|
| `idle` / `failed` | `submit` | `submitting` | `errorMessage = null`; `POST /login` |
| `submitting` | `submit` | `submitting` | ignorado (duplo envio) |
| `submitting` | 2xx com sessão válida | `succeeded` | `AuthSessionService.save(session)`; `navigateByUrl('/dashboard')` |
| `submitting` | 2xx sem sessão válida / `success:false` | `failed` | `errorMessage = genérica`; nada salvo |
| `submitting` | erro HTTP / rede / timeout 30 s | `failed` | `errorMessage = mapLoginError(e)`; nada salvo |
| `failed` | `dismissError` | `failed` | `errorMessage = null` |
| qualquer | página destruída | — | requisição cancelada; nada salvo; sem console |

### Reações do formulário (effect no `LoginForm`)

| Status | Ação |
|--------|------|
| `submitting` | `form.disable()` (campos, toggle e botão bloqueados; spinner visível) |
| `failed` | `form.enable()`; `password.reset('')` |
| `succeeded` | mantém desabilitado até a navegação |

## Sessão (`AuthSessionService`, `core/auth/`, root)

| Método | Comportamento |
|--------|---------------|
| `save(session)` | memória ← session; `sessionStorage.setItem(KEY, JSON)` em `try/catch` |
| `read(): AuthSession \| null` | memória ou storage; JSON inválido/incompleto ou expirado → `clear()` e `null` |
| `clear()` | memória ← null; `removeItem(KEY)` em `try/catch` |

Detalhes em [contracts/auth-session.md](./contracts/auth-session.md).
