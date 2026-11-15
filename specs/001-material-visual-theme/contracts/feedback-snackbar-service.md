# Contract: FeedbackSnackbarService

Local: `src/app/core/feedback/` | `providedIn: 'root'`

```ts
// feedback-type.ts
export type FeedbackType = 'error' | 'success' | 'info' | 'warning';

// feedback-snackbar.service.ts (assinatura pública)
open(message: string, type: FeedbackType, action?: string): MatSnackBarRef<TextOnlySnackBar>;
```

**Comportamento**

| Entrada | Resultado |
|---------|-----------|
| `type` | `panelClass: ['app-snackbar', 'app-snackbar--<type>']`; cores do par de status aplicadas pelo tema (container, texto e botão de ação) |
| `action` omitido | Snackbar sem botão de ação |
| `message`, `action` | Textos em pt-BR fornecidos pelo chamador (não traduzidos pelo serviço) |
| Duração | 5000 ms fixos para todos os tipos (nenhum requisito pede comportamento diferente) |
| Acessibilidade | `politeness: 'assertive'` para `error`/`warning`, `'polite'` para `success`/`info` |

**Garantias**

- Chamador não passa nenhuma classe ou estilo de cor (US3-5).
- Única dependência: `MatSnackBar`.

**Testes esperados**: para cada `FeedbackType`, verifica `panelClass` e `politeness` passados a `MatSnackBar.open` (mock).
