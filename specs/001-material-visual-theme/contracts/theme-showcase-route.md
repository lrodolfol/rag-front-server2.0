# Contract: Rota de demonstração do tema

| Item | Valor |
|------|-------|
| Path | `/dev/tema` |
| Componente | `ThemeShowcase` (`src/app/dev/theme-showcase/`), carregado via `loadComponent` |
| Disponível | Somente build/serve de desenvolvimento (`ng serve`, configuração `development`) |
| Produção | `dev.routes.ts` substituído por `dev.routes.prod.ts` (`DEV_ROUTES = []`) via `fileReplacements`; nenhum código da demo no bundle (SC-008) |
| Idioma | Todo texto em pt-BR |

**Conteúdo obrigatório (FR-016)** — nenhum estilo de cor próprio no componente:

- Botões: preenchido (rótulo grande), tonal, contornado, texto, desabilitado.
- Campo de formulário (Reactive Forms) com validação `required` para exibir estado de erro.
- Card com título, texto e ações.
- Botão que abre um diálogo (`MatDialog`).
- Barra de progresso determinada (com percentual em texto) e indeterminada.
- 4 botões que disparam `FeedbackSnackbarService.open` com `error`, `success`, `info`, `warning`.
- Um link de tamanho normal (cor on-surface + sublinhado) e um exemplo de componente próprio usando apenas `var(--app-color-*)` (US2).

`.scss` do componente: somente layout (espaçamento, coluna/flex), sem cores, dentro do orçamento de 4kB.
