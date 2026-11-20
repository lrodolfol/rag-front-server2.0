# Contract: Rotas da Tela Inicial

**Feature**: [../spec.md](../spec.md)

Contrato das URLs expostas ao usuário. Os caminhos ficam centralizados em `AppPaths`
(`src/app/core/routing/app-paths.ts`) e são usados tanto pela configuração de rotas quanto pelos
`routerLink`.

| URL | Componente | Título da aba | Autenticação | Requisito |
|-----|------------|---------------|--------------|-----------|
| `/` | `LandingPage` | AchaLocal — diretório local com IA | Não | FR-001 |
| `/cadastrar-negocio` | `ComingSoonPage` (`featureName: 'Cadastro de negócio'`) | Cadastro de negócio — em breve | Não | FR-007 |
| `/chatbot` | `ComingSoonPage` (`featureName: 'Chatbot'`) | Chatbot — em breve | Não | FR-005, FR-007 |
| `/dev/tema` | `ThemeShowcase` (existente) | Demonstração do tema | Não | só em desenvolvimento (feature 001) |

## Acionadores → destino

| Acionador (texto visível) | Local | Destino |
|---------------------------|-------|---------|
| Marca "AchaLocal" | Cabeçalho | `/` + rolagem ao topo |
| "testar chatbot" | Cabeçalho | `/chatbot` |
| "cadastrar meu negócio" | Destaque (ação principal) | `/cadastrar-negocio` |
| "testar o chat online" | Destaque (ação secundária) | `/chatbot` |
| "testar agora →" | Como funciona | `/chatbot` |
| "Enviar e-mail" | Área de contato | `mailto:contato@tinosnegocios.com.br` |

## ComingSoonPage

- **Inputs** (via `withComponentInputBinding()` a partir de `route.data`):
  `featureName: string` (obrigatório).
- **Exibe**: título "{featureName} — em breve", texto "Estamos preparando este recurso. Volte em
  breve!" e botão "Voltar para a página inicial" → `/`.
- **Regra**: nunca página em branco; todo texto em português.

## Evolução prevista (fora do escopo)

Quando as features de cadastro/chatbot existirem, apenas o `loadComponent` das rotas
`/cadastrar-negocio` e `/chatbot` muda. Os itens "meus negócios" e "sair" entram no cabeçalho com a
feature de autenticação (FR-004).
