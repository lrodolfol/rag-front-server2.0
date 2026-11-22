# Contract: Rotas e navegação do cadastro

**Feature**: [../spec.md](../spec.md)

Caminhos centralizados em `AppPaths` (`src/app/core/routing/app-paths.ts`): **novo**
`register: 'register'`.

| URL | Componente | Título da aba | Carregamento | Autenticação | Requisito |
|-----|------------|---------------|--------------|--------------|-----------|
| `/` | `LandingPage` | AchaLocal — diretório local com IA | imediato | Não | (inalterado) |
| `/register` | `RegisterPage` (**novo**) | Cadastro — AchaLocal | lazy (`loadComponent`) | Não | FR-003 |
| `/chatbot` | `ChatbotPage` | Chatbot — AchaLocal | lazy | Não | (inalterado) |
| `/cadastrar-negocio` | `ComingSoonPage` | Cadastro de negócio — em breve | lazy | Não | (inalterado) |

## Cabeçalho (`SiteHeader`, `core/layout/`, sem alterações no componente)

| Página | Itens de navegação (ordem) | Destino |
|--------|----------------------------|---------|
| Landing | "testar chatbot" (`chat`), **"registrar" (`person_add`)** | `/chatbot`, `/register` |
| Register | "início" (`home`) | `/` |
| Chatbot | "início" (`home`), "cadastrar" (`add_business`) | (inalterado) |

Marca "AchaLocal" (ícone `storefront`) → `/` em todas as páginas (FR-004).

## Comportamento ao entrar/sair

- Entrar em `/register`: formulário vazio, status `idle` (store novo por visita).
- Sair de `/register` com envio em andamento: requisição cancelada, sem erro visível nem no console.
- Recarregar: formulário vazio (nada guardado no navegador).
