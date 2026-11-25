# Contract: Rotas e navegação do login

**Feature**: [../spec.md](../spec.md)

Caminhos em `AppPaths` (`src/app/core/routing/app-paths.ts`): **novos** `login: 'login'` e
`dashboard: 'dashboard'`.

| URL | Componente | Título da aba | Carregamento | Autenticação | Requisito |
|-----|------------|---------------|--------------|--------------|-----------|
| `/` | `LandingPage` | AchaLocal — diretório local com IA | imediato | Não | (inalterado) |
| `/login` | `LoginPage` (**novo**) | Login — AchaLocal | lazy (`loadComponent`) | Não | FR-003 |
| `/dashboard` | `ComingSoonPage` (**novo uso**, `data.featureName: 'Área do cliente'`) | Área do cliente — em breve | lazy | Não (guard virá com a feature de dashboard) | FR-014 |
| `/register` | `RegisterPage` | Cadastro — AchaLocal | lazy | Não | (inalterado) |
| `/chatbot` | `ChatbotPage` | Chatbot — AchaLocal | lazy | Não | (inalterado) |
| `/cadastrar-negocio` | `ComingSoonPage` | Cadastro de negócio — em breve | lazy | Não | (inalterado) |

## Cabeçalho (`SiteHeader`, sem alterações no componente)

| Página | Itens de navegação (ordem) | Destino |
|--------|----------------------------|---------|
| Landing | "testar chatbot" (`chat`), "registrar" (`person_add`), **"login" (`login`)** | `/chatbot`, `/register`, `/login` |
| Login | "início" (`home`) | `/` |

Marca "AchaLocal" → `/` em todas as páginas (FR-004).

## Comportamento ao entrar/sair

- Entrar em `/login`: formulário vazio, status `idle` (store novo por visita), mesmo com sessão já
  salva.
- Sucesso: `navigateByUrl('/dashboard')` (navegação normal, sem `replaceUrl`; voltar leva a `/login`
  com formulário vazio).
- Sair de `/login` com envio em andamento: requisição cancelada, nenhuma sessão salva, sem console.
- Recarregar `/login`: formulário vazio.
