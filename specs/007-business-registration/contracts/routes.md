# Contract: Rotas e navegação

## Rotas (`app.routes.ts`)

| Path | Guard | Componente | Título da aba |
|------|-------|------------|---------------|
| `dashboard/new` (**nova**, `AppPaths.newBusiness`) | `authGuard` | `BusinessRegistrationPage` (lazy) | "Novo negócio — AchaLocal" |
| `cadastrar-negocio` (`AppPaths.registerBusiness`) | — | `redirectTo: 'dashboard/new'`, `pathMatch: 'full'` (antes: `ComingSoonPage`) | — |
| `dashboard` | `authGuard` | `DashboardPage` (sem mudança) | "Meus negócios — AchaLocal" |

A rota `dashboard/new` é declarada como irmã de `dashboard` (research R-04). `/dashboard/xyz` segue o
comportamento padrão para rotas inexistentes.

## Navegações

| Origem | Ação | Destino | Observação |
|--------|------|---------|------------|
| Dashboard (estado vazio) | "Cadastrar agora" / "Novo negócio" | `/dashboard/new` | `routerLink` → `AppPaths.newBusiness` |
| Landing / chatbot | links "cadastrar" existentes | `/cadastrar-negocio` → `/dashboard/new` | redirect; sem sessão o `authGuard` leva a `/login` |
| `/dashboard/new` sem sessão válida | abrir | `/login` | `authGuard` (`UrlTree`), sessão descartada |
| `/dashboard/new`, cliente com negócio | abrir (URL, link, F5, voltar/avançar) | `/dashboard` | store, `replaceUrl: true` |
| Formulário | "← Voltar" sem conteúdo | `/dashboard` | `navigateByUrl` |
| Formulário | "← Voltar" com conteúdo → "Descartar" | `/dashboard` | diálogo de confirmação |
| Formulário | envio com sucesso | `/dashboard` | `replaceUrl: true` + snackbar |
| Formulário | envio → 409 | `/dashboard` | `replaceUrl: true` + snackbar |
| Qualquer requisição | 401 | `/login` | interceptor (sessão descartada) |
| Cabeçalho | "Testar Chatbot" / "Meus negócios" / "Sair" | `/chatbot` / `/dashboard` / `/` | sem confirmação de descarte (FR-012) |

## Testes (`RouterTestingHarness`)

- `/dashboard/new` sem sessão → `/login`; com sessão → `BusinessRegistrationPage`.
- `/cadastrar-negocio` → `/dashboard/new`.
- Título da aba.
- Links do dashboard apontam para `/dashboard/new`.
