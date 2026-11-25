# Data Model: Tela de Cadastro de Clientes (/register)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Tudo vive em memória enquanto a página está aberta; nada é persistido no navegador (FR-020).
Contrato HTTP completo em [contracts/auth-register-api.md](./contracts/auth-register-api.md).

## Modelos de apresentação (`features/register/models/`)

### RegistrationField

`'name' | 'email' | 'password'` — chaves dos controles do formulário; usadas para direcionar erros
do servidor.

### RegistrationInput

Valor já normalizado, pronto para virar DTO.

| Campo | Tipo | Regras (aplicadas antes de existir) |
|-------|------|-------------------------------------|
| `name` | `string` | `trim`; 1–100 caracteres; não pode ser só espaços (FR-012) |
| `email` | `string` | `trim` + minúsculas; formato `usuário@domínio`; ≤ 254 (FR-008, FR-012) |
| `password` | `string` | sem alteração; 8–64 caracteres; ≥ 1 letra e ≥ 1 número (FR-007) |

### Formulário (`RegisterForm`)

`FormGroup<{ name: FormControl<string>; email: FormControl<string>; password: FormControl<string> }>`
(non-nullable, valores iniciais `''`).

| Controle | Validadores | Chaves de erro → mensagem (ver [register-ui.md](./contracts/register-ui.md)) |
|----------|-------------|-------------------------------------------------------------------------------|
| `name` | `required`, `notBlank`, `maxLength(100)` | `required`/`blank` → "Campo obrigatório"; `server` → texto do serviço |
| `email` | `required`, `trimmedEmail`, `maxLength(254)` | `required` → "Campo obrigatório"; `email` → "Informe um e-mail válido"; `server` |
| `password` | `required`, `passwordStrength`, `maxLength(64)` | `required`; `minLength`; `missingLetter`; `missingNumber`; `server` |

Prioridade de exibição: `server` > `required`/`blank` > demais (uma mensagem por vez).

### RegistrationStatus

`'idle' | 'submitting' | 'succeeded' | 'failed'`

### RegistrationFailure

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `kind` | `'email-taken' \| 'invalid-fields' \| 'server-message' \| 'generic'` | origem do erro (R-04) |
| `message` | `string \| null` | texto do aviso geral (vermelho); `null` no `email-taken` |
| `fieldErrors` | `Partial<Record<RegistrationField, string>>` | mensagens por campo (vazio quando não há) |

Sempre em linguagem natural: sem status HTTP, `correlationId`, `instance` ou stack (FR-017).

## DTOs (`features/register/models/`)

### RegisterRequestDto — enviado

```ts
interface RegisterRequestDto {
  readonly Name: string;     // PascalCase: contrato do serviço
  readonly Email: string;
  readonly Password: string;
}
```

### ApiResponseDto\<T\> — envelope recebido

```ts
interface ApiResponseDto<T> {
  readonly statusCode: number;
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly error: ApiErrorDto | null;
}

interface ApiErrorDto {
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
  readonly correlationId: string;
}
```

### RegisterResponseDataDto — `data` no sucesso

```ts
interface RegisterResponseDataDto {
  readonly clientId: number;
  readonly accessCode: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: string; // ISO 8601
}
```

Tipado por completude do contrato; **não** é guardado nem exibido (a tela usa apenas `message`).

## Mapeamentos

| Função | Entrada → Saída | Arquivo |
|--------|-----------------|---------|
| `toRegistrationInput(raw)` | valor bruto do form → `RegistrationInput` (trim, lowercase) | `services/registration-input.mapper.ts` |
| `toRegisterRequestDto(input)` | `RegistrationInput` → `RegisterRequestDto` | idem |
| `mapRegistrationError(error: unknown)` | `HttpErrorResponse`/`TimeoutError`/outro → `RegistrationFailure` | `services/registration-error.mapper.ts` |
| `toFieldName(key: string)` | chave de `error.errors` → `RegistrationField \| null` (sem caixa) | idem |

## Estado (`RegistrationStore`, provido em `RegisterPage`)

| Signal | Tipo | Derivação |
|--------|------|-----------|
| `status` | `RegistrationStatus` | — |
| `successMessage` | `string \| null` | definido em `succeeded` |
| `failure` | `RegistrationFailure \| null` | definido em `failed` |
| `isSubmitting` | `computed<boolean>` | `status() === 'submitting'` |
| `formErrorMessage` | `computed<string \| null>` | `failure()?.message ?? null` |

### Transições

```text
idle ──submit(válido)──▶ submitting
succeeded ─submit──────▶ submitting   (limpa successMessage)
failed ────submit──────▶ submitting   (limpa failure)
submitting ─201/success─▶ succeeded   (successMessage = message || "Cadastro realizado!")
submitting ─erro/timeout▶ failed      (failure = mapRegistrationError(e))
submitting ─submit──────▶ submitting  (ignorado: duplo clique/Enter)
qualquer ──página destruída──▶ (store descartado; requisição cancelada, sem erro)
```

### Reações do formulário (effect no `RegisterForm`)

| Status | Formulário |
|--------|-----------|
| `submitting` | `disable()`; botão desabilitado; spinner visível |
| `succeeded` | `enable()`; `reset()`; aviso verde |
| `failed` | `enable()`; mantém valores; aplica `fieldErrors` (`setErrors({ server })` + `markAsTouched`); foca o 1º campo com erro; aviso vermelho se `message` |
