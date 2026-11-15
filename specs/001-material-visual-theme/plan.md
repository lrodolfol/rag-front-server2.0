# Implementation Plan: Fundação Visual da Aplicação (Tema e Tokens de Cor)

**Branch**: `feat/install-specify` (feature dir `001-material-visual-theme`) | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-material-visual-theme/spec.md`

## Summary

Instalar Angular Material + CDK e configurar um tema M3 global (Sass API `mat.theme()` +
`mat.*-overrides()`) que aplica automaticamente a paleta da marca (`#00A35C` / `#FCFAF1` /
`#E8F3EA`), a cor de erro `#991B1B`, tipografia Roboto auto-hospedada e densidade padrão a todos os
componentes da biblioteca. Todas as cores ficam em uma única fonte central de tokens (CSS custom
properties `--app-color-*`), único arquivo autorizado a conter hexadecimais. Um serviço
`FeedbackSnackbarService` expõe as 4 variantes de snackbar (erro, sucesso, info, alerta). Uma página
de demonstração (`/dev/tema`) valida os critérios de aceite e é excluída do build de produção via
`fileReplacements`. Conformidade é verificada por testes Vitest (serviço, página) e por dois scripts
Node sem dependências: busca de hexadecimais e contraste WCAG/cores proibidas dos tokens.

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true` — a ser habilitado nesta feature), SCSS

**Primary Dependencies**: Angular 22.2 (standalone, Signals); **novas**: `@angular/material` 22.x,
`@angular/cdk` 22.x, `@fontsource/roboto` (pesos 400/500/700)

**Storage**: N/A

**Testing**: Vitest + jsdom via `@angular/build:unit-test` (`ng test`) para serviço e componentes;
scripts Node sem dependências para busca de hexadecimais (`npm run lint:colors`) e contraste WCAG /
cores proibidas dos tokens (`npm run lint:contrast`); validação visual/responsiva manual via
quickstart (ferramenta E2E fora do escopo — constitution exige spec própria)

**Target Platform**: Navegadores modernos (evergreen), desktop/tablet/smartphone (≥ 360px)

**Project Type**: Web SPA (front-end Angular, projeto único)

**Performance Goals**: Sem regressão perceptível; orçamento inicial de produção (500kB warn / 1MB
error) respeitado; Roboto apenas nos pesos usados, subset latin

**Constraints**: WCAG 2.1 AA; 0 requisições a serviços de fontes externos; orçamento
`anyComponentStyle` 4kB/8kB; tema claro forçado; demo ausente do bundle de produção

**Scale/Scope**: 1 tema global, ~20 tokens, 1 serviço, 1 página de demonstração; base para todas as
telas futuras

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS (com correção) | `tsconfig.json` hoje **não** tem `strict: true` — débito pré-existente corrigido como primeira tarefa. Componentes standalone, `input()`, Signals; sem NgModules; sem `any`. |
| II. Responsabilidade única / por feature | PASS | `core/feedback` (serviço + tipo), `dev/theme-showcase` (apresentação), `scripts/` (verificações de build). Arquivos separados, nomes em inglês. |
| III. HTTP tipado | N/A | Feature não faz chamadas HTTP. |
| IV. Segurança | PASS | Sem manipulação de DOM (snackbar via `MatSnackBar`); demo removida da produção via `fileReplacements` (código não é empacotado). Nenhum dado sensível. |
| V. UX e identidade visual | PASS | Angular Material como biblioteca única; cores via tema + CSS custom properties; hex só em `src/styles/_tokens.scss`; estilos globais restritos a tema/tokens/reset; textos da demo em pt-BR; `index.html` com `lang="pt-BR"`; responsivo 360/768/1280. |
| VI. Testes | PASS | Unit (Vitest): `FeedbackSnackbarService` (panelClass/politeness por tipo), `ThemeShowcase` (renderiza todos os componentes, diálogo, erro de campo, snackbars), `App`. Script `lint:contrast`: contraste WCAG de todos os pares de tokens e cores proibidas (regra verificável automaticamente). |
| VII. Dependências mínimas | PASS (justificado) | `@angular/material` + `@angular/cdk`: exigidos pela constitution. `@fontsource/roboto`: empacota woff2 versionados com `@font-face` prontos, evitando baixar/manter arquivos manualmente (FR-011, SC-009). Sem stylelint nem `@types/node`: hexadecimais e contraste verificados por scripts Node puros. |
| SDD | PASS | Spec clarificada (7 Qs); nada fora do escopo (sem layout/menu, sem dark mode, sem alerta inline). |

**Re-check pós-design (Phase 1)**: PASS — contratos e modelo de dados não introduzem novas
dependências nem violações. Risco registrado em research.md (R-11: contraste indicador × trilho da
barra de progresso).

## Project Structure

### Documentation (this feature)

```text
specs/001-material-visual-theme/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── css-tokens.md
│   ├── feedback-snackbar-service.md
│   └── theme-showcase-route.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
src/
├── index.html                               # lang="pt-BR", <meta name="color-scheme" content="light">
├── styles.scss                              # @use tokens, typography, theme + reset mínimo
├── styles/
│   ├── _tokens.scss                         # ÚNICA fonte de hex: --app-color-* (marca, status, neutros)
│   ├── _typography.scss                     # @fontsource/roboto 400/500/700 + pilha de fallback
│   └── _theme.scss                          # mat.theme() + mat.theme-overrides + overrides de componentes e variantes de snackbar
└── app/
    ├── app.routes.ts                        # importa DEV_ROUTES
    ├── app.config.ts                        # (sem provider extra; Material standalone)
    ├── app.html / app.spec.ts               # placeholder do CLI substituído por <router-outlet />
    ├── core/
    │   └── feedback/
    │       ├── feedback-type.ts             # type FeedbackType = 'error' | 'success' | 'info' | 'warning'
    │       ├── feedback-snackbar.service.ts
    │       └── feedback-snackbar.service.spec.ts
    └── dev/
        ├── dev.routes.ts                    # [{ path: 'dev/tema', loadComponent: ThemeShowcase }]
        ├── dev.routes.prod.ts               # export const DEV_ROUTES: Routes = [];
        └── theme-showcase/
            ├── theme-showcase.ts / .html / .scss / .spec.ts
            ├── showcase-dialog/showcase-dialog.ts / .html   # diálogo de exemplo (US1)
            └── token-swatch/token-swatch.ts / .html / .scss # componente próprio só com tokens (US2)
scripts/
├── check-hex-colors.mjs                     # falha se houver cor literal fora de src/styles/_tokens.scss (SC-002)
└── check-color-contrast.mjs                 # contraste WCAG dos pares de tokens + cores proibidas (SC-003, FR-006)
angular.json                                 # fileReplacements (production): dev.routes.ts → dev.routes.prod.ts
package.json                                 # deps novas + scripts "lint:colors" e "lint:contrast"
tsconfig.json                                # "strict": true
```

**Structure Decision**: Projeto Angular único (raiz `src/`). Estilos globais isolados em
`src/styles/` (exceção prevista na constitution para tema/tokens). Código de aplicação por domínio:
`core/` para infraestrutura transversal reutilizável (feedback, tema) e `dev/` para ferramentas
exclusivas de desenvolvimento.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| Estilos globais SCSS (`src/styles/`) | Tema Material e tokens precisam ser globais para alcançar todos os componentes e overlays (diálogo, snackbar) | Estilos por componente não atingem overlays nem componentes futuros (viola FR-001) |
| `fileReplacements` para rotas de dev | Garante que o código da demo não seja empacotado em produção (FR-016, SC-008) | `isDevMode()` em guard/rota ainda empacota o componente e depende de checagem em runtime |
| Overrides pontuais de tokens de componentes Material | Material M3 gera paletas tonais que não preservam exatamente `#00A35C` nem `#991B1B`; overrides garantem os valores exatos (FR-002, FR-006a) | Usar só `mat.theme()` com paleta gerada produz tons diferentes dos especificados |
