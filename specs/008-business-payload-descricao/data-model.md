# Data Model: Ajuste do payload de cadastro de negócio (`descricao`)

## 1. `BusinessRegistrationInput` (inalterado)

Valores do formulário normalizados (`trim`, opcionais vazios → `null`, telefone só dígitos).

| Campo | Tipo | Observação |
|-------|------|------------|
| `name` | `string` | obrigatório |
| `description` | `string \| null` | Descrição rápida, opcional |
| `details` | `string` | Descrição completa, obrigatória |
| `address` | `string` | obrigatório |
| `email` | `string \| null` | opcional |
| `telephone` | `string \| null` | só dígitos (10 ou 11) |

## 2. `RegisterBusinessRequestDto` (alterado)

Corpo do `POST {API_BASE_URL}/{clientId}/business`.

| Campo | Tipo | Origem (`BusinessRegistrationInput`) | Mudança |
|-------|------|--------------------------------------|---------|
| `name` | `string` | `name` | — |
| `descricao` | `string \| null` | `description` | **antes `description`** |
| `email` | `string \| null` | `email` | — |
| `address` | `string` | `address` | — |
| `telephone` | `string \| null` | `telephone` | — |
| `detalhes` | `string` | `details` | — |

Regras: o DTO tem exatamente essas seis chaves; `description` e `details` MUST NOT aparecer.

## 3. `BusinessResponseDataDto` (inalterado)

Resposta do `GET` continua com `description` e `details` (research R-02).
