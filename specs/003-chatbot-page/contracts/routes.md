# Contract: Rotas e navegação do Chatbot

**Feature**: [../spec.md](../spec.md)

Caminhos centralizados em `AppPaths` (`src/app/core/routing/app-paths.ts`) — sem alteração nos
valores.

| URL | Componente | Título da aba | Carregamento | Autenticação | Requisito |
|-----|------------|---------------|--------------|--------------|-----------|
| `/` | `LandingPage` | AchaLocal — diretório local com IA | imediato | Não | (inalterado) |
| `/chatbot` | `ChatbotPage` (**antes** `ComingSoonPage`) | Chatbot — AchaLocal | lazy (`loadComponent`) | Não | FR-001 |
| `/cadastrar-negocio` | `ComingSoonPage` | Cadastro de negócio — em breve | lazy | Não | (inalterado) |

## Cabeçalho (`SiteHeader`, agora em `core/layout/`)

- **Input**: `navigationItems: readonly NavigationItem[]` (obrigatório), onde
  `NavigationItem = { label: string; icon: AppIconName; path: string }`.
- Marca "AchaLocal" (ícone `storefront`) sempre presente → `/` + rolagem ao topo.

| Página | Itens de navegação (ordem) | Destino |
|--------|----------------------------|---------|
| Landing | "testar chatbot" (`chat`) | `/chatbot` |
| Chatbot | "início" (`home`), "cadastrar" (`add_business`) | `/`, `/cadastrar-negocio` |

## Acionadores que levam ao chat (inalterados, agora abrem a página funcional — FR-025)

| Acionador | Local | Destino |
|-----------|-------|---------|
| "testar chatbot" | Cabeçalho da landing | `/chatbot` |
| "testar o chat online" | Destaque da landing | `/chatbot` |
| "testar agora →" | "Como funciona" da landing | `/chatbot` |

## Comportamento ao entrar/sair

- Entrar em `/chatbot`: nova sessão (novo `user_code`, tela de boas-vindas).
- Sair de `/chatbot`: sessão descartada; requisição em andamento cancelada sem erro (FR-026/027).
