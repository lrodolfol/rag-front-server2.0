# Contract: UI do cadastro de negócio

Fonte visual: `.mine/cadastro-de-negocios/cadastro-page.excalidraw`. Cores só via tokens existentes.

## Estrutura

```text
┌ SiteHeader ─ AchaLocal ─────────── Testar Chatbot · Meus negócios · [Sair] ┐
│                                                                            │
│   ← Voltar                                                                 │
│   Novo negócio                                       (h1)                  │
│   Quanto mais claras e relevantes ... (subtítulo)                          │
│                                                                            │
│   ┌ Informações básicas (h2) ──────────────────────────────┐               │
│   │ Nome do negócio *        [Restaurante frango feliz   ] │               │
│   │ Descrição rápida         [Você bem alimentado        ] │  0/150        │
│   │ Descrição completa *     [textarea autosize          ] │  0/1000       │
│   │ Esta descrição é usada pela IA para encontrar você ... │  (hint)       │
│   └────────────────────────────────────────────────────────┘               │
│   ┌ Endereço (h2) ─────────────────────────────────────────┐               │
│   │ Endereço completo *      [                           ] │               │
│   └────────────────────────────────────────────────────────┘               │
│   ┌ Contato (h2) ──────────────────────────────────────────┐               │
│   │ E-mail [seu@email.com.br]   Telefone [(11) 3333-3333]  │  (2 col ≥600) │
│   └────────────────────────────────────────────────────────┘               │
│   [mensagem de falha do envio — role="alert"]                              │
│ ═══ barra fixa (sticky bottom) ══════════════ [💾 Cadastrar negócio] ═════ │
└────────────────────────────────────────────────────────────────────────────┘
```

## Textos (`business-registration-content.ts`)

| Chave | Texto |
|-------|-------|
| Título da aba | "Novo negócio — AchaLocal" |
| Voltar | "Voltar" (ícone `arrow_back`) |
| Título | "Novo negócio" |
| Subtítulo | "Quanto mais claras e relevantes forem as informações sobre seu negócio, mais precisas serão as recomendações. Não exagere e não seja ambíguo." |
| Seções | "Informações básicas", "Endereço", "Contato" |
| Rótulos | "Nome do negócio", "Descrição rápida", "Descrição completa", "Endereço completo", "E-mail", "Telefone" (obrigatórios com `required` → asterisco do Material) |
| Placeholders | "Restaurante frango feliz", "Você bem alimentado", "O que vocês fazem, especialidades, diferenciais, público, horário de funcionamento...", —, "seu@email.com.br", "(11) 3333-3333" |
| Hint (Descrição completa) | "Esta descrição é usada pela IA para encontrar você quando alguém perguntar algo relacionado." |
| Botão | "Cadastrar negócio" (ícone `save`) |
| Enviando (aria-label do spinner) | "Cadastrando negócio" |
| Verificando (texto oculto) | "Verificando seus dados" |
| Erro de verificação | "Não foi possível carregar seus dados agora. Tente novamente em instantes." + "Tentar novamente" |
| Falhas de envio | ver [business-registration-api.md](./business-registration-api.md) |
| Diálogo | título "Descartar os dados preenchidos?"; ações "Continuar editando" (foco inicial) / "Descartar" |
| Snackbar sucesso | "Negócio cadastrado com sucesso." (ação "Fechar") |
| Snackbar já possui | "Você já possui um negócio cadastrado." (ação "Fechar") |

## Estados da página

| Status | Conteúdo |
|--------|----------|
| `checking` | `mat-progress-spinner` + texto oculto, `role="status"`; sem formulário |
| `check-failed` | bloco `role="alert"` + `mat-stroked-button` "Tentar novamente"; sem formulário |
| `ready` | formulário habilitado |
| `submitting` | `form.disable()`; botão desabilitado + spinner 20 px; "Voltar" desabilitado |
| `submit-failed` | formulário reabilitado com os mesmos valores; mensagem `role="alert"` acima da barra |

## Barra de ações fixa

- `position: sticky; bottom: 0`, `z-index` acima dos cartões, fundo `--app-color-surface`, borda
  superior com token de contorno, padding vertical 12 px.
- Sempre visível durante a rolagem, de 320 a 1920 px; o conteúdo tem `padding-bottom` suficiente para
  o último campo nunca ficar coberto.
- ≥ 600 px: botão alinhado à direita da coluna; < 600 px: botão em largura total.
- O botão é `type="submit"` dentro do `<form>` (Enter também envia).

## Comportamento dos campos

- Erros em `mat-error` quando `touched` (ao sair do campo) ou após tentativa de envio
  (`markAllAsTouched`); foco vai ao primeiro inválido na ordem de `FIELD_ORDER`.
- Contador `mat-hint align="end"`: "{n}/150" e "{n}/1000".
- Telefone: máscara a cada `input`; digitação para em 11 dígitos; colagem > 11 dígitos é mantida e
  marcada inválida.
- Respostas do serviço nunca destacam campos.

## Acessibilidade

- `h1` único; `h2` por cartão; rótulos via `mat-label`; erros associados (`aria-describedby` do
  Material); `aria-required` via `required`.
- Spinner de verificação com `role="status"`; falhas com `role="alert"`; snackbar com `aria-live`
  (`polite` sucesso, `assertive` aviso).
- Diálogo: `MatDialog` (foco preso, `Esc` = "Continuar editando", foco devolvido ao "Voltar").
- Tudo operável por teclado; contraste validado por `npm run lint:contrast`.

## Responsividade

- Coluna central com `max-width` ≈ 600 px e margens laterais 16 px; sem rolagem horizontal de
  320 a 1920 px; textos longos quebram (`overflow-wrap: anywhere`).
- E-mail/Telefone em 2 colunas ≥ 600 px, 1 coluna abaixo.
