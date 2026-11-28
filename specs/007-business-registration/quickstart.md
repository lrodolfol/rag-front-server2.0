# Quickstart: validar o cadastro de negócio

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Pré-requisitos

- Node/npm do projeto; `npm install` executado.
- Backend UAT em `http://localhost:5170` com `/api/v1/auth/*` e `/api/v1/{clientId}/business`
  (`GET` e `POST`), CORS liberado para `http://localhost:4200` com `Authorization` e
  `Content-Type: application/json`.
- Duas contas de cliente: **A** sem negócio e **B** com negócio.

## Verificações automatizadas

```bash
npm test               # ng test (Vitest + jsdom) — todos os specs verdes
npm run lint:colors    # nenhum hex fora dos tokens
npm run lint:contrast  # contraste AA
npm run build          # sem erros nem estouro de orçamento de estilo
```

## Cenários manuais (`npm start` → http://localhost:4200)

| # | Passos | Resultado esperado | Ref. |
|---|--------|--------------------|------|
| 1 | Sem sessão, abrir `/dashboard/new` | vai para `/login`, formulário nunca aparece | US4 |
| 2 | Abrir `/cadastrar-negocio` sem sessão | `/dashboard/new` → `/login` | routes.md |
| 3 | Login com **A** → "Cadastrar agora" (ou "Novo negócio") | `/dashboard/new`; spinner breve; formulário do esboço | US1-1 |
| 4 | Clicar "Cadastrar negócio" com tudo vazio | nada é enviado (aba Network); Nome, Descrição completa e Endereço com "Campo obrigatório."; foco no Nome | US2-1 |
| 5 | E-mail `abc`, sair do campo | "Informe um e-mail válido." | US2-2 |
| 6 | Telefone: digitar `11987654321`; colar `+55 11 98765-4321` | `(11) 98765-4321`; colagem com 13 dígitos fica inválida "Informe um telefone válido com DDD." | FR-007a |
| 7 | Rolar a página até o topo e até o fim (desktop e 320 px) | barra com "Cadastrar negócio" sempre visível; último campo não fica coberto | decisão do usuário |
| 8 | Preencher dados válidos (payload do usuário), clicar duas vezes em "Cadastrar negócio" | 1 único `POST /api/v1/{clientId}/business` com `Authorization: Bearer`, corpo com `detalhes`, `telephone` só com dígitos (ex.: `35995678901`), opcionais vazios `null`; vai para `/dashboard`, cartão do negócio + snackbar "Negócio cadastrado com sucesso." que some em ~5 s | US1-2/3, SC-007 |
| 9 | Após 8, botão voltar do navegador / F5 no dashboard | não volta ao formulário; aviso não reaparece | US3-4, FR-015 |
| 10 | Login com **B**, abrir `/dashboard/new` pela URL | spinner → `/dashboard` sem ver o formulário | US3-1 |
| 11 | Backend parado, abrir `/dashboard/new` | mensagem de verificação + "Tentar novamente" | US3-3 |
| 12 | Formulário preenchido, backend parado, enviar | "Não foi possível cadastrar seu negócio agora..." e dados mantidos | US5-1 |
| 13 | Backend devolvendo 400 | "Verifique os dados informados e tente novamente.", nenhum campo destacado | US5-2 |
| 14 | Duas abas em `/dashboard/new` com **A**; cadastrar na 1ª, enviar na 2ª | 2ª: snackbar "Você já possui um negócio cadastrado." + `/dashboard` (requer 409 do backend) | US5-3 |
| 15 | Digitar algo e clicar "← Voltar" | diálogo; "Continuar editando" mantém dados; "Descartar" vai a `/dashboard` | US1-5 |
| 16 | Sem digitar nada, "← Voltar" | `/dashboard` direto | US1-4 |
| 17 | Apagar o token da sessão (DevTools → sessionStorage) com o formulário aberto e enviar | `/login` | US4-2 |
| 18 | Console do navegador durante todos os cenários | vazio | FR-023 |

Contratos de referência: [business-registration-api.md](./contracts/business-registration-api.md),
[business-registration-ui.md](./contracts/business-registration-ui.md),
[routes.md](./contracts/routes.md).

## Plano B para CORS

Se o UAT não liberar o preflight, usar proxy do dev server (como nas features 004–006) apontando
`/api/v1` para `http://localhost:5170`.
