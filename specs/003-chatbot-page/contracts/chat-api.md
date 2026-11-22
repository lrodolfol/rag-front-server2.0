# Contract: Serviço de recomendação (chat)

**Feature**: [../spec.md](../spec.md) | **Fonte**: `.mine/chat-bot-page/plan.md`

## Endpoint

| Ambiente | URL | Origem do valor |
|----------|-----|-----------------|
| Desenvolvimento / UAT | `http://127.0.0.1:8000/chat` | `src/environments/environment.development.ts` |
| Produção | ainda não existe — placeholder `/chat` | `src/environments/environment.ts` |

Método: `POST` · Autenticação: nenhuma · `Content-Type: application/json`

## Requisição

```json
{
  "message": "procuro restaurantes para comer com a familia",
  "user_code": "3f1c9a2e-8d7b-4c55-9a0e-6b2f1d4e7a90"
}
```

- `message`: 1–50 caracteres, sem espaços nas pontas.
- `user_code`: UUID gerado ao abrir a página; mesmo valor em todas as mensagens da visita.

## Resposta de sucesso (200, fluxo contínuo)

Corpo em texto, uma resposta por linha, chegando ao longo do tempo:

```text
data: {"message": "Localizei certas respostas relacionadas à sua busca."}
data: {"message": "O Sabor da Roça oferece refeições caseiras e comida típica mineira. Fica na Rua das Flores, 120, e também atende pedidos para retirada e entrega."}
```

Regras do cliente:

- Cada linha `data: {json}` completa com `message` string não vazia vira **um** balão do assistente,
  exibido assim que chega, na ordem de chegada.
- Linhas vazias, linhas sem prefixo `data:`, JSON inválido ou objetos sem `message` string são
  ignorados sem aviso.
- O fim da resposta HTTP = fim do processamento. Se nenhuma linha válida chegou, o cliente exibe o
  aviso de "sem resultados".
- Mais de 60 s sem receber dados = falha genérica; o fluxo é cancelado.

## Respostas de erro

| Situação | Exibição ao visitante | Estado após |
|----------|-----------------------|-------------|
| `429 Too Many Requests` | texto do corpo (`message` ou `detail`); se ilegível, texto padrão de limite | **bloqueado** — nenhuma nova requisição até recarregar/reabrir a página |
| Outro status 4xx/5xx com texto legível no corpo | o texto do corpo | liberado para nova tentativa |
| Corpo sem texto legível, rede indisponível (status 0), timeout, fluxo interrompido | "Não consegui responder agora. Tente novamente em instantes." | liberado; respostas já recebidas permanecem |

Corpo de erro aceito (qualquer um):

```json
{ "message": "Você atingiu o limite de perguntas por hoje." }
{ "detail": "Você atingiu o limite de perguntas por hoje." }
```

ou texto puro curto (≤ 300 caracteres, sem `<`).

**Nunca exibidos**: código/status HTTP, stack trace, URL, nomes de exceção. **Nunca logados** no
console do navegador.

## Mapeamento para o cliente

| Contrato | Tipo no front | Arquivo |
|----------|---------------|---------|
| corpo da requisição | `ChatRequestDto` | `features/chatbot/models/chat-request.dto.ts` |
| cada linha `data:` | `ChatStreamChunkDto` | `features/chatbot/models/chat-stream-chunk.dto.ts` |
| fluxo | `Observable<ChatStreamEvent>` | `features/chatbot/services/chat-api.service.ts` |
| erro | `ChatFailure` | `features/chatbot/services/chat-error.mapper.ts` |
