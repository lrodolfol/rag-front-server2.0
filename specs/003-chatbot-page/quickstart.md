# Quickstart: Página do Chatbot (/chatbot)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Pré-requisitos

- `npm install`
- Backend UAT rodando em `http://127.0.0.1:8000/chat` (POST, resposta em fluxo `data: {...}`).

## Verificações automáticas

```bash
npm test                 # Vitest: parser, mapper, serviço, store, componentes, rotas
npm run lint:colors      # nenhuma cor fora de src/styles/_tokens.scss
npm run lint:contrast    # contraste dos tokens novos (#07150E sobre #FFFFFF etc.)
npx ng build             # build de produção dentro dos orçamentos
```

Checagem de console (deve retornar nada):

```bash
grep -rn "console\." src/app/features/chatbot src/app/core
```

## Rodando localmente

```bash
npm start                # http://localhost:4200/chatbot
```

### Se o navegador acusar CORS

O backend precisa permitir a origem `http://localhost:4200`. Se não for possível alterar o backend,
crie `proxy.conf.json` na raiz:

```json
{ "/chat": { "target": "http://127.0.0.1:8000", "secure": false, "changeOrigin": true } }
```

adicione `"proxyConfig": "proxy.conf.json"` em `serve.configurations.development` no `angular.json`
e use `chatApiUrl: '/chat'` em `environment.development.ts`.

## Roteiro de teste manual (DevTools aberto nas abas Console e Network)

| # | Passo | Esperado | Requisito |
|---|-------|----------|-----------|
| 1 | Abrir `/` e clicar "testar o chat online" | Abre `/chatbot` com saudação, "experimente:" e 6 sugestões; cabeçalho com "início" e "cadastrar" | FR-001/002/007/008/025 |
| 2 | Digitar "procuro restaurantes para comer com a familia" + Enter | Balão do visitante com HH:mm; campo vazio e desabilitado; indicador "digitando" | FR-011/014/015 |
| 3 | Aguardar | Cada resposta surge em balão próprio, uma a uma; lista rola até a última | FR-016/018 |
| 4 | Fim do fluxo | Indicador some; campo habilitado e com foco; sugestões não aparecem mais | FR-010/017 |
| 5 | Network → payload das duas requisições | Mesmo `user_code` | FR-013 |
| 6 | Tentar digitar 60 caracteres / colar texto longo | Para em 50; contador `50/50` | FR-012 |
| 7 | Shift+Enter | Quebra de linha, sem envio | FR-011 |
| 8 | Parar o backend e enviar | "Não consegui responder agora…"; campo liberado | FR-022 |
| 9 | Provocar 429 (enviar até o limite do backend) | Texto do backend; campo, botão e sugestões desabilitados com aviso; novo envio não gera requisição no Network | FR-021 |
| 10 | Clicar "início" e voltar ao chat | Conversa reiniciada (boas-vindas) | FR-026 |
| 11 | Recarregar a página | Conversa perdida; chat liberado de novo | FR-026 |
| 12 | Largura 320 px (modo responsivo) | Sem rolagem horizontal; campo visível | FR-006 |
| 13 | Console durante todo o roteiro | Vazio | FR-024 |
| 14 | Leitor de tela (NVDA/VoiceOver) | Novas respostas anunciadas; botão "Enviar mensagem" rotulado | FR-029 |
