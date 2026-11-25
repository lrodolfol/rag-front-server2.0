# Contract: Rotas

| Path (`AppPaths`) | Componente | Guard | Título da aba | Mudança |
|-------------------|------------|-------|---------------|---------|
| `dashboard` | `DashboardPage` (lazy) | `authGuard` | `Meus negócios — AchaLocal` | troca o placeholder |
| `editar-negocio` (`editBusiness`) | `ComingSoonPage` (`featureName: 'Edição de negócio'`) | `authGuard` | `Edição de negócio — em breve` | nova |
| `excluir-negocio` (`deleteBusiness`) | `ComingSoonPage` (`featureName: 'Exclusão de negócio'`) | `authGuard` | `Exclusão de negócio — em breve` | nova |
| `cadastrar-negocio` (`registerBusiness`) | `ComingSoonPage` | — | sem mudança | reusada por "Novo negócio"/"Cadastrar agora" |
| `login`, `chatbot`, `''` | — | — | sem mudança | destinos de redirecionamento/links |

## Navegação

| Origem | Destino |
|--------|---------|
| Acesso negado (guard), 401, sessão expirada em requisição | `/login` (sessão descartada) |
| Login bem-sucedido | `/dashboard` (já implementado na feature 005) |
| "Sair" | `/` com `replaceUrl`; voltar → guard → `/login` |
| "Testar Chatbot", "Abrir o chat" | `/chatbot` |
| "Meus negócios" | `/dashboard` |
| "Novo negócio", "Cadastrar agora" | `/cadastrar-negocio` |
| "Editar" | `/editar-negocio` |
| "Excluir" | `/excluir-negocio` (nada é excluído) |
