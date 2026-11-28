# Data Model: Cadastro de Negócio (/dashboard/new)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Todos os tipos são `readonly`. Nenhuma entidade é persistida no front (dados só em memória).

## 1. Valores do formulário (Reactive Forms)

`FormGroup` não anulável (`NonNullableFormBuilder`), todos `string`, valor inicial `''`.

| Controle      | Rótulo               | Validadores (ordem de prioridade da mensagem)                                   | Atributos do input |
|---------------|----------------------|----------------------------------------------------------------------------------|--------------------|
| `name`        | Nome do negócio *    | `required`, `notBlank`, `trimmedMinLength(2)`, `maxLength(100)`                  | `maxlength=100`, `autocomplete="organization"` |
| `description` | Descrição rápida     | `maxLength(150)`                                                                 | `maxlength=150`; contador |
| `details`     | Descrição completa * | `required`, `notBlank`, `trimmedMinLength(20)`, `maxLength(1000)`                | `textarea`, `cdkTextareaAutosize`, `maxlength=1000`; contador; hint da IA |
| `address`     | Endereço completo *  | `required`, `notBlank`, `trimmedMinLength(5)`, `maxLength(200)`                  | `maxlength=200`, `autocomplete="street-address"` |
| `email`       | E-mail               | `trimmedEmail`, `maxLength(150)`                                                 | `type="email"`, `maxlength=150`, `autocomplete="email"` |
| `telephone`   | Telefone             | `brazilianPhone`                                                                 | `type="tel"`, `inputmode="numeric"`, `autocomplete="tel-national"`; máscara |

**Ordem de foco** (`FIELD_ORDER`): `name`, `description`, `details`, `address`, `email`, `telephone`.

**`hasContent`** (decide a confirmação de descarte): algum controle com `value.trim().length > 0`.

### Chaves de erro → mensagem (`business-field-message.ts`)

| Chave | Mensagem |
|-------|----------|
| `required`, `blank` | "Campo obrigatório." |
| `trimmedMinLength` (`{ requiredLength }`) | "Informe pelo menos {requiredLength} caracteres." |
| `maxlength` (`{ requiredLength }`) | "Use no máximo {requiredLength} caracteres." |
| `email` | "Informe um e-mail válido." |
| `phone` | "Informe um telefone válido com DDD." |

## 2. `BusinessRegistrationInput` (models/business-registration-input.ts)

Valores normalizados (`trim`) produzidos por `toBusinessRegistrationInput(formValue)`.

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `string` | trim; 2–100 |
| `description` | `string \| null` | trim; `null` se vazio |
| `details` | `string` | trim; 20–1000 |
| `address` | `string` | trim; 5–200 |
| `email` | `string \| null` | trim; `null` se vazio |
| `telephone` | `string \| null` | `extractDigits(valor)` — só dígitos, sem máscara (10 ou 11, ex.: `35995678901`); `null` se sem dígitos. A máscara existe apenas no campo da tela |

## 3. `RegisterBusinessRequestDto` (models/register-business-request.dto.ts)

Corpo do `POST` (payload do usuário; ver [contracts/business-registration-api.md](./contracts/business-registration-api.md)).

```ts
interface RegisterBusinessRequestDto {
  readonly name: string;
  readonly description: string | null;
  readonly email: string | null;
  readonly address: string;
  readonly telephone: string | null;
  readonly detalhes: string;   // chave em português, como no payload de exemplo (research R-02)
}
```

Mapper `toRegisterBusinessRequestDto(input)`: cópia 1:1, `details` → `detalhes`.

## 4. Tipos compartilhados movidos para `core/business/` (feature 006, sem mudança de forma)

- `BusinessResponseDataDto` — `data` do `GET`/`POST` (`name`, `description`, `email`, `telephone`,
  `address`, `details`, `createdAt`, `updatedAt`).
- `Business` — `{ name }`.
- `BusinessLoadResult` — `found | not-found | invalid`.
- `toBusinessLoadResult` / `errorToBusinessLoadResult`.

## 5. `BusinessRegistrationFailure` (models/business-registration-failure.ts)

```ts
type BusinessRegistrationFailure =
  | { readonly kind: 'generic' }            // rede, timeout, 403, 404, 5xx, 2xx com success:false, outro
  | { readonly kind: 'invalid-data' }       // 400, 422
  | { readonly kind: 'already-registered' } // 409
```

Produzido por `mapBusinessRegistrationError(error: unknown)`. 401 nunca chega aqui (interceptor).

| `kind` | Texto | Efeito |
|--------|-------|--------|
| `generic` | "Não foi possível cadastrar seu negócio agora. Tente novamente em instantes." | `submit-failed`, dados preservados |
| `invalid-data` | "Verifique os dados informados e tente novamente." | `submit-failed`, dados preservados, nenhum campo destacado |
| `already-registered` | "Você já possui um negócio cadastrado." | snackbar `warning` + `/dashboard` (`replaceUrl`) |

## 6. `BusinessRegistrationStatus` e transições (state/business-registration.store.ts)

`'checking' | 'check-failed' | 'ready' | 'submitting' | 'submit-failed'`

Sinais expostos: `status`, `failureMessage: string | null`, `isSubmitting` (computed),
`showForm` (computed: `ready | submitting | submit-failed`).

```text
            ┌──────────── check() / "Tentar novamente" ────────────┐
            ▼                                                      │
[início] → checking ── not-found ──► ready ── submit(input) ──► submitting
              │                        ▲                         │  │  │
              │ found                  │ submit(input)           │  │  └─ 2xx ok ──► navega /dashboard + snackbar "Negócio cadastrado com sucesso."
              ├──► navega /dashboard   │                         │  └──── 409 ─────► navega /dashboard + snackbar "Você já possui um negócio cadastrado."
              │                        │                         └─ 400/422/erro/timeout ─► submit-failed (failureMessage)
              └─ invalid/erro/timeout ─► check-failed ──────────┘        │
                                                                         └── submit(input) ──► submitting
  401 em qualquer requisição → interceptor: sessão descartada + /login (página destruída)
```

Regras:
- `check()` e `submit()` são ignorados enquanto houver requisição em curso (trava liberada em
  `finalize`).
- `submit()` só é aceito em `ready` ou `submit-failed`; limpa `failureMessage`.
- `check()` aceito em `checking` (inicial) ou `check-failed`.
- Timeout de 30 s em ambas as requisições (`BUSINESS_REGISTRATION_TIMEOUT_MS`).
- Navegações com `replaceUrl: true` e `.catch(() => undefined)` (nada no console).

## 7. Máscara de telefone (services/phone-mask.ts)

| Função | Entrada → saída |
|--------|-----------------|
| `extractDigits(text)` | remove tudo que não for `0-9` |
| `formatPhone(digits)` | `''` → `''`; 1–2 → `(XX`; 3–6 → `(XX) XXXX`; 7–10 → `(XX) XXXX-XXXX`; 11 → `(XX) XXXXX-XXXX`; > 11 → dígitos crus (inválido, não truncado) |

Validador `brazilianPhoneValidator`: vazio (sem dígitos) → `null`; 10 ou 11 dígitos → `null`; senão
`{ phone: true }`.
