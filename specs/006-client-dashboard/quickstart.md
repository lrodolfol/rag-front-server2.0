# Quickstart: validar a área do cliente

**Feature**: [spec.md](./spec.md) | Contratos: [business-api](./contracts/business-api.md),
[access-control](./contracts/access-control.md), [dashboard-ui](./contracts/dashboard-ui.md),
[routes](./contracts/routes.md) | Modelo: [data-model](./data-model.md)

## Pré-requisitos

- Node + dependências instaladas (`npm install`).
- Backend UAT em `http://localhost:5170` com CORS liberado para `http://localhost:4200`, **incluindo
  o cabeçalho `Authorization`** (preflight `OPTIONS`). Plano B: proxy do dev server (research R-09).
- Duas contas com e-mail confirmado: **A** com negócio cadastrado e **B** sem negócio.
- Confirmar com o backend como responde "cliente sem negócio" (404 ou `200` + `data: null`, R-04).

## Verificações automáticas

```bash
npm test                 # unitários + integração (Vitest/jsdom)
npm run build            # build de produção sem erros e dentro dos budgets
npm run lint:colors      # nenhum hexadecimal fora de _tokens.scss
npm run lint:contrast    # contraste AA dos tokens
```

Esperado: tudo verde. Cobertura: guard, interceptor, `AuthRedirectService`, `BusinessApiService`,
mapper, `DashboardStore`, subcomponentes, `DashboardPage`, `SiteHeader`, rotas; testes das features
004/005 continuam passando com o interceptor registrado.

## Roteiro manual (`npm start` → `http://localhost:4200`, DevTools: Console, Network, Application)

| # | Passo | Esperado | Requisitos |
|---|-------|----------|------------|
| 1 | Aba nova, abrir `/dashboard` direto | vai para `/login`, nada da área do cliente aparece | FR-001–003, SC-001 |
| 2 | Em Application → Session Storage, editar `achalocal.auth-session` com `expiresAt` no passado; abrir `/dashboard` | vai para `/login`; chave removida | US1-2 |
| 3 | Mesmo, com JSON inválido | vai para `/login`; chave removida | US1-3 |
| 4 | Login com a conta **A** | `/dashboard`: spinner, depois cartão com nome, "Editar" e ícone de excluir; sem "Novo negócio" | US2, FR-010/011 |
| 5 | Network: requisição `GET …/api/v1/{clientId}/business` | cabeçalho `Authorization: Bearer …`; token não aparece na URL | FR-018/019 |
| 6 | Clicar "Editar" / ícone excluir | páginas "em breve" de edição/exclusão | FR-013 |
| 7 | "Sair" | volta à tela inicial; sessão removida; botão voltar → `/login` | FR-017, SC-004 |
| 8 | Login com a conta **B** | estado vazio + "Novo negócio"; ambos levam a `/cadastrar-negocio` | US3, SC-003 |
| 9 | Parar o backend e recarregar `/dashboard` | mensagem de erro fixa + "Tentar novamente"; religar o backend e tentar → carrega | US4, SC-005 |
| 10 | Com a página aberta, alterar `expiresAt` para o passado e clicar "Tentar novamente" | vai para `/login` sem mensagem técnica | US1-5, FR-004 |
| 11 | "Testar Chatbot" e "Abrir o chat" | `/chatbot`; Network: requisição do chat **sem** `Authorization` | FR-015/016, R-02 |
| 12 | Responsivo 320 px, 768 px, 1920 px | sem rolagem horizontal; título/botão empilham < 600 px | FR-008, SC-007 |
| 13 | Navegar só por teclado; leitor de tela no carregamento/erro | todos os controles focáveis; estados anunciados | FR-021 |
| 14 | Console durante todo o roteiro | vazio | FR-020 |
| 15 | Application → Local Storage | nenhuma chave de sessão/token | SC-006 |
