# Data Model: Fundação Visual da Aplicação

Não há persistência. As "entidades" são definições de design consumidas em build/runtime via CSS e
validadas por testes.

## ColorToken

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | string (kebab-case, prefixo `--app-color-`) | Único; semântico (papel, não cor: `primary`, não `green`) |
| `value` | hex `#RRGGBB` | Declarado **somente** em `src/styles/_tokens.scss` (FR-004, SC-002) |
| `role` | `brand` \| `status` \| `neutral` \| `complementary` | `complementary` exige registro central e conformidade FR-006/FR-008 (FR-007) |
| `contrastPairs` | lista de `{ against: ColorToken, minRatio: 4.5 \| 3, usage: 'text' \| 'large-text' \| 'ui' \| 'forbidden-as-text' }` | Validado em teste (FR-008, SC-003) |

**Validações**

- `value` não pode estar próximo das cores proibidas `#FF0000`, `#0000FF`, `#FF00FF`, `#800080`, `#FF1493`, `#FF8000`, `#FFFF00` (FR-006).
- Pares `large-text` (ex.: branco × primária) só podem ser usados com fonte ≥ 24px ou ≥ 18,66px bold (FR-009).
- `primary` × `accent` marcado `forbidden-as-text`.
- Primária como cor de texto em tamanho normal é proibida, inclusive em rótulos de botões de texto/contornados/tonais e no rótulo de campo em foco (usar `on-surface`); como contorno/indicador de foco é permitida (UI, 3,14:1).
- Contraste dos pares e cores proibidas são validados por `scripts/check-color-contrast.mjs` (`npm run lint:contrast`); o uso da primária em rótulos é garantido pelos overrides do tema e conferido na inspeção manual (quickstart, T044).

Instâncias: ver [contracts/css-tokens.md](./contracts/css-tokens.md).

## StatusPair

| Campo | Tipo | Regra |
|-------|------|-------|
| `type` | `FeedbackType` = `'error' \| 'success' \| 'info' \| 'warning'` | Fechado (4 valores) |
| `background` | ColorToken (`--app-color-<type>-bg`) | — |
| `text` | ColorToken (`--app-color-<type>-text`) | Contraste ≥ 4,5:1 com `background` |

| type | background | text | razão |
|------|------------|------|-------|
| error | `#FEE2E2` | `#991B1B` | 6,80 |
| success | `#DCFCE7` | `#166534` | 6,49 |
| info | `#DBEAFE` | `#1D4ED8` | 5,49 |
| warning | `#FEF3C7` | `#92400E` | 6,37 |

## Theme (Tema visual)

Agregado aplicado em `html`: `colorScheme = light` (fixo, FR-015), `primary = --app-color-primary`,
`surface/background = --app-color-surface`, `error = --app-color-error-text`,
`typography = TypographyScale`, `density = 0`. Mapeamento `--mat-sys-*` → `--app-color-*` em
`_theme.scss`.

## TypographyScale

Escala M3 do Material com `brand-family` e `plain-family` = pilha Roboto (R-07).

| Nível (spec) | Nível M3 | Peso | Observação |
|--------------|----------|------|------------|
| Título | `headline-*` / `display-*` | 400 | — |
| Subtítulo | `title-*` | 500 | — |
| Corpo | `body-*` | 400 | — |
| Rótulo | `label-*` | 500 | — |
| Botão preenchido (primária) | override `label` | 700, ≥ 18,66px | FR-009 |

Pesos carregados: 400, 500, 700 (nenhum outro).

## Estados (interação)

Componentes: `default → hover → focus → active`, e `disabled`. Todos derivados dos system tokens;
foco com indicador ≥ 3:1 (FR-014). Campos de formulário: `valid ↔ invalid (touched)`; em `invalid`
rótulo, contorno e mensagem = `--app-color-error-text`.
