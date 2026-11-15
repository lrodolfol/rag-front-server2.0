# Research: Fundação Visual da Aplicação

Feature: `001-material-visual-theme` | Date: 2026-11-15

Nenhum item `NEEDS CLARIFICATION` restou no Technical Context; as decisões abaixo resolvem as
escolhas técnicas e de integração.

## R-01 — API de tema do Angular Material

- **Decision**: Usar a API Sass M3 `mat.theme((color: (theme-type: light, primary: <paleta>), typography: Roboto, density: 0))` aplicada em `html`, complementada por `mat.theme-overrides(...)` para fixar os system tokens (`--mat-sys-*`) nos valores exatos da marca.
- **Rationale**: É a API recomendada a partir do Material v18+/M3; emite CSS custom properties `--mat-sys-*` consumidas por todos os componentes, inclusive overlays. Os overrides permitem fixar `primary = #00A35C`, `surface/background = #FCFAF1`, `error = #991B1B` mesmo que a paleta tonal gerada difira.
- **Alternatives considered**: Temas pré-construídos (`azure-blue` etc.) — trazem cores proibidas/fora da marca. API M2 (`mat.define-light-theme`) — legada. Gerar paleta com `ng generate @angular/material:theme-color` — útil como ponto de partida para os tons auxiliares (hover/container), mas não garante o hex exato; será usada apenas para gerar a paleta-base, com overrides por cima.

## R-02 — Fonte única de tokens

- **Decision**: `src/styles/_tokens.scss` define em `:root` todas as CSS custom properties `--app-color-*` (ver [contracts/css-tokens.md](./contracts/css-tokens.md)). `_theme.scss` mapeia os `--mat-sys-*` para `var(--app-color-*)`. É o único arquivo com hexadecimais.
- **Rationale**: Atende FR-003/FR-004, SC-002 e SC-004 (alterar cor em 1 local). CSS custom properties são exigidas pela constitution e funcionam em componentes próprios (`color: var(--app-color-primary)`).
- **Alternatives considered**: Variáveis Sass — resolvidas em compilação, não refletem mudança em runtime e duplicam a fonte. Tokens em TS — exigiria aplicar estilos via código (manipulação desnecessária).

## R-03 — Cor de erro de formulário (FR-006a)

- **Decision**: `--mat-sys-error` → `var(--app-color-error-text)` (`#991B1B`, 7,95:1 sobre `#FCFAF1`); além disso `mat.form-field-overrides` para garantir rótulo, contorno e texto de suporte em erro. Em foco (sem erro): contorno na primária (componente de interface, 3,14:1) e rótulo em `--app-color-on-surface` (texto normal não pode usar a primária — FR-009; clarificação via analyze I1).
- **Rationale**: Remove o vermelho padrão da biblioteca em todos os estados de erro.
- **Alternatives considered**: Override apenas por componente — risco de vazamento em outros componentes que usam `error`.

## R-04 — Texto branco sobre a primária (FR-009)

- **Decision**: `mat.button-overrides` para botões preenchidos (`filled`/`flat`/`fab` estendido) com rótulo ≥ 18,66px em peso 700 (texto grande). Botão tonal/contornado/texto usa cor de texto escura (`--app-color-on-surface`, 16,48:1), via `text-label-text-color`, `outlined-label-text-color` e `tonal-label-text-color` em `mat.button-overrides` — o padrão M3 usa a primária como rótulo desses botões, o que violaria FR-009. Links de tamanho normal: `--app-color-on-surface` + sublinhado.
- **Rationale**: Branco sobre `#00A35C` = 3,28:1 — AA apenas para texto grande. A spec proíbe tons alternativos da primária.
- **Alternatives considered**: Escurecer a primária para botões — vetado pela clarificação. Texto escuro sobre primária — `#1C1B17` sobre `#00A35C` = 5,25:1 seria AA, mas foge do padrão visual definido (branco); pode ser reavaliado em futura emenda.

## R-05 — Variantes de snackbar (FR-005a)

- **Decision**: `FeedbackSnackbarService.open(message, type, action?)` chama `MatSnackBar.open` com `panelClass: 'app-snackbar--<type>'`. Em `_theme.scss`, cada classe aplica `mat.snack-bar-overrides((container-color, supporting-text-color, button-color))` usando o par de status correspondente; o botão de ação usa a mesma cor do texto (contraste AA garantido pelo par).
- **Rationale**: Desenvolvedor informa apenas o tipo; nenhuma estilização local. Overrides por classe são a forma suportada de customizar overlays sem `::ng-deep`.
- **Alternatives considered**: Componente de snackbar customizado (`openFromComponent`) — mais código sem necessidade (YAGNI). `::ng-deep` — depreciado.

## R-06 — Tema claro forçado (FR-015)

- **Decision**: `theme-type: light` explícito, `color-scheme: light` em `html` e `<meta name="color-scheme" content="light">`; nenhum bloco `prefers-color-scheme`.
- **Rationale**: `theme-type: color-scheme` (light-dark automático) seguiria o SO; o explícito fixa o claro e impede controles nativos escuros.
- **Alternatives considered**: Nenhuma viável dentro do escopo.

## R-07 — Roboto auto-hospedada (FR-011, FR-012, SC-009)

- **Decision**: Dependência `@fontsource/roboto`, importando apenas `400.css`, `500.css`, `700.css` (subset latin) em `_typography.scss`. Pilha: `Roboto, "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif`. Os CSS do Fontsource já usam `font-display: swap` (evita texto invisível).
- **Rationale**: Fontes servidas pelo próprio build (hash nos arquivos), 0 requisições externas, pesos mínimos.
- **Alternatives considered**: Google Fonts via `<link>` — viola SC-009. Copiar woff2 manualmente para `public/` — sem versionamento/atualização e `@font-face` mantido à mão.

## R-08 — Página de demonstração só em desenvolvimento (FR-016, SC-008)

- **Decision**: `app.routes.ts` concatena `DEV_ROUTES` de `src/app/dev/dev.routes.ts`; em `angular.json` (configuração `production`) `fileReplacements` troca por `dev.routes.prod.ts` (array vazio). Rota `dev/tema` com `loadComponent`.
- **Rationale**: O componente não entra no bundle de produção; a URL cai na ausência de rota (nenhum componente da demo exibido).
- **Alternatives considered**: `isDevMode()` em `canMatch` — o código ainda é empacotado. Projeto/app separado — complexidade desproporcional.

## R-09 — Verificação automática de hexadecimais (SC-002, FR-006)

- **Decision**: `scripts/check-hex-colors.mjs` (Node, sem dependências) varre `src/**/*.{scss,css,html,ts}` procurando `#[0-9a-fA-F]{3,8}\b` (e `rgb(`/`hsl(` literais) fora de `src/styles/_tokens.scss`; exit 1 com lista de ocorrências. Script npm `lint:colors`.
- **Rationale**: Atende SC-002 sem adicionar stylelint (Princípio VII).
- **Alternatives considered**: stylelint + `color-no-hex` — nova dependência e configuração; não cobre templates/TS.

## R-10 — Verificação de contraste (FR-008, SC-003) e cores proibidas (FR-006)

- **Decision**: Script Node `scripts/check-color-contrast.mjs` (npm `lint:contrast`, sem dependências) implementa luminância relativa WCAG 2.1, lê `src/styles/_tokens.scss` e valida: (a) cada par declarado em [data-model.md](./data-model.md) atinge o limite (4,5 normal / 3 grande ou UI); (b) nenhum token está a distância RGB curta (euclidiana ≤ 60) das cores proibidas; (c) o conjunto de tokens bate com o contrato. Autoverifica o cálculo (branco×preto = 21; branco×primária = 3,28) antes de rodar.
- **Rationale**: Garante que mudanças futuras nos tokens não quebrem AA silenciosamente. Rodar em Node evita ler arquivos dentro do Vitest/jsdom, o que exigiria `@types/node` (nova dependência) e acesso a `node:fs` no builder de testes do Angular, que não é garantido (analyze U1).
- **Alternatives considered**: Teste Vitest com `node:fs` + `@types/node` — dependência extra e comportamento incerto no builder `@angular/build:unit-test`. Import `?raw` — não suportado de forma garantida. Duplicar os valores em TS — viola a fonte única (FR-003). Apenas medição manual (DevTools/WebAIM) — não regressivo; mantida como verificação complementar no quickstart.

Pares calculados (WCAG 2.1):

| Texto/UI | Fundo | Razão | Uso permitido |
|----------|-------|-------|---------------|
| `#FFFFFF` | `#00A35C` | 3,28 | só texto grande |
| `#00A35C` | `#FCFAF1` | 3,14 | texto grande / UI (foco, indicadores) |
| `#00A35C` | `#E8F3EA` | 2,88 | **nunca** como texto |
| `#1C1B17` (on-surface) | `#FCFAF1` | 16,48 | qualquer |
| `#1C1B17` | `#E8F3EA` | 15,13 | qualquer |
| `#6B6B60` (outline / texto secundário) | `#FCFAF1` | 5,15 | qualquer / bordas |
| `#991B1B` | `#FCFAF1` | 7,95 | qualquer |
| `#991B1B` | `#FEE2E2` | 6,80 | qualquer |
| `#166534` | `#DCFCE7` | 6,49 | qualquer |
| `#1D4ED8` | `#DBEAFE` | 5,49 | qualquer |
| `#92400E` | `#FEF3C7` | 6,37 | qualquer |

## R-11 — Risco: indicador × trilho da barra de progresso

- **Finding**: A spec exige indicador `#00A35C` sobre trilho `#E8F3EA` (2,88:1), abaixo dos 3:1 de WCAG 1.4.11 para componentes gráficos.
- **Decision**: Seguir a spec (aceite US1-5) e mitigar: o indicador atinge 3,14:1 contra o fundo `#FCFAF1` adjacente, e barras determinadas na demo exibem também o percentual em texto. Registrado para eventual revisão via `/speckit-clarify` se o time quiser AA estrito no trilho.
- **Alternatives considered**: Trilho mais escuro — contraria o aceite literal da spec (decisão de negócio não deve ser tomada pelo plano).

## R-12 — Responsividade e áreas de toque (FR-013)

- **Decision**: Densidade `0` (padrão M3, alvos de toque ≥ 48px). Demo com layout em coluna única e `max-width` fluido, sem larguras fixas; `box-sizing: border-box` no reset. Validação manual em 360/768/1280 (quickstart).
- **Rationale**: Material já atende 44×44 com densidade 0; sem framework de grid adicional.
- **Alternatives considered**: `@angular/cdk/layout` BreakpointObserver — desnecessário para a demo.

## R-13 — Estados de interação (FR-014)

- **Decision**: Estados derivam dos system tokens (state layers M3 usam `--mat-sys-primary`/`on-surface` com opacidade); foco visível via `mat.strong-focus-indicators()` com cor `--app-color-primary` (3,14:1 sobre off-white).
- **Rationale**: Nenhuma cor de fábrica vaza; indicador de foco ≥ 3:1.
- **Alternatives considered**: Outline customizado por componente — duplicação.
