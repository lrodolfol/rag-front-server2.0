# Contract: CSS Color Tokens

Interface pública para componentes próprios. Definidos em `:root` por `src/styles/_tokens.scss`
(única fonte com hexadecimais). Componentes usam **somente** `var(--app-color-*)` ou os system
tokens do Material (`var(--mat-sys-*)`).

| Token | Valor | Papel | Uso permitido |
|-------|-------|-------|---------------|
| `--app-color-primary` | `#00A35C` | brand | Fundos de ação, indicadores, foco. Texto **só grande** sobre surface; nunca texto sobre accent |
| `--app-color-on-primary` | `#FFFFFF` | brand | Texto sobre primary — **só texto grande** (3,28:1) |
| `--app-color-surface` | `#FCFAF1` | brand | Fundo da aplicação, cards, diálogos |
| `--app-color-accent` | `#E8F3EA` | brand | Destaques, trilho de progresso, containers |
| `--app-color-on-surface` | `#1C1B17` | neutral | Texto padrão (16,48:1), links (com sublinhado) |
| `--app-color-on-surface-variant` | `#6B6B60` | neutral | Texto secundário, contornos de campo (5,15:1) |
| `--app-color-error-bg` | `#FEE2E2` | status | Fundo snackbar erro |
| `--app-color-error-text` | `#991B1B` | status | Texto/borda/rótulo de erro (7,95:1 sobre surface) |
| `--app-color-success-bg` | `#DCFCE7` | status | Fundo snackbar sucesso |
| `--app-color-success-text` | `#166534` | status | Texto sucesso |
| `--app-color-info-bg` | `#DBEAFE` | status | Fundo snackbar info |
| `--app-color-info-text` | `#1D4ED8` | status | Texto info |
| `--app-color-warning-bg` | `#FEF3C7` | status | Fundo snackbar alerta |
| `--app-color-warning-text` | `#92400E` | status | Texto alerta |

**Equivalência de nomes (spec → código)**

| Termo na spec | Token |
|---------------|-------|
| primária | `--app-color-primary` |
| superfície / fundo / off-white | `--app-color-surface` |
| destaque / detalhes / verde claro | `--app-color-accent` |
| cor de texto padrão escura | `--app-color-on-surface` |
| erro-fundo / erro-texto | `--app-color-error-bg` / `--app-color-error-text` |
| sucesso-fundo / sucesso-texto | `--app-color-success-bg` / `--app-color-success-text` |
| info-fundo / info-texto | `--app-color-info-bg` / `--app-color-info-text` |
| alerta-fundo / alerta-texto | `--app-color-warning-bg` / `--app-color-warning-text` |

O tipo de feedback "alerta" corresponde a `'warning'` em `FeedbackType`.

**Regras**

- Novos tokens (inclusive complementares, FR-007) entram apenas em `src/styles/_tokens.scss`, com par de contraste registrado em `scripts/check-color-contrast.mjs`.
- Rótulos de botões de texto/contornados/tonais e o rótulo de campo em foco usam `--app-color-on-surface`; a primária aparece só como contorno/indicador de foco ou em texto grande (FR-009).
- Renomear/remover token é mudança incompatível: buscar usos antes.
- Exemplo de uso: `.price { color: var(--app-color-on-surface); border-color: var(--app-color-accent); }`
