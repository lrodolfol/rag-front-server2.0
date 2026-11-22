---

description: "Task list for feature 003-chatbot-page"
---

# Tasks: Página do Chatbot (/chatbot)

**Input**: Design documents from `/specs/003-chatbot-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.md, contracts/routes.md, quickstart.md

**Tests**: Incluídos — exigidos pela Constitution (Princípio VI: regras de negócio com testes unitários, serviço HTTP com `HttpTestingController`, componentes com testes dos principais comportamentos, fluxo crítico com teste de integração). Vitest + jsdom via `ng test`; `npm run lint:colors` e `npm run lint:contrast`. Escrever cada spec ANTES da implementação correspondente e confirmar que falha.

**Organization**: Tasks agrupadas por user story (US1–US4 da spec.md) para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 conforme spec.md
- Projeto único: `src/` na raiz; arquivos estáticos em `public/`

**Regras transversais (valem para TODAS as tasks)**:
- Textos visíveis EXATAMENTE como em `data-model.md` (seção "Conteúdo estático") e spec.md, em pt-BR, vindos de `src/app/features/chatbot/chatbot-content.ts` (nunca literais nos templates). Nomes de código em inglês, sem abreviações.
- Componentes standalone, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`, sem `any`, sem `subscribe()` em componentes (só o `ChatSessionStore` assina), sem `::ng-deep`, sem `innerHTML`. Única manipulação de DOM permitida: `scrollIntoView` (T026) e `.focus()` no textarea (T028), ambas em `afterRenderEffect`/`effect` (plan.md Complexity Tracking).
- Cada componente em arquivos separados `.ts` / `.html` / `.scss` / `.spec.ts`; seletor com prefixo `app-`.
- Cores SOMENTE via `var(--app-color-*)` ou `var(--mat-sys-*)`; NENHUM hexadecimal/rgb fora de `src/styles/_tokens.scss`. Tokens novos permitidos: apenas os 3 de T005.
- Controles visuais com Angular Material (`MatToolbar`, `MatFormField`, `MatInput`, `CdkTextareaAutosize`, `MatIconButton`, `MatButton` — sugestões como `mat-stroked-button` em formato de pílula —, `MatIcon`). Ícones via `<mat-icon svgIcon="nome" aria-hidden="true">` com nomes do tipo `AppIconName`.
- Caminhos de rota SEMPRE via `AppPaths`/`toRouterLink` (`src/app/core/routing/app-paths.ts`).
- NENHUM `console.*` em código de produção (FR-024). Nenhum erro pode escapar para o `ErrorHandler` global (R-08).
- Estilo por componente abaixo de 4 kB (orçamento `anyComponentStyle`). Sem rolagem horizontal de 320 px a 1920 px.
- Testes de componente: `TestBed` com `provideRouter([])` e `MatIconTestingModule`; componentes que dependem do store recebem um store real com `CHAT_API_URL` de teste + `provideHttpClient()` + `provideHttpClientTesting()`, ou um stub tipado com os mesmos Signals. Horários verificados com `LOCALE_ID` `pt-BR` + `registerLocaleData(localePt)` (padrão de `plan-card.spec.ts`).
- Nenhuma dependência nova no `package.json`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ambientes, URL da API, ícones e tokens de cor

- [X] T001 [P] Criar `src/environments/environment.ts` com `export const environment = { chatApiUrl: '/chat' } as const;` (placeholder de produção — comentário de uma linha informando que o endpoint de produção ainda não existe) e `src/environments/environment.development.ts` com `export const environment = { chatApiUrl: 'http://127.0.0.1:8000/chat' } as const;` (R-05)
- [X] T002 Em `angular.json`, em `projects.*.architect.build.configurations.development`, adicionar `"fileReplacements": [{ "replace": "src/environments/environment.ts", "with": "src/environments/environment.development.ts" }]`. Não alterar a configuração `production`. Depende de T001
- [X] T003 [P] Criar `src/app/core/config/chat-api-url.token.ts` exportando `export const CHAT_API_URL = new InjectionToken<string>('CHAT_API_URL');`
- [X] T004 Em `src/app/app.config.ts`, adicionar ao array `providers` o item `{ provide: CHAT_API_URL, useValue: environment.chatApiUrl }` (import de `../environments/environment`). Manter `provideHttpClient(withFetch())` existente (necessário para `partialText` incremental — R-01). Depende de T001, T003
- [X] T005 [P] Em `src/styles/_tokens.scss`, adicionar um grupo `// Chat` dentro do `:root` com: `--app-color-chat-window: #f3f2e9;`, `--app-color-chat-bubble: #ffffff;`, `--app-color-chat-text: #07150e;` (R-11). Em `scripts/check-color-contrast.mjs`, acrescentar `'chat-window'`, `'chat-bubble'`, `'chat-text'` ao array `EXPECTED_TOKENS` e ao array `PAIRS` as entradas `['chat-text', 'chat-bubble', 4.5, 'texto normal']` e `['chat-text', 'chat-window', 4.5, 'texto normal']`. Rodar `npm run lint:contrast` e confirmar sucesso
- [X] T006 [P] Baixar `home` e `send` (Material Symbols Outlined, SVG 24px) para `public/icons/home.svg` e `public/icons/send.svg`, com o mesmo tratamento da feature 002 (sem `width`/`height` fixos, `fill="currentColor"` no `<svg>`)
- [X] T007 Em `src/app/core/icons/app-icon-name.ts`, acrescentar `'home'` e `'send'` ao array `APP_ICON_NAMES`; atualizar `src/app/core/icons/provide-app-icons.spec.ts` se ele enumerar nomes explicitamente. Depende de T006

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelos, conteúdo textual e mapper de erro usados por todas as stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase terminar

- [X] T008 [P] Criar os modelos em `src/app/features/chatbot/models/` (um arquivo cada, propriedades `readonly`, conforme data-model.md):
  - `chat-request.dto.ts`: `interface ChatRequestDto { readonly message: string; readonly user_code: string; }` — `message`: "texto do visitante após `trim`; 1–50 caracteres"; `user_code`: "UUID gerado ao criar a sessão; igual em todas as mensagens da visita" (comentário eslint-disable de naming apenas se o lint reclamar do snake_case, pois é o contrato do serviço)
  - `chat-stream-chunk.dto.ts`: `interface ChatStreamChunkDto { readonly message: string; }` + type guard `isChatStreamChunk(value: unknown): value is ChatStreamChunkDto` que aceita apenas objeto não nulo com `message` do tipo `string` e "não vazio" (após `trim`)
  - `chat-stream-event.ts`: `type ChatStreamEvent = { readonly type: 'chunk'; readonly text: string } | { readonly type: 'done' };`
  - `chat-failure.ts`: `type ChatFailureKind = 'rate-limited' | 'server-message' | 'generic';` e `interface ChatFailure { readonly kind: ChatFailureKind; readonly text: string; }` ("sempre em linguagem natural, sem status/código/stack")
  - `chat-message.ts`: `type ChatMessageAuthor = 'visitor' | 'assistant'; type ChatMessageKind = 'text' | 'warning' | 'error';` e `interface ChatMessage { readonly id: number; readonly author: ChatMessageAuthor; readonly kind: ChatMessageKind; readonly text: string; readonly sentAt: Date; }` (`warning` = limite de uso; `error` = demais falhas e "sem resultados"). NÃO reutilizar `features/landing/models/chat-message.ts`
  - `chat-status.ts`: `type ChatStatus = 'idle' | 'waiting' | 'blocked';`
- [X] T009 [P] Criar `src/app/features/chatbot/chatbot-content.ts` com as constantes exatas da tabela "Conteúdo estático" de data-model.md: `ASSISTANT_NAME = 'AchaLocalBot'`, `ASSISTANT_STATUS_TEXT = 'online'`, `WELCOME_TITLE = '👋 Olá! Eu sou o AchaLocalBot'`, `WELCOME_TEXT = 'Como posso ajudar você hoje? Digite sua pergunta abaixo.'`, `SUGGESTIONS_LABEL = 'experimente:'`, `SUGGESTIONS: readonly string[] = ['estou com fome', 'preciso reformar minha casa', 'onde comprar roupas novas?', 'quero cortar cabelo', 'quero aprender inglês', 'manutenção de celular']`, `MESSAGE_MAX_LENGTH = 50`, `RESPONSE_TIMEOUT_IN_MILLISECONDS = 60_000`, `GENERIC_ERROR_TEXT = 'Não consegui responder agora. Tente novamente em instantes.'`, `EMPTY_RESULT_TEXT = 'Não encontrei resultados para isso. Tente descrever de outro jeito.'`, `RATE_LIMIT_FALLBACK_TEXT = 'Você atingiu o limite de mensagens. Tente novamente mais tarde.'`, `BLOCKED_HINT_TEXT = 'Limite de mensagens atingido. Recarregue a página mais tarde para continuar.'`, `TYPING_INDICATOR_LABEL = 'AchaLocalBot está digitando'`, `MESSAGE_INPUT_LABEL = 'Digite sua pergunta'`, `SEND_BUTTON_LABEL = 'Enviar mensagem'`, `CONVERSATION_LABEL = 'Conversa com o AchaLocalBot'`
- [X] T010 [P] Escrever `src/app/features/chatbot/services/chat-error.mapper.spec.ts` (falha antes de T011) cobrindo R-04 e contracts/chat-api.md "Respostas de erro": 429 com `{"message": "..."}` → `rate-limited` + texto do corpo; 429 com `{"detail": "..."}` → `rate-limited` + detail; 429 com corpo ilegível/vazio → `rate-limited` + `RATE_LIMIT_FALLBACK_TEXT`; 500 com `{"detail": "..."}` → `server-message`; 400 com texto puro curto → `server-message`; corpo texto > 300 caracteres → `generic`; corpo com `<html>` → `generic`; status 0 → `generic`; `new TimeoutError()` (rxjs) → `generic`; `new Error('x')` e `undefined` → `generic` com `GENERIC_ERROR_TEXT`; nenhum `text` contém o número do status, a URL ou "Http"
- [X] T011 Implementar `src/app/features/chatbot/services/chat-error.mapper.ts` exportando a função pura `mapChatError(error: unknown): ChatFailure` (R-04): só considera `HttpErrorResponse`; extrai texto legível de `error.error` (string, pois `responseType: 'text'`; também aceitar objeto já parseado) via `JSON.parse` em `try/catch` → `message`, senão `detail`, se string não vazia; senão, se for string não-JSON com `trim().length` entre 1 e 300 e sem `<`, usa o próprio texto. `status === 429` → `{ kind: 'rate-limited', text: legível ?? RATE_LIMIT_FALLBACK_TEXT }`; outro status com texto legível (exceto status 0) → `server-message`; qualquer outro caso → `{ kind: 'generic', text: GENERIC_ERROR_TEXT }`. Nunca usar `error.message`/`statusText`. Depende de T008, T009, T010

**Checkpoint**: Modelos, conteúdo e mapper prontos — `ng test` verde para o mapper

---

## Phase 3: User Story 1 - Fazer uma pergunta e receber recomendações (Priority: P1) 🎯 MVP

**Goal**: Em `/chatbot`, o visitante envia uma pergunta (botão ou Enter) com um `user_code` gerado na abertura da página; cada linha `data:` do fluxo vira um balão do assistente assim que chega; envio bloqueado e indicador "digitando" até o fim; foco volta ao campo; rolagem automática.

**Independent Test**: com `HttpTestingController`, abrir `ChatbotPage`, enviar uma pergunta, emitir dois eventos `DownloadProgress` com linhas `data:` e depois o `HttpResponse`; verificar balão do visitante + 2 balões do assistente com `HH:mm`, campo desabilitado durante a espera e reabilitado com foco no fim, mesmo `user_code` em duas requisições.

### Tests for User Story 1 ⚠️

> Escrever primeiro e confirmar que FALHAM antes da implementação

- [X] T012 [P] [US1] Escrever `src/app/features/chatbot/services/stream-data-parser.spec.ts` (R-02): `push(partialText)` retorna os chunks novos; linha `data: {"message":"a"}\n` → `['a']`; duas linhas no mesmo trecho → 2 chunks em ordem; linha cortada no meio entre dois `push` (partialText acumulado) → emitida uma única vez quando completa; `\r\n` aceito; linhas vazias, `: comentário`, linha sem prefixo `data:`, JSON inválido, `{"message": ""}`, `{"message": 1}`, `{"text":"x"}` → ignoradas silenciosamente; `flush(body)` processa a última linha sem `\n` e não reemite o que já foi emitido; `data:` sem espaço após os dois-pontos também aceito; quebras de linha escapadas (`\\n`) dentro do JSON preservadas no texto
- [X] T013 [P] [US1] Escrever `src/app/features/chatbot/services/chat-api.service.spec.ts` com `provideHttpClient()`, `provideHttpClientTesting()` e `{ provide: CHAT_API_URL, useValue: 'http://test/chat' }`: `send({ message, user_code })` faz `POST` em `http://test/chat` com o corpo exato e `responseType` `text`; `req.event({ type: HttpEventType.DownloadProgress, loaded, partialText })` emite `{ type: 'chunk', text }` por linha nova; `req.flush(corpoCompleto)` emite chunks restantes e depois `{ type: 'done' }` e completa; `req.flush(body, { status: 429, statusText: '...' })` propaga `HttpErrorResponse` (o mapeamento é do store); com `vi.useFakeTimers()`, ficar 60 000 ms sem eventos → erro `TimeoutError`; um evento a cada 59 s não dispara timeout; unsubscribe cancela a requisição (`req.cancelled === true`)
- [X] T014 [P] [US1] Escrever `src/app/features/chatbot/state/chat-session.store.spec.ts` (bloco "fluxo de sucesso"), providenciando o store via `TestBed` com `ChatSessionStore` em `providers` e `ChatApiService` stub que devolve um `Subject<ChatStreamEvent>`: `userCode` é UUID (regex) e constante entre envios; `send('  oi  ')` envia `message: 'oi'` + `user_code`; adiciona mensagem `visitor`/`text` com `sentAt` e muda `status` para `waiting` sincronamente; segundo `send` durante `waiting` é ignorado (uma única chamada ao serviço — duplo envio); `send('   ')` e texto com 51 caracteres são ignorados; cada `chunk` adiciona mensagem `assistant`/`text` na ordem; `done` → `status` `idle`; `done` sem nenhum chunk → mensagem `assistant`/`error` com `EMPTY_RESULT_TEXT` e `idle`; ids sequenciais únicos; `isWaiting`/`canSend`/`hasStarted` coerentes; destruir o injector (`TestBed.resetTestingModule` ou `DestroyRef`) durante `waiting` cancela a assinatura sem adicionar mensagens nem lançar erro (FR-027)
- [X] T015 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-message-bubble/chat-message-bubble.spec.ts`: renderiza `text` como texto puro (um texto com `<b>x</b>` aparece literalmente, nenhum elemento `b` criado — FR-019); horário no formato `HH:mm` (ex.: `new Date(2026, 10, 21, 9, 5)` → `09:05`); classe/atributo de lado `visitor` vs `assistant`; preserva `\n` (estilo `white-space: pre-line` aplicado por classe)
- [X] T016 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-message-list/chat-message-list.spec.ts`: renderiza um `app-chat-message-bubble` por mensagem na ordem (com `track` por `id`); contêiner com `role="log"`, `aria-live="polite"` e `aria-label` = `CONVERSATION_LABEL`; mostra `app-chat-typing-indicator` somente quando `isWaiting` é `true`; com `Element.prototype.scrollIntoView = vi.fn()` (stub, jsdom não implementa), adicionar mensagem dispara `scrollIntoView` no sentinela final
- [X] T017 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-typing-indicator/chat-typing-indicator.spec.ts`: renderiza três pontos com `aria-hidden="true"` e texto visualmente oculto `TYPING_INDICATOR_LABEL`
- [X] T018 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-composer/chat-composer.spec.ts`: `textarea` tem `maxlength="50"` e rótulo acessível `MESSAGE_INPUT_LABEL`; contador `mat-hint` mostra `0/50` e atualiza ao digitar (`n/50`); botão com `aria-label` = `SEND_BUTTON_LABEL` desabilitado com texto vazio/só espaços; Enter sem Shift emite `send` com o texto e chama `preventDefault`, depois o controle é limpo; Shift+Enter NÃO emite; clique no botão emite; com input `disabled` `true` o textarea e o botão ficam desabilitados e Enter não emite; transição `disabled` `true` → `false` coloca o foco no textarea (`document.activeElement`)
- [X] T019 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-window-header/chat-window-header.spec.ts`: exibe ícone `storefront`, `ASSISTANT_NAME` e `ASSISTANT_STATUS_TEXT`
- [X] T020 [US1] Escrever `src/app/features/chatbot/chatbot-page.spec.ts` (teste de integração do fluxo crítico, Constitution VI) com `provideHttpClient()`, `provideHttpClientTesting()`, `CHAT_API_URL` de teste, `provideRouter([])`, `MatIconTestingModule`, locale pt-BR e stub de `scrollIntoView`: digitar pergunta + Enter → balão do visitante e textarea vazio/desabilitado e indicador visível; `req.event` DownloadProgress com 1 linha → 1 balão do assistente antes do fim; `req.flush` com 2ª linha → 2 balões, indicador some, textarea habilitado; segunda pergunta usa o mesmo `user_code` no corpo; o componente declara `ChatSessionStore` em `providers` (instância nova por página). Depende de T012–T019 (usa todos os componentes)

### Implementation for User Story 1

- [X] T021 [P] [US1] Implementar `src/app/features/chatbot/services/stream-data-parser.ts`: classe `StreamDataParser` (sem DI, uma instância por requisição) com estado privado `consumedLength = 0` e `pendingLine = ''`; `push(partialText: string): readonly string[]` pega `partialText.slice(consumedLength)`, atualiza `consumedLength`, concatena a `pendingLine`, separa por `/\r?\n/`, guarda o último pedaço como `pendingLine` e processa as linhas completas; `flush(fullText: string): readonly string[]` processa o trecho ainda não consumido + `pendingLine` como linhas completas. Processar linha: `trim`; se não começa com `data:` ignora; remove prefixo e espaços; `JSON.parse` em `try/catch`; aceita só se `isChatStreamChunk` → retorna `chunk.message`. Depende de T008, T012
- [X] T022 [US1] Implementar `src/app/features/chatbot/services/chat-api.service.ts`: `@Injectable({ providedIn: 'root' }) ChatApiService` com `inject(HttpClient)` e `inject(CHAT_API_URL)`; `send(request: ChatRequestDto): Observable<ChatStreamEvent>` = `defer(() => { const parser = new StreamDataParser(); return this.http.post(url, request, { observe: 'events', reportProgress: true, responseType: 'text' }).pipe(timeout({ each: RESPONSE_TIMEOUT_IN_MILLISECONDS }), concatMap(event => ...)); })` onde `HttpEventType.DownloadProgress` com `partialText` → `from(parser.push(partialText).map(text => ({ type: 'chunk', text })))`; `HttpEventType.Response` → chunks de `parser.flush(event.body ?? '')` seguidos de `{ type: 'done' }`; demais eventos → `EMPTY`. Sem `catchError` aqui (erros propagam ao store). Depende de T003, T008, T009, T013, T021
- [X] T023 [US1] Implementar `src/app/features/chatbot/state/chat-session.store.ts`: `@Injectable()` (SEM `providedIn` — R-07) `ChatSessionStore` com `inject(ChatApiService)`, `inject(DestroyRef)`; `readonly userCode = crypto.randomUUID()` (exige contexto seguro — HTTPS ou `localhost`, ver plan.md Technical Context/Constraints); `private readonly messagesState = signal<readonly ChatMessage[]>([])`, `private readonly statusState = signal<ChatStatus>('idle')`, expostos como `messages`/`status` via `.asReadonly()`; `hasStarted = computed(() => messages().length > 0)`, `canSend = computed(() => status() === 'idle')`, `isWaiting = computed(() => status() === 'waiting')`, `isBlocked = computed(() => status() === 'blocked')`; contador privado `nextMessageId`; `send(text: string): void` seguindo "Regras de send(text)" de data-model.md: `trimmed = text.trim()`; ignora se vazio, `> MESSAGE_MAX_LENGTH` ou `!canSend()`; adiciona mensagem `visitor`/`text` com `sentAt: new Date()`; `statusState.set('waiting')` (síncrono); assina `api.send({ message: trimmed, user_code: this.userCode })` com `takeUntilDestroyed(this.destroyRef)`; `chunk` → adiciona `assistant`/`text` e incrementa contador local; `done` → se contador 0 adiciona `assistant`/`error` com `EMPTY_RESULT_TEXT`; `idle`. Tratamento de erro: `catchError` que chama `mapChatError` e converte em ação de falha (adiciona `assistant` com `kind: failure.kind === 'rate-limited' ? 'warning' : 'error'` e `text: failure.text`; `status` `blocked` se `rate-limited`, senão `idle`) e retorna `EMPTY` — nada chega ao `ErrorHandler` (R-08). Depende de T011, T014, T022
- [X] T024 [P] [US1] Criar `ChatMessageBubble` em `src/app/features/chatbot/chat-window/chat-message-bubble/chat-message-bubble.ts|.html|.scss`: `message = input.required<ChatMessage>()`; `computed` para classe de modificador (`bubble--visitor`/`bubble--assistant` e `bubble--warning`/`bubble--error`); template com `<p class="bubble__text">{{ message().text }}</p>` (interpolação apenas) e `<time [attr.datetime]="message().sentAt.toISOString()">{{ message().sentAt | date: 'HH:mm' }}</time>`; SCSS: fundo `var(--app-color-chat-bubble)`, texto `var(--app-color-chat-text)`, `white-space: pre-line`, `overflow-wrap: anywhere`, `max-width: 80%`, visitante alinhado à direita (`align-self: flex-end`) e assistente à esquerda; `warning` usa `--app-color-warning-bg/-text`, `error` usa `--app-color-error-bg/-text`; horário em fonte menor. Depende de T008, T015
- [X] T025 [P] [US1] Criar `ChatTypingIndicator` em `src/app/features/chatbot/chat-window/chat-typing-indicator/chat-typing-indicator.ts|.html|.scss`: balão do assistente com três `<span class="dot" aria-hidden="true">` animados por `@keyframes` (desligados em `@media (prefers-reduced-motion: reduce)`) e `<span class="visually-hidden">{{ typingLabel }}</span>` (`TYPING_INDICATOR_LABEL`); usar a classe utilitária de texto oculto já existente no projeto, se houver, ou definir `.visually-hidden` no SCSS do componente (R-12). Depende de T009, T017
- [X] T026 [US1] Criar `ChatMessageList` em `src/app/features/chatbot/chat-window/chat-message-list/chat-message-list.ts|.html|.scss`: inputs `messages = input.required<readonly ChatMessage[]>()`, `isWaiting = input.required<boolean>()`; template: `<div class="message-list" role="log" aria-live="polite" [attr.aria-label]="conversationLabel">` com `@for (message of messages(); track message.id) { <app-chat-message-bubble [message]="message" /> }`, `@if (isWaiting()) { <app-chat-typing-indicator /> }` e sentinela `<div #end></div>`; `private readonly end = viewChild.required<ElementRef<HTMLElement>>('end')`; `afterRenderEffect(() => { this.messages(); this.isWaiting(); this.end().nativeElement.scrollIntoView({ block: 'end' }); })` com comentário de uma linha justificando (plan.md Complexity Tracking, FR-018); SCSS: coluna flex com `gap`, `overflow-y: auto`, `flex: 1 1 auto`, `min-height: 0`. Depende de T016, T024, T025
- [X] T027 [P] [US1] Criar `ChatWindowHeader` em `src/app/features/chatbot/chat-window/chat-window-header/chat-window-header.ts|.html|.scss`: barra com `<mat-icon svgIcon="storefront" aria-hidden="true">`, `<span class="name">{{ assistantName }}</span>` e `<span class="status">{{ statusText }}</span>` (com pequeno indicador circular decorativo); fundo `var(--app-color-primary)` (ou token primário existente equivalente), texto `var(--app-color-on-primary)`; cantos superiores arredondados. Depende de T009, T019
- [X] T028 [US1] Criar `ChatComposer` em `src/app/features/chatbot/chat-window/chat-composer/chat-composer.ts|.html|.scss` (R-09): `disabled = input<boolean>(false)`, `send = output<string>()`; `protected readonly messageControl = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(MESSAGE_MAX_LENGTH)] })`; `private readonly messageValue = toSignal(this.messageControl.valueChanges, { initialValue: '' })`; `characterCount = computed(() => messageValue().length)`; `canSubmit = computed(() => !disabled() && messageValue().trim().length > 0)`; template: `<mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>{{ inputLabel }}</mat-label><textarea #messageInput matInput cdkTextareaAutosize cdkAutosizeMinRows="1" cdkAutosizeMaxRows="3" [maxlength]="maxLength" [formControl]="messageControl" (keydown.enter)="onEnter($event)"></textarea><mat-hint align="end">{{ characterCount() }}/{{ maxLength }}</mat-hint></mat-form-field>` + `<button mat-icon-button type="button" [attr.aria-label]="sendLabel" [disabled]="!canSubmit()" (click)="submit()"><mat-icon svgIcon="send" aria-hidden="true" /></button>`; `onEnter(event: KeyboardEvent)`: se `event.shiftKey` retorna (quebra de linha padrão); senão `preventDefault()` e `submit()`; `submit()`: se `!canSubmit()` retorna; `send.emit(messageControl.value)`; `messageControl.reset('')`; `effect` que chama `messageControl.disable({ emitEvent: false })`/`enable({ emitEvent: false })` conforme `disabled()` e, na transição `true → false`, chama `.nativeElement.focus()` em `viewChild.required<ElementRef<HTMLTextAreaElement>>('messageInput')` (FR-017; manipulação de DOM autorizada — plan.md Complexity Tracking; comentário de uma linha no código referenciando a justificativa); SCSS: linha flex com campo `flex: 1`, botão alinhado ao fim. Depende de T009, T018
- [X] T029 [US1] Criar `ChatWindow` em `src/app/features/chatbot/chat-window/chat-window.ts|.html|.scss`: injeta `ChatSessionStore` (provido pela página); compõe `<app-chat-window-header />`, `<app-chat-message-list [messages]="store.messages()" [isWaiting]="store.isWaiting()" />` e `<app-chat-composer [disabled]="!store.canSend()" (send)="store.send($event)" />`; SCSS: `:host { display: flex; flex: 1 1 auto; min-height: 0; width: min(720px, 100%); }`; cartão flutuante com fundo `var(--app-color-chat-window)`, `border-radius`, sombra via `--mat-sys-level*`, `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; max-height: 720px`; a altura vem do layout flex da página (T031) — NÃO usar `calc` com altura do cabeçalho; lista com `flex: 1 1 auto; min-height: 0; overflow-y: auto`; composer no rodapé do cartão (`flex: none`, sempre visível — SC-006). Depende de T023, T026, T027, T028
- [X] T030 [P] [US1] Escrever `src/app/features/chatbot/chat-window/chat-window.spec.ts`: com store real + `HttpTestingController`, verifica que header, lista e composer são renderizados e que emitir `send` no composer chama o fluxo (requisição `POST` criada) e desabilita o composer. Depende de T029
- [X] T031 [US1] Criar `ChatbotPage` em `src/app/features/chatbot/chatbot-page.ts|.html|.scss`: `providers: [ChatSessionStore]` (estado morre com a página — R-07, FR-026); template `<main class="chatbot-page"><app-chat-window /></main>`; SCSS: `:host { display: flex; flex-direction: column; height: 100dvh; background: var(--app-color-surface); }` (off-white `#FCFAF1` já existente em `_tokens.scss`); `.chatbot-page { flex: 1 1 auto; min-height: 0; display: flex; justify-content: center; padding: 16px; }` — a janela ocupa o espaço restante abaixo do cabeçalho sem cálculo de altura; sem rolagem horizontal. (O cabeçalho do site é adicionado em US4 — T052 — como primeiro filho `flex: none` do `:host`.) Depende de T029
- [X] T032 [US1] Em `src/app/app.routes.ts`, trocar a rota `AppPaths.chatbot` para `title: 'Chatbot — AchaLocal'`, `loadComponent: () => import('./features/chatbot/chatbot-page').then((module) => module.ChatbotPage)` e remover o `data: { featureName: 'Chatbot' }`; manter `/cadastrar-negocio` com `ComingSoonPage`. Atualizar `src/app/app.routes.spec.ts`: `/chatbot` renderiza `ChatbotPage` (via `RouterTestingHarness`, com providers HTTP de teste e `CHAT_API_URL`) e o título da aba é `Chatbot — AchaLocal` (FR-001; contracts/routes.md). Depende de T031

**Checkpoint**: `/chatbot` funcional para o caminho feliz; `ng test` verde; MVP demonstrável com o backend UAT

---

## Phase 4: User Story 2 - Começar pela tela de boas-vindas e sugestões (Priority: P2)

**Goal**: Antes da primeira mensagem, saudação do AchaLocalBot e bloco "experimente:" com 6 sugestões clicáveis que enviam pelo mesmo fluxo; sugestões somem após a primeira mensagem e respeitam o bloqueio.

**Independent Test**: abrir `ChatbotPage` sem enviar nada → saudação + 6 sugestões; clicar em "estou com fome" → requisição com `message: 'estou com fome'`, sugestões desaparecem, saudação permanece no topo.

### Tests for User Story 2 ⚠️

- [X] T033 [P] [US2] Escrever `src/app/features/chatbot/chat-window/chat-welcome/chat-welcome.spec.ts`: exibe `WELCOME_TITLE` e `WELCOME_TEXT`
- [X] T034 [P] [US2] Escrever `src/app/features/chatbot/chat-window/chat-suggestions/chat-suggestions.spec.ts`: exibe `SUGGESTIONS_LABEL` e um `button` (`mat-stroked-button`, `type="button"`) por item de `SUGGESTIONS` (6, textos exatos, na ordem) dentro de uma lista (`role="list"` / itens `role="listitem"`) rotulada por `SUGGESTIONS_LABEL`; clique emite `suggestionSelected` com o texto; com `disabled` `true`, os botões têm o atributo `disabled` e o clique não emite; botões são focáveis por Tab (operação por teclado nativa do `button`)
- [X] T035 [US2] Acrescentar a `src/app/features/chatbot/chat-window/chat-window.spec.ts`: sem mensagens, `app-chat-welcome` e `app-chat-suggestions` visíveis; clique em sugestão faz `POST` com `message` igual ao texto da sugestão; após o envio, `app-chat-suggestions` some e `app-chat-welcome` continua antes do primeiro balão; durante `waiting` a sugestão não gera requisição (FR-010, US2 cenários 1–4). Depende de T030

### Implementation for User Story 2

- [X] T036 [P] [US2] Criar `ChatWelcome` em `src/app/features/chatbot/chat-window/chat-welcome/chat-welcome.ts|.html|.scss`: balão do assistente (mesmo visual de `ChatMessageBubble` lado assistente, via tokens `--app-color-chat-bubble`/`--app-color-chat-text`) com `<p class="title">{{ welcomeTitle }}</p>` (destaque) e `<p>{{ welcomeText }}</p>`, sem horário. Depende de T009, T033
- [X] T037 [P] [US2] Criar `ChatSuggestions` em `src/app/features/chatbot/chat-window/chat-suggestions/chat-suggestions.ts|.html|.scss`: `disabled = input<boolean>(false)`, `suggestionSelected = output<string>()`; template `<p class="label" [id]="labelId">{{ suggestionsLabel }}</p><ul class="suggestions" role="list" [attr.aria-labelledby]="labelId">@for (suggestion of suggestions; track suggestion) { <li role="listitem"><button mat-stroked-button type="button" class="suggestion" [disabled]="disabled()" (click)="select(suggestion)">{{ suggestion }}</button></li> }</ul>` (NÃO usar `mat-chip`: chips básicos não são interativos/focáveis; o `button` nativo do Material já é operável por teclado — não adicionar `role`/`tabindex` manuais); `select()` ignora se `disabled()`; SCSS: `ul` sem marcadores/margem, `display: flex; flex-wrap: wrap; gap`, botões em formato de pílula (`border-radius: 999px`, cores só via tokens), cabem em 320 px. Depende de T009, T034
- [X] T038 [US2] Integrar em `ChatMessageList` (`src/app/features/chatbot/chat-window/chat-message-list/chat-message-list.html`): `<app-chat-welcome />` sempre como primeiro item dentro do `role="log"` (saudação permanece no topo — US2 cenário 3); atualizar `chat-message-list.spec.ts` para verificar a saudação antes do primeiro balão. Depende de T026, T036
- [X] T039 [US2] Integrar em `ChatWindow` (`src/app/features/chatbot/chat-window/chat-window.html`): `@if (!store.hasStarted()) { <app-chat-suggestions [disabled]="!store.canSend()" (suggestionSelected)="store.send($event)" /> }` posicionado entre a lista e o composer. Depende de T029, T035, T037, T038

**Checkpoint**: US1 + US2 funcionam; tela de boas-vindas igual ao modelo visual (estado 1)

---

## Phase 5: User Story 3 - Ser informado com clareza quando algo dá errado (Priority: P2)

**Goal**: Erros do serviço viram balões de aviso em linguagem natural; 429 bloqueia campo, botão e sugestões até recarregar, com indicação visível e zero novas requisições; timeout/rede/interrupção mostram texto genérico preservando respostas já recebidas; nada no console.

**Nota (P1 da análise — aceito)**: o tratamento base de erro (`catchError` → `mapChatError` → `warning`/`error`, `blocked`/`idle`) já é implementado em T023, pois o MVP não pode deixar erros chegarem ao console (FR-024). Esta fase acrescenta os testes de todos os cenários de falha, a dica de bloqueio na UI e o endurecimento do estado `blocked`.

**Independent Test**: com `HttpTestingController`, responder 500 `{"detail":"Serviço em manutenção."}` → balão de erro com esse texto e campo liberado; responder 429 `{"message":"Limite atingido."}` → balão de aviso, campo/botão/sugestões desabilitados, `BLOCKED_HINT_TEXT` visível, novo `send` não cria requisição (`httpTesting.expectNone`).

### Tests for User Story 3 ⚠️

- [X] T040 [P] [US3] Acrescentar a `src/app/features/chatbot/state/chat-session.store.spec.ts` o bloco "falhas" (stub do serviço emitindo erros): `HttpErrorResponse` 500 com `{"detail":"x"}` → mensagem `assistant`/`error` com `x`, `status` `idle`; 429 → `assistant`/`warning` com o texto do serviço, `status` `blocked`, `isBlocked()` `true`, `send('oi')` posterior NÃO chama o serviço (SC-004); `TimeoutError` → `GENERIC_ERROR_TEXT` e `idle`; erro após 2 chunks → os 2 balões permanecem + aviso genérico e `idle` (US3 cenário 5); `status 0` → genérico; espionar `console.error`/`console.warn`/`console.log` (`vi.spyOn`) e o `ErrorHandler` — nenhum chamado em nenhum cenário (FR-024)
- [X] T041 [P] [US3] Acrescentar a `src/app/features/chatbot/chat-window/chat-composer/chat-composer.spec.ts`: input `blockedHint` (string | null) exibe a dica de bloqueio em `mat-hint`/elemento associado via `aria-describedby` quando presente
- [X] T042 [US3] Acrescentar a `src/app/features/chatbot/chatbot-page.spec.ts` os cenários de integração: 429 com `{"message":"Limite atingido."}` → balão com "Limite atingido.", textarea/botão desabilitados, `BLOCKED_HINT_TEXT` visível, digitar + Enter → `httpTesting.expectNone(url)`; 503 sem corpo → `GENERIC_ERROR_TEXT`, campo reabilitado; `req.error(new ProgressEvent('error'))` (rede) → genérico; nenhum texto renderizado contém "429", "503", "Http" ou a URL (SC-003). Depende de T020

### Implementation for User Story 3

- [X] T043 [US3] Revisar `src/app/features/chatbot/state/chat-session.store.ts` para garantir todas as transições de falha de data-model.md ("Máquina de estados"): `blocked` terminal — `send()` retorna antes de qualquer efeito quando `status() === 'blocked'`; chunks já adicionados nunca são removidos; `catchError` cobre também erros lançados dentro do processamento de eventos; nenhum `console.*`. Ajustar até T040 passar. Depende de T023, T040
- [X] T044 [US3] Em `ChatComposer` (`src/app/features/chatbot/chat-window/chat-composer/chat-composer.ts|.html|.scss`), adicionar `blockedHint = input<string | null>(null)`; quando presente, exibir o texto (com ícone decorativo opcional) abaixo do campo, ligado ao textarea por `aria-describedby`, com cores `--app-color-warning-bg/-text`. Depende de T028, T041
- [X] T045 [US3] Em `ChatWindow` (`src/app/features/chatbot/chat-window/chat-window.ts|.html`), passar `[blockedHint]="blockedHint()"` com `blockedHint = computed(() => store.isBlocked() ? BLOCKED_HINT_TEXT : null)`; confirmar que sugestões e composer usam `!store.canSend()` (bloqueio cobre os três — FR-021). Depende de T039, T044
- [X] T046 [US3] Confirmar em `ChatMessageBubble` (`src/app/features/chatbot/chat-window/chat-message-bubble/chat-message-bubble.scss|.html`) que `warning` e `error` têm destaque visual distinto (fundo/texto dos tokens, ícone decorativo opcional `aria-hidden`) e acrescentar ao `chat-message-bubble.spec.ts` a verificação das classes `bubble--warning`/`bubble--error`. Depende de T024, T042

**Checkpoint**: Todos os cenários de erro da spec cobertos; a tela nunca fica presa em "aguardando"

---

## Phase 6: User Story 4 - Navegar a partir da página do chat (Priority: P3)

**Goal**: Cabeçalho do site (promovido para `core/layout/`) na página do chat com "início" e "cadastrar"; landing continua com "testar chatbot" e seus botões abrem o chat funcional.

**Independent Test**: em `/chatbot`, clicar "início" → `/`; clicar "cadastrar" → `/cadastrar-negocio`; na landing, "testar o chat online"/"testar agora" → `/chatbot` renderiza `ChatbotPage`.

### Tests for User Story 4 ⚠️

- [X] T047 [P] [US4] Mover `src/app/features/landing/site-header/site-header.spec.ts` para `src/app/core/layout/site-header/site-header.spec.ts` e reescrevê-lo para o novo contrato (contracts/routes.md "Cabeçalho"): marca "AchaLocal" com ícone `storefront` linkando `/`; com `navigationItems` = `[{ label: 'início', icon: 'home', path: AppPaths.home }, { label: 'cadastrar', icon: 'add_business', path: AppPaths.registerBusiness }]` renderiza 2 links na ordem, com ícones e `href` `/` e `/cadastrar-negocio`; com `[{ label: 'testar chatbot', icon: 'chat', path: AppPaths.chatbot }]` renderiza 1 link para `/chatbot`
- [X] T048 [P] [US4] Acrescentar a `src/app/features/chatbot/chatbot-page.spec.ts`: a página exibe `app-site-header` com links "início" (`/`) e "cadastrar" (`/cadastrar-negocio`)

### Implementation for User Story 4

- [X] T049 [P] [US4] Criar `src/app/core/layout/navigation-item.ts`: `interface NavigationItem { readonly label: string; readonly icon: AppIconName; readonly path: string; }`
- [X] T050 [US4] Mover `SiteHeader` (`site-header.ts|.html|.scss`) de `src/app/features/landing/site-header/` para `src/app/core/layout/site-header/` (usar `git mv`); adicionar `navigationItems = input.required<readonly NavigationItem[]>()`; substituir o(s) botão(ões) fixo(s) do template por `@for (item of navigationItems(); track item.path) { <a mat-button [routerLink]="toRouterLink(item.path)"><mat-icon [svgIcon]="item.icon" aria-hidden="true" />{{ item.label }}</a> }`, mantendo marca, estilos e comportamento de rolagem ao topo existentes. Remover a pasta antiga. Depende de T047, T049
- [X] T051 [US4] Atualizar `src/app/features/landing/landing-page.ts|.html`: import do novo caminho `core/layout/site-header/site-header`; `protected readonly navigationItems: readonly NavigationItem[] = [{ label: 'testar chatbot', icon: 'chat', path: AppPaths.chatbot }]` (texto idêntico ao atual) passado via `[navigationItems]`; mover essa constante para `src/app/features/landing/landing-content.ts` se lá for o padrão. Rodar `src/app/features/landing/landing-page.spec.ts` e corrigir imports quebrados. Depende de T050
- [X] T052 [US4] Em `src/app/features/chatbot/chatbot-content.ts`, adicionar `CHATBOT_NAVIGATION_ITEMS: readonly NavigationItem[] = [{ label: 'início', icon: 'home', path: AppPaths.home }, { label: 'cadastrar', icon: 'add_business', path: AppPaths.registerBusiness }]`; em `src/app/features/chatbot/chatbot-page.html|.ts|.scss`, renderizar `<app-site-header [navigationItems]="navigationItems" />` acima do `<main>`, com `app-site-header { flex: none; }` no SCSS da página (o layout flex de T031 já ajusta a janela ao espaço restante). Depende de T031, T048, T050
- [X] T053 [US4] Em `src/app/app.routes.spec.ts`, com `RouterTestingHarness` (rotas reais, `MatIconTestingModule`, `provideHttpClient()` + `provideHttpClientTesting()` e `CHAT_API_URL` de teste): navegar para `/`, localizar pelo texto cada acionador da landing ("testar chatbot" no cabeçalho, "testar o chat online" no destaque, "testar agora" em "Como funciona"), clicar e `await harness.fixture.whenStable()`; esperar URL `/chatbot` e `harness.routeNativeElement` contendo `app-chat-window` (não `ComingSoonPage`) — FR-025. Depende de T032, T051

**Checkpoint**: Todas as user stories funcionam de forma independente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade transversal, orçamentos e validação manual

- [X] T054 [P] Rodar `npm run lint:colors` e `npm run lint:contrast`; corrigir qualquer cor fora de `src/styles/_tokens.scss` ou contraste abaixo de AA (`#07150E` sobre `#FFFFFF` e sobre `#F3F2E9`; branco sobre o verde do cabeçalho)
- [X] T055 [P] Rodar `grep -rn "console\." src/app/features/chatbot src/app/core` e garantir resultado vazio (FR-024, R-08)
- [X] T056 Rodar `npx ng build` (produção): sem erros, dentro dos orçamentos (`anyComponentStyle` 4 kB warn / 8 kB error) e com `/chatbot` em chunk lazy separado; se algum SCSS estourar, simplificar (ex.: indicador de digitação → `MatProgressSpinner`, R-12)
- [X] T057 Rodar `npm test`, `npm run lint:colors` e `npm run lint:contrast`; todos verdes
- [ ] T058 Responsividade (FR-006, SC-006): no modo responsivo do navegador em 320, 375, 768, 1280 e 1920 px, conferir ausência de rolagem horizontal, composer sempre visível (inclusive com teclado virtual — uso de `100dvh`), sugestões quebrando linha e balões com `overflow-wrap`; ajustar SCSS de `chat-window`, `chatbot-page` e `chat-suggestions`
- [ ] T059 Executar o roteiro manual de `specs/003-chatbot-page/quickstart.md` (passos 1–14) contra o backend UAT `http://127.0.0.1:8000/chat`. Verificar também SC-002 com DevTools → Performance (gravar um envio): balão do visitante pintado < 0,2 s após o Enter e cada balão do assistente pintado < 0,5 s após o respectivo trecho chegar na aba Network (EventStream/timing); a garantia automatizada é a asserção de T020 de que o 1º balão aparece antes do fim do fluxo; se houver erro de CORS, aplicar a alternativa do quickstart (`proxy.conf.json` + `proxyConfig` + `chatApiUrl: '/chat'`) e registrar a decisão em `specs/003-chatbot-page/research.md` (R-05)
- [X] T060 [P] Atualizar documentação técnica relevante (ex.: `README.md`/`CLAUDE.md`, se descrevem estrutura ou ambientes) com: `src/environments/` e `CHAT_API_URL`, `SiteHeader` em `core/layout/`, e como apontar o chat para o backend UAT

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup (T007 ícones e T003 token); T011 depende de T008–T010 — BLOQUEIA todas as stories
- **US1 (Phase 3)**: depende da Foundational — MVP
- **US2 (Phase 4)**: depende da Foundational; integração (T038, T039) depende de `ChatMessageList`/`ChatWindow` da US1
- **US3 (Phase 5)**: depende da Foundational; T043–T045 alteram arquivos da US1 (store, composer, window) e T045 depende de T039 (US2)
- **US4 (Phase 6)**: T047, T049, T050, T051 independem do chat (podem rodar em paralelo com US1); T052/T053 dependem de `ChatbotPage` (T031/T032)
- **Polish (Phase 7)**: depois de todas as stories desejadas

### User Story Dependencies

- **US1 (P1)**: nenhuma outra story
- **US2 (P2)**: componentes isolados testáveis sozinhos; integração requer US1 (lista e janela)
- **US3 (P2)**: mapper já pronto na Foundational; integração requer US1 (store/composer) e, para o bloqueio das sugestões, US2
- **US4 (P3)**: promoção do `SiteHeader` independente; inserção na página do chat requer US1

### Within Each User Story

- Specs primeiro (devem falhar), depois implementação
- Models → parser → serviço → store → componentes folha → `ChatWindow` → `ChatbotPage` → rota
- Story completa e checkpoint validado antes da próxima prioridade

### Parallel Opportunities

- Setup: T001, T003, T005, T006 em paralelo
- Foundational: T008, T009, T010 em paralelo
- US1: todas as specs T012–T019 em paralelo; T021, T024, T025, T027 em paralelo
- US2: T033, T034, T036, T037 em paralelo
- US3: T040, T041 em paralelo
- US4: T047, T049 em paralelo; toda a promoção do `SiteHeader` (T047, T049–T051) pode correr em paralelo com a US1
- Polish: T054, T055, T060 em paralelo

---

## Parallel Example: User Story 1

```bash
# Specs da US1 juntas (devem falhar):
Task: "T012 stream-data-parser.spec.ts"
Task: "T013 chat-api.service.spec.ts"
Task: "T014 chat-session.store.spec.ts (fluxo de sucesso)"
Task: "T015 chat-message-bubble.spec.ts"
Task: "T016 chat-message-list.spec.ts"
Task: "T017 chat-typing-indicator.spec.ts"
Task: "T018 chat-composer.spec.ts"
Task: "T019 chat-window-header.spec.ts"

# Implementações folha juntas:
Task: "T021 StreamDataParser"
Task: "T024 ChatMessageBubble"
Task: "T025 ChatTypingIndicator"
Task: "T027 ChatWindowHeader"
```

## Parallel Example: User Story 2

```bash
Task: "T033 chat-welcome.spec.ts"
Task: "T034 chat-suggestions.spec.ts"
Task: "T036 ChatWelcome"
Task: "T037 ChatSuggestions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (inclui o mapper — o store do MVP já não deixa erros escaparem ao console)
3. Phase 3: US1
4. **PARAR e VALIDAR**: `ng test` + passos 2–5 do quickstart contra o backend UAT
5. Demo

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → chat funcional (MVP)
3. US2 → boas-vindas e sugestões (estado 1 do modelo visual)
4. US3 → mensagens de erro e bloqueio por 429
5. US4 → cabeçalho com navegação e `SiteHeader` compartilhado
6. Polish → lint de cores/contraste, build, responsividade, roteiro manual

### Parallel Team Strategy

1. Equipe conclui Setup + Foundational
2. Dev A: US1 (serviço, store, componentes); Dev B: promoção do `SiteHeader` (T047, T049–T051) + componentes isolados da US2 (T033–T037)
3. Depois: US3 e integração de US2/US4

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente
- [Story] mapeia a task para a user story (rastreabilidade)
- `ChatMessage` da landing NÃO é reutilizado (outro propósito)
- Proxy de dev (`proxy.conf.json`) só é criado se o teste manual falhar por CORS (YAGNI — R-05)
- Commit após cada task ou grupo lógico; parar em qualquer checkpoint para validar
