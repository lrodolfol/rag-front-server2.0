# Research: Página do Chatbot (/chatbot)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-21

Não restaram itens "NEEDS CLARIFICATION" no Technical Context. Os itens abaixo registram as decisões
técnicas tomadas para cumprir a spec, `.mine/chat-bot-page/plan.md` e a constitution.

## R-01 — Receber respostas em fluxo contínuo de um POST

- **Decision**: `HttpClient.post(url, body, { observe: 'events', reportProgress: true,
  responseType: 'text' })`. Com `provideHttpClient(withFetch())` (já em `app.config.ts`) cada
  `HttpDownloadProgressEvent` traz `partialText` = todo o texto recebido até o momento. O evento
  final `HttpResponse` (`body` completo) marca o fim do fluxo.
- **Rationale**: mantém o HTTP no `HttpClient` (Princípio III), testável com
  `HttpTestingController` (`req.event({ type: HttpEventType.DownloadProgress, loaded, partialText })`
  e `req.flush(...)`), cancelável por unsubscribe (aborta o `fetch`), sem dependência nova.
- **Alternatives considered**: `EventSource` (só GET — rejeitado); `fetch` + `ReadableStream`
  manual (sai do `HttpClient`, perde interceptors e `HttpTestingController` — rejeitado); bibliotecas
  SSE como `@microsoft/fetch-event-source` (dependência nova — rejeitado, Princípio VII).

## R-02 — Interpretar as linhas `data:`

- **Decision**: classe pura `StreamDataParser` com estado interno (`consumedLength`). A cada
  `partialText`, pega só o trecho novo, separa por `\n` (aceitando `\r\n`), guarda a última linha
  incompleta, e para cada linha completa que começa com `data:` remove o prefixo, faz `JSON.parse`
  em `try/catch` e aceita apenas objetos com `message` string não vazia (type guard
  `isChatStreamChunk`). Linhas vazias, comentários (`:`), JSON inválido ou formato inesperado são
  descartados silenciosamente. No `HttpResponse` final, `flush(body)` processa o resto, inclusive
  a última linha sem `\n`.
- **Rationale**: o fluxo pode chegar fatiado no meio de uma linha; o offset evita reprocessar e
  duplicar balões. Função pura = fácil de testar.
- **Alternatives considered**: reprocessar o `partialText` inteiro a cada evento e deduplicar por
  índice (O(n²) e frágil — rejeitado).

## R-03 — Tempo máximo de espera (60 s)

- **Decision**: `timeout({ each: 60_000 })` no Observable do serviço (entre eventos: primeiro byte
  e cada resposta seguinte). `TimeoutError` → falha genérica.
- **Rationale**: FR-022; um fluxo longo e saudável não é cortado enquanto continuar enviando dados.
- **Alternatives considered**: `first: 60_000` (não detecta fluxo travado no meio — rejeitado).

## R-04 — Mensagens de erro do serviço

- **Decision**: `mapChatError(error: unknown): ChatFailure`:
  - `HttpErrorResponse` com `status === 429` → `kind: 'rate-limited'`;
  - outros `HttpErrorResponse` com texto legível → `kind: 'server-message'`;
  - qualquer outra coisa (status 0/rede, `TimeoutError`, corpo ilegível) → `kind: 'generic'`.
  Texto legível: corpo (string, pois `responseType: 'text'`) parseado com `JSON.parse` seguro;
  usa `message`, senão `detail` (padrão FastAPI), se for string não vazia; se o corpo não for JSON
  mas for texto curto (≤ 300 caracteres) sem marcação `<`, usa o próprio texto. Para 429 sem texto
  legível → texto padrão "Você atingiu o limite de mensagens. Tente novamente mais tarde.".
  Status, stack e nomes técnicos nunca entram no `text`.
- **Rationale**: plan.md exige a mensagem original em linguagem natural; o formato do corpo de erro
  não está documentado, então o mapper é tolerante.
- **Alternatives considered**: mostrar `error.message` do Angular (contém URL e status — proibido).

## R-05 — URL do serviço por ambiente e CORS

- **Decision**: `src/environments/environment.ts` (`chatApiUrl: '/chat'` — placeholder de produção,
  ainda inexistente) e `environment.development.ts` (`chatApiUrl: 'http://127.0.0.1:8000/chat'`),
  com `fileReplacements` na configuração `development` do `angular.json` (o `ng serve` usa
  `development` por padrão). Valor exposto por `InjectionToken` `CHAT_API_URL` provido em
  `app.config.ts`; testes injetam um valor próprio.
- **CORS**: o dev server roda em `http://localhost:4200`; o backend UAT precisa responder com
  `Access-Control-Allow-Origin` para essa origem. Se não responder, alternativa documentada no
  quickstart: `proxy.conf.json` (`/chat` → `http://127.0.0.1:8000`) e `chatApiUrl: '/chat'`. O
  proxy não é criado por padrão (YAGNI) — só se o teste manual falhar por CORS.
- **Alternatives considered**: URL fixa no serviço (não configurável — rejeitado); carregar
  `config.json` em runtime (mais complexo do que o necessário hoje — rejeitado).

## R-06 — Identificador do visitante (`user_code`)

- **Decision**: `crypto.randomUUID()` chamado uma vez na criação do `ChatSessionStore`.
- **Rationale**: aleatório e único, nativo nos navegadores alvo (contexto seguro: `localhost` e
  HTTPS). Não persistido (spec FR-013).
- **Alternatives considered**: `Math.random` (baixa unicidade — rejeitado); pacote `uuid`
  (dependência nova — rejeitado).

## R-07 — Escopo e ciclo de vida do estado

- **Decision**: `ChatSessionStore` (`@Injectable()`, sem `providedIn`) declarado em
  `providers` do `ChatbotPage`. Ele injeta `DestroyRef` e assina o fluxo com
  `takeUntilDestroyed(destroyRef)`.
- **Rationale**: sair de `/chatbot` destrói o store → conversa descartada (FR-026), requisição em
  andamento abortada sem erro visível (FR-027); voltar à página gera novo `user_code` e tela de
  boas-vindas. Componentes não assinam Observables (Princípio I).
- **Alternatives considered**: store `providedIn: 'root'` (sobreviveria à navegação, contrariando
  FR-026 — rejeitado).

## R-08 — Zero saída no console

- **Decision**: o pipeline do store termina em `catchError` que converte qualquer erro em
  `ChatFailure` e completa; nenhum erro chega ao `ErrorHandler` global (que loga no console via
  `provideBrowserGlobalErrorListeners`). Nenhum `console.*` no código da feature; revisão inclui
  `grep "console\." src/app/features/chatbot`.
- **Alternatives considered**: `ErrorHandler` customizado silencioso (mascara bugs de toda a app —
  rejeitado).

## R-09 — Campo de mensagem e envio

- **Decision**: `FormControl<string>` não nulo com `Validators.maxLength(50)` + atributo
  `maxlength="50"` (impede digitar/colar além do limite) em `<textarea matInput
  cdkTextareaAutosize cdkAutosizeMaxRows="3">`; `mat-hint align="end"` com contador `n/50`
  (via `toSignal(control.valueChanges)`). Enter (sem Shift) → `preventDefault` + emitir `send`;
  Shift+Enter → quebra de linha padrão. Botão `mat-icon-button` com ícone `send` e
  `aria-label="Enviar mensagem"`. Desabilitado quando texto (após `trim`) vazio ou `canSend()`
  falso. `control.disable()`/`enable()` acompanham o estado do store via `effect`.
- **Rationale**: Reactive Forms (constitution V), Material, acessível por teclado. Duplo envio
  evitado porque o store muda para `waiting` de forma síncrona no `send`.

## R-10 — Rolagem automática e acessibilidade

- **Decision**: lista com `role="log"` e `aria-live="polite"` (FR-029); `viewChild('end')` num
  elemento sentinela ao final e `afterRenderEffect` que, quando `messages().length` ou o indicador
  mudam, chama `scrollIntoView({ block: 'end' })` (em jsdom o método não existe → teste usa stub).
  Foco volta ao campo quando o status passa de `waiting` para `idle` (`effect` no composer +
  `viewChild` do textarea `.focus()`).
- **Rationale**: única manipulação de DOM, justificada em Complexity Tracking.

## R-11 — Ícones e cores

- **Decision**: adicionar `home.svg` e `send.svg` (Material Symbols, `fill="currentColor"`) a
  `public/icons/` e a `APP_ICON_NAMES`; reutilizar `storefront` (avatar do bot e marca),
  `add_business` (cadastrar). Tokens novos em `_tokens.scss`:
  `--app-color-chat-window: #f3f2e9`, `--app-color-chat-bubble: #ffffff`,
  `--app-color-chat-text: #07150e`. Avisos usam tokens existentes
  `--app-color-warning-bg/-text` (429) e `--app-color-error-bg/-text` (demais erros).
  Indicador "online": texto branco (`--app-color-on-primary`) sobre o cabeçalho verde.
- **Rationale**: mesma estratégia de ícones da feature 002 (R-01 dela); cores do plan.md
  centralizadas; `npm run lint:contrast` valida `#07150E` sobre `#FFFFFF`.

## R-12 — Indicador de "digitando"

- **Decision**: balão do assistente com três pontos animados via CSS (`@keyframes`, respeitando
  `prefers-reduced-motion`) e texto oculto para leitor de tela "AchaLocalBot está digitando".
- **Alternatives considered**: `MatProgressSpinner`/`MatProgressBar` (visual menos próximo de um
  chat real; mantido como opção se o CSS estourar o orçamento de estilo).
