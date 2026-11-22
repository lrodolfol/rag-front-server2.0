# Quickstart: validar o login de clientes

**Feature**: [spec.md](./spec.md) | Contratos: [auth-login-api](./contracts/auth-login-api.md),
[auth-session](./contracts/auth-session.md), [login-ui](./contracts/login-ui.md),
[routes](./contracts/routes.md) | Modelo: [data-model](./data-model.md)

## Pré-requisitos

- Node + dependências instaladas (`npm install`).
- Backend de autenticação UAT em `http://localhost:5170` com CORS liberado para
  `http://localhost:4200` (plano B com proxy: ver quickstart da feature 004 / research R-09).
- Uma conta já cadastrada **com e-mail confirmado** e outra **sem confirmação** (pode ser criada em
  `/register`).

## Verificações automáticas

```bash
npm test                 # unitários + integração (Vitest/jsdom) — inclui os testes do cadastro após a refatoração
npm run build            # build de produção sem erros e dentro dos budgets
npm run lint:colors      # nenhum hexadecimal fora de _tokens.scss
npm run lint:contrast    # contraste AA dos tokens
```

Esperado: tudo verde. Cobertura: `AuthSessionService`, `api-response-body`, mappers do login,
`AuthApiService.login` (`HttpTestingController`), `LoginStore` (transições, timeout 30 s, duplo
envio, cancelamento, redirecionamento), `LoginForm`, `LoginPage`, cabeçalho da landing, rotas — e
todos os specs do cadastro continuam passando com os imports novos.

## Roteiro manual (`npm start` → `http://localhost:4200`, DevTools aberto: Console, Network, Application)

| # | Passo | Resultado esperado | Req. |
|---|-------|--------------------|------|
| 1 | Abrir `/` | Cabeçalho: "testar chatbot", "registrar", "login" (com ícone) | FR-001 |
| 2 | Clicar em "login" | `/login`; aba "Login — AchaLocal"; cabeçalho com "início"; layout igual ao cadastro | FR-002–006 |
| 3 | Clicar em "entrar" com tudo vazio | "Campo obrigatório" nos 2 campos; foco em "E-mail"; nenhuma requisição | FR-008/009 |
| 4 | E-mail `maria@`, sair do campo | "Informe um e-mail válido" | FR-007 |
| 5 | Senha `a` | aceita (sem regra de composição) | FR-007 |
| 6 | Clicar no olho | senha alterna visível/oculta; rótulo "Mostrar/Ocultar senha" | FR-010 |
| 7 | `" Maria@Example.COM "` + senha correta, Enter | Payload `{"Email":"maria@example.com","Password":…}`; campos/botão bloqueados; spinner ao lado de "entrar" | FR-011–013 |
| 8 | Duplo clique rápido em "entrar" | apenas 1 requisição | FR-012 |
| 9 | Resposta 200 | vai para `/dashboard` ("Área do cliente — em breve"), sem mensagem; Application → Session Storage contém `achalocal.auth-session` com `accessToken`, `tokenType`, `expiresAt`, `clientId`; Local Storage sem token | FR-014, FR-021 |
| 10 | F5 em `/dashboard`, depois fechar a aba e abrir outra | sessão continua após F5; some após fechar a aba | FR-015 |
| 11 | Voltar a `/login`, senha errada | aviso vermelho "E-mail ou senha inválidos."; e-mail mantido; senha vazia; formulário liberado | FR-016, FR-018 |
| 12 | Digitar em qualquer campo | aviso some | FR-019 |
| 13 | Conta sem e-mail confirmado | aviso com a mensagem do 403 | FR-016 |
| 14 | Parar o backend e enviar | "Não foi possível entrar agora. Tente novamente em instantes." | FR-017 |
| 15 | Network throttling "Offline"/atraso > 30 s | mesma mensagem genérica após 30 s; formulário liberado | FR-017 |
| 16 | Enviar e clicar em "início" antes da resposta | volta à landing; nenhuma sessão salva; nada no console | Edge case |
| 17 | Durante todo o roteiro | Console vazio; senha nunca na URL/storage | FR-020–022 |
| 18 | Largura 320 px | sem rolagem horizontal | SC-007 |
| 19 | Teclado: Tab/Shift+Tab/Enter; leitor de tela | todos os controles alcançáveis; aviso anunciado | FR-023 |
