# Quickstart: validação da Fundação Visual

## Pré-requisitos

- Node/npm conforme `package.json`; dependências instaladas: `npm install`
- Chrome/Edge com DevTools

## 1. Verificações automáticas

| Comando | Esperado |
|---------|----------|
| `npm test` | Todos os testes passam (`FeedbackSnackbarService`, `ThemeShowcase`, `App`) |
| `npm run lint:colors` | Exit 0; nenhuma cor literal fora de `src/styles/_tokens.scss` (SC-002) |
| `npm run lint:contrast` | Exit 0; todos os pares de [data-model.md](./data-model.md) atingem o mínimo, nenhuma cor proibida, 14 tokens (SC-003, FR-006) |
| `npx tsc -p tsconfig.app.json --noEmit` | Sem erros com `strict: true` |

## 2. Página de demonstração (dev)

`npm start` → abrir `http://localhost:4200/dev/tema` ([contrato](./contracts/theme-showcase-route.md)).

| Cenário | Como verificar | Esperado |
|---------|----------------|----------|
| US1-1/2 | Inspecionar botão preenchido e `body`/card | `--mat-sys-primary` = `#00A35C`; fundos = `#FCFAF1` |
| US1-3/4 | Focar o campo; depois tocar e sair vazio | Em foco: contorno verde `#00A35C` e rótulo escuro `#1C1B17`; em erro: mensagem/borda/rótulo `#991B1B` |
| FR-009 | Inspecionar rótulos dos botões contornado/texto e do diálogo | Rótulos em `#1C1B17` (nunca a primária em tamanho normal) |
| US1-5 | Inspecionar barra de progresso | Indicador `#00A35C`, trilho `#E8F3EA` |
| US1-6 / US3 | Abrir diálogo; clicar nos 4 botões de snackbar | Cores dos pares de [css-tokens.md](./contracts/css-tokens.md); sem roxo/rosa |
| US2-2 / SC-004 | Alterar `--app-color-primary` em `_tokens.scss` | Botões, campo, progresso e componente próprio mudam juntos |
| US4-1 / SC-007 | DevTools → Computed → `font-family` / Rendered fonts | Roboto |
| US4-2 / SC-005 | Device toolbar 360, 768, 1280px | Sem rolagem horizontal; alvos ≥ 44px |
| US4-3 | Network → bloquear `*.woff2`, recarregar | Texto visível em fonte de fallback |
| SC-009 | Network, filtro "fonts" | 0 requisições a domínios externos |
| FR-015 | Rendering → emular `prefers-color-scheme: dark` | Tema permanece claro |
| SC-006 / FR-014 | Hover/foco (Tab)/desabilitado em cada componente | Somente cores da paleta; foco visível |
| SC-003 (complementar) | Lighthouse → Accessibility ou extensão axe | Sem falhas de contraste (exceto R-11 documentado) |

## 3. Produção (SC-008)

```bash
npm run build
npx http-server dist/rag-front/browser -p 8080 --proxy "http://localhost:8080?"  # fallback SPA
```

Abrir `http://localhost:8080/dev/tema` → a demo **não** é exibida. Conferir também que nenhum
chunk em `dist/` contém o texto da página de demonstração (`grep -r "theme-showcase" dist/` vazio).
