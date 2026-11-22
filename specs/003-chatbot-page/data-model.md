# Data Model: Página do Chatbot (/chatbot)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-21

Todos os dados vivem em memória enquanto a página está aberta. Nada é persistido.

## DTOs (contrato com o serviço — `features/chatbot/models/`)

### `ChatRequestDto`

| Campo | Tipo | Regra |
|-------|------|-------|
| `message` | `string` | texto do visitante após `trim`; 1–50 caracteres |
| `user_code` | `string` | UUID gerado ao criar a sessão; igual em todas as mensagens da visita |

### `ChatStreamChunkDto`

| Campo | Tipo | Regra |
|-------|------|-------|
| `message` | `string` | não vazio; qualquer outro formato é descartado (type guard `isChatStreamChunk`) |

## Modelos internos

### `ChatStreamEvent` (saída do `ChatApiService`)

```ts
type ChatStreamEvent =
  | { readonly type: 'chunk'; readonly text: string }
  | { readonly type: 'done' };
```

### `ChatFailure` (saída do `ChatErrorMapper`)

```ts
interface ChatFailure {
  readonly kind: 'rate-limited' | 'server-message' | 'generic';
  readonly text: string; // sempre em linguagem natural, sem status/código/stack
}
```

### `ChatMessage` (modelo de apresentação)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `number` | sequencial na sessão (usado no `track`) |
| `author` | `'visitor' \| 'assistant'` | define o lado do balão |
| `kind` | `'text' \| 'warning' \| 'error'` | `warning` = limite de uso; `error` = demais falhas e "sem resultados" |
| `text` | `string` | exibido como texto puro, `white-space: pre-line` |
| `sentAt` | `Date` | exibido como `HH:mm` (`DatePipe`, locale pt-BR) |

Distinto de `features/landing/models/chat-message.ts` (simulação estática da landing).

### `ChatStatus`

`'idle' | 'waiting' | 'blocked'`

## `ChatSessionStore` (estado + regras)

| Membro | Tipo | Descrição |
|--------|------|-----------|
| `userCode` | `string` (readonly) | `crypto.randomUUID()` na criação |
| `messages` | `Signal<readonly ChatMessage[]>` | conversa da visita |
| `status` | `Signal<ChatStatus>` | estado atual |
| `hasStarted` | `computed<boolean>` | `messages().length > 0` → esconde sugestões |
| `canSend` | `computed<boolean>` | `status() === 'idle'` |
| `isWaiting` | `computed<boolean>` | `status() === 'waiting'` → indicador de digitação |
| `isBlocked` | `computed<boolean>` | `status() === 'blocked'` → aviso de bloqueio |
| `send(text: string)` | `void` | regras abaixo |

### Regras de `send(text)`

1. `trimmed = text.trim()`; ignora se vazio, se `> 50` caracteres ou se `!canSend()`.
2. Adiciona `ChatMessage { author: 'visitor', kind: 'text' }` e muda `status` para `waiting`
   (síncrono → impede duplo envio).
3. Assina `ChatApiService.send({ message: trimmed, user_code })` com `takeUntilDestroyed`:
   - `chunk` → adiciona `ChatMessage { author: 'assistant', kind: 'text' }`, conta respostas;
   - `done` → se nenhuma resposta: adiciona aviso "Não encontrei resultados para isso. Tente
     descrever de outro jeito."; `status = 'idle'`;
   - erro → `mapChatError`; adiciona `ChatMessage { author: 'assistant', kind: 'warning' | 'error',
     text: failure.text }`; `status = 'blocked'` se `rate-limited`, senão `idle`. Respostas já
     adicionadas permanecem.

### Máquina de estados

```text
           send()                    done / erro não-429 / timeout / vazio
  idle ─────────────► waiting ─────────────────────────────────────────► idle
                         │
                         │ erro 429
                         ▼
                      blocked   (terminal até recarregar/reabrir a página;
                                 send() é ignorado → nenhuma requisição)
```

## Conteúdo estático (`chatbot-content.ts`)

| Constante | Valor |
|-----------|-------|
| `ASSISTANT_NAME` | `AchaLocalBot` |
| `WELCOME_TITLE` | `👋 Olá! Eu sou o AchaLocalBot` |
| `WELCOME_TEXT` | `Como posso ajudar você hoje? Digite sua pergunta abaixo.` |
| `SUGGESTIONS_LABEL` | `experimente:` |
| `SUGGESTIONS` | `estou com fome`, `preciso reformar minha casa`, `onde comprar roupas novas?`, `quero cortar cabelo`, `quero aprender inglês`, `manutenção de celular` |
| `MESSAGE_MAX_LENGTH` | `50` |
| `RESPONSE_TIMEOUT_IN_MILLISECONDS` | `60000` |
| `GENERIC_ERROR_TEXT` | `Não consegui responder agora. Tente novamente em instantes.` |
| `EMPTY_RESULT_TEXT` | `Não encontrei resultados para isso. Tente descrever de outro jeito.` |
| `RATE_LIMIT_FALLBACK_TEXT` | `Você atingiu o limite de mensagens. Tente novamente mais tarde.` |
| `BLOCKED_HINT_TEXT` | `Limite de mensagens atingido. Recarregue a página mais tarde para continuar.` |
| `ASSISTANT_STATUS_TEXT` | `online` |
| `TYPING_INDICATOR_LABEL` | `AchaLocalBot está digitando` (somente leitor de tela) |
| `MESSAGE_INPUT_LABEL` | `Digite sua pergunta` |
| `SEND_BUTTON_LABEL` | `Enviar mensagem` |
| `CONVERSATION_LABEL` | `Conversa com o AchaLocalBot` |
| `CHATBOT_NAVIGATION_ITEMS` | `início` (`home` → `/`), `cadastrar` (`add_business` → `/cadastrar-negocio`) |
