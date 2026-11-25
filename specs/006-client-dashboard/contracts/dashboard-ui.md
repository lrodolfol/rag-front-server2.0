# Contract: UI da área do cliente

Referências visuais: `.mine/dash-board_page/dash.excalidraw` (estado `empty`) e
`.mine/dash-board_page/dash02.excalidraw` (estado `loaded`). Cores só por tokens existentes.

## Estrutura

```text
app-site-header  [AchaLocal]  ……  (chat) Testar Chatbot  (grid_view) Meus negócios  [(logout) Sair]
main
  ├─ h1 "Meus negócios"                                  [ + Novo negócio ]   ← só em `empty`
  ├─ p  "Gerencie os negócios que você cadastrou no diretório."
  ├─ conteúdo por estado (abaixo)
  └─ app-chatbot-preview-card                            ← sempre visível (todos os estados)
```

## Conteúdo por estado

| Estado | Conteúdo | Acessibilidade |
|--------|----------|----------------|
| `loading` | `mat-progress-spinner` (indeterminado) | contêiner `role="status"`, texto oculto "Carregando seus dados" |
| `loaded` | `app-business-card` | ver abaixo |
| `empty` | `app-business-empty-state` + botão "Novo negócio" no topo | — |
| `failed` | "Não foi possível carregar seus dados agora. Tente novamente em instantes." + `mat-stroked-button` "Tentar novamente" | `role="alert"` |

## `app-business-card` (input `business: Business`)

- Área superior com ícone `image` (fundo `--app-color-accent`), `aria-hidden`.
- Nome do negócio (`h2`), uma linha com reticências; `title` com o nome completo.
- `mat-stroked-button` (`edit`) **Editar** → `/editar-negocio`.
- `mat-icon-button` (`delete`, cor `--app-color-error-text`) `aria-label="Excluir negócio"` →
  `/excluir-negocio`.

## `app-business-empty-state`

- Ícone `storefront` em quadrado `--app-color-accent`, `aria-hidden`.
- `h2` "Nenhum negócio ainda"; texto "Cadastre seu primeiro negócio para aparecer no chatbot.".
- `mat-flat-button` (`add`) **Cadastrar agora** → `/cadastrar-negocio`.

## `app-chatbot-preview-card`

- Fundo `--app-color-accent`; ícone `chat`; `h2` "Veja como aparece no chatbot";
  texto `Teste perguntas como "estou com fome" no simulador.`;
  `mat-stroked-button` **Abrir o chat** → `/chatbot`.

## Cabeçalho

| Item | Ícone | Destino/ação |
|------|-------|--------------|
| logotipo "AchaLocal" | `storefront` | `/` (comportamento atual do `SiteHeader`) |
| Testar Chatbot | `chat` | `/chatbot` |
| Meus negócios | `grid_view` | `/dashboard` |
| Sair (`<button mat-button>` projetado) | `logout` | `AuthRedirectService.signOut()` |

## Textos (todos pt-BR, em `dashboard-content.ts`)

Título da aba: `Meus negócios — AchaLocal`. Demais textos exatamente como na spec (FR-007, FR-012,
FR-014, FR-015).

## Responsividade

- ≥ 600 px: título à esquerda, "Novo negócio" à direita; cartão do negócio até 600 px de largura.
- < 600 px: título e botão empilhados (botão em largura total); cartões em largura total; itens do
  cabeçalho seguem o comportamento atual do `SiteHeader`.
- Contêiner central até 1240 px, padding lateral 16 px; sem rolagem horizontal em 320 px.

## Proibições

Nenhum `console.*`; nenhum token, `clientId`, status HTTP ou `correlationId` na tela; nome do
negócio só por interpolação.
