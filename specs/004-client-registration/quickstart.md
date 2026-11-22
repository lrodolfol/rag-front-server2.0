# Quickstart: validar o cadastro de clientes

**Feature**: [spec.md](./spec.md) | Contratos: [auth-register-api](./contracts/auth-register-api.md),
[register-ui](./contracts/register-ui.md), [routes](./contracts/routes.md)

## Pré-requisitos

- Node + dependências instaladas (`npm install`).
- Backend de autenticação UAT rodando em `http://localhost:5170` com CORS liberado para
  `http://localhost:4200`.
  - **Plano B (sem CORS)**: criar `proxy.conf.json` com `{"/api": {"target": "http://localhost:5170",
    "secure": false}}`, apontar `serve.options.proxyConfig` em `angular.json` para ele e usar
    `authApiUrl: '/api/v1/auth'` em `environment.development.ts` (research R-08).

## Verificações automáticas

```bash
npm test                 # unitários + integração (Vitest/jsdom)
npm run build            # build de produção sem erros e dentro dos budgets
npm run lint:colors      # nenhum hexadecimal fora de _tokens.scss
npm run lint:contrast    # contraste AA dos tokens
```

Esperado: tudo verde. Os testes cobrem validadores, mappers, `AuthApiService`
(`HttpTestingController`), `RegistrationStore` (transições, timeout de 30 s, duplo envio,
cancelamento), `RegisterForm`, `RegisterPage`, cabeçalho da landing e rotas.

## Roteiro manual (`npm start` → `http://localhost:4200`, DevTools aberto)

| # | Passo | Resultado esperado | Req. |
|---|-------|--------------------|------|
| 1 | Abrir `/` | Cabeçalho mostra "testar chatbot" e, ao lado, "registrar" com ícone | FR-001 |
| 2 | Clicar em "registrar" | Vai para `/register`; aba "Cadastro — AchaLocal"; cabeçalho com "início" | FR-002–004 |
| 3 | Clicar em "criar minha conta" com tudo vazio | "Campo obrigatório" nos 3 campos; foco em "Seu nome"; nenhuma requisição na aba Network | FR-009/010 |
| 4 | E-mail `maria@`, sair do campo | "Informe um e-mail válido" | FR-008 |
| 5 | Senha `abcdefgh` / `1234567` / `12345678` | mensagem de número / tamanho / letra | FR-007 |
| 6 | Clicar no olho da senha | alterna visível/oculta; leitor anuncia "Mostrar/Ocultar senha" | FR-011 |
| 7 | Dados válidos com `"  Maria  "` e `" Maria@Example.COM "`, enviar | Payload `{"Name":"Maria","Email":"maria@example.com","Password":…}`; campos e botão bloqueados; spinner ao lado do botão | FR-012–014 |
| 8 | Duplo clique rápido no botão | apenas 1 requisição | FR-013 |
| 9 | Resposta 201 | aviso verde com a mensagem do serviço; formulário vazio; continua em `/register` | FR-015 |
| 10 | Repetir o mesmo e-mail (409) | erro no campo E-mail com o texto do serviço; foco no campo; nome mantido | FR-016/019 |
| 11 | Forçar 400 (ex.: remover a validação no cliente via teste ou usar API que rejeite) | aviso vermelho "Um ou mais campos são inválidos." + mensagem no campo correspondente | FR-017 |
| 12 | Parar o backend e enviar | aviso vermelho genérico; formulário liberado com os dados | FR-018/019 |
| 13 | Backend lento (> 30 s) | mesmo aviso genérico após 30 s | FR-018 |
| 14 | Enviar e sair da página antes da resposta | nenhum erro visível nem no console | edge case |
| 15 | Em todo o roteiro | console vazio; senha ausente da URL, `localStorage` e `sessionStorage` | FR-020/021, SC-005 |
| 16 | DevTools em 320 px e 1920 px | sem rolagem horizontal; campos com largura total no celular | FR-005, SC-006 |
| 17 | Só teclado: Tab por todos os controles e Enter para enviar | ordem nome → e-mail → senha → olho → botão; envio funciona | FR-022 |
