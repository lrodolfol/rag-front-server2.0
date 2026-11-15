# rag-front-server2.0

## Tema e cores

O tema visual usa Angular Material (M3) configurado em `src/styles/`:

| Arquivo | Conteúdo |
|---------|----------|
| `src/styles/_tokens.scss` | **Única fonte de cores** (`--app-color-*`): marca, neutros e status |
| `src/styles/_theme.scss` | `mat.theme()` + overrides que mapeiam os tokens para os componentes Material e variantes de snackbar |
| `src/styles/_typography.scss` | Roboto auto-hospedada (`@fontsource/roboto`, 400/500/700) e pilha de fallback |

### Regras

- **Nunca use hexadecimal, `rgb()` ou `hsl()` fora de `src/styles/_tokens.scss`.** Em componentes, use
  `var(--app-color-*)` ou `var(--mat-sys-*)`.
- **Cor nova ou complementar**: declare-a apenas como token em `_tokens.scss` e adicione o par de
  contraste correspondente em `scripts/check-color-contrast.mjs` (array `PAIRS`).
- **Primária como cor de texto** (`--app-color-primary`) só em texto grande (≥ 24px, ou ≥ 18,66px em
  negrito) ou em elementos de interface; texto normal e links usam `--app-color-on-surface`.
- **Botões compactos**: se o rótulo grande não couber num `mat-flat-button`, use `mat-stroked-button`
  ou `mat-button` (rótulo escuro).

### Mensagens de status

Use `FeedbackSnackbarService` (`src/app/core/feedback/`) — a cor vem do tipo:

```ts
private readonly feedback = inject(FeedbackSnackbarService);

this.feedback.open('Dados salvos com sucesso.', 'success', 'Fechar');
// tipos: 'error' | 'success' | 'info' | 'warning'
```

### Página de demonstração

Com `npm start`, acesse [`/dev/tema`](http://localhost:4200/dev/tema) para ver todos os componentes
tematizados. A rota existe só em desenvolvimento: o build de produção substitui
`src/app/dev/dev.routes.ts` por `dev.routes.prod.ts` (`fileReplacements` em `angular.json`).

### Verificações

```bash
npm run lint:colors    # falha se houver cor literal fora de _tokens.scss
npm run lint:contrast  # contraste WCAG 2.1 dos pares de tokens e cores proibidas
npm test               # testes unitários (Vitest)
```
