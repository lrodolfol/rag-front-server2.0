# Implementation Plan: Página do Chatbot (/chatbot)

**Branch**: `feat/chat-online-page` (feature dir `003-chatbot-page`) | **Date**: 2026-11-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-chatbot-page/spec.md` + decisões técnicas de
`.mine/chat-bot-page/plan.md`

## Summary

Substituir a página "em breve" da rota `/chatbot` por um chat funcional: o visitante envia uma
pergunta (até 50 caracteres) com um `user_code` aleatório gerado ao abrir a página; o serviço de
recomendação (POST, UAT `http://127.0.0.1:8000/chat`) devolve respostas em fluxo contínuo
(`data: {"message": "..."}`), e cada resposta vira um balão separado assim que chega. O envio fica
bloqueado até o fim do fluxo; erros mostram apenas a mensagem em linguagem natural do serviço;
HTTP 429 bloqueia o chat até recarregar a página, sem novas requisições; nada é escrito no console.

Abordagem: `HttpClient` com `observe: 'events'` + `reportProgress` + `responseType: 'text'` (o
`withFetch()` já configurado entrega `partialText` incremental), um parser puro de linhas `data:`,
um mapper de erros, e um store de sessão baseado em Signals provido no componente da página (estado
morre com a página). UI 100% Angular Material (`MatFormField`/`matInput` + `cdkTextareaAutosize`,
`MatIconButton`, `MatButton` em formato de pílula para as sugestões), tokens de cor novos em `_tokens.scss`. O `SiteHeader` da landing é
promovido para `core/layout/` com itens de navegação configuráveis. **Nenhuma dependência nova.**

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, `afterRenderEffect`, Reactive Forms,
`HttpClient` + `withFetch`), Angular Material/CDK 22.2 (`MatToolbar`, `MatFormField`, `MatInput`,
`CdkTextareaAutosize`, `MatIconButton`, `MatButton` (`mat-stroked-button` nas sugestões — chips básicos
não são interativos/focáveis), `MatIcon`,
`MatProgressSpinner` opcional), RxJS 7.8 (`timeout`, `catchError`, `takeUntilDestroyed`).
**Nenhuma dependência nova.**

**Storage**: N/A — conversa somente em memória (Signals); nada em `localStorage`/`sessionStorage`

**Testing**: Vitest + jsdom via `ng test`; `HttpTestingController` para o serviço HTTP (eventos
`DownloadProgress` simulados); `vi.useFakeTimers` para timeout; `RouterTestingHarness` para rotas;
`npm run lint:colors` e `npm run lint:contrast`

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (320–1920 px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: mensagem do visitante na tela < 0,2 s após envio; cada resposta parcial
< 0,5 s após chegar (SC-002); rota `/chatbot` carregada sob demanda (lazy) para não pesar na
landing

**Constraints**: zero saída no console (FR-024); textos pt-BR; cores só via tokens; orçamento de
estilo por componente 4 kB warn / 8 kB error; WCAG 2.1 AA (anúncio de novas mensagens); backend
UAT precisa aceitar CORS de `http://localhost:4200` (ver research R-05); a aplicação MUST ser servida
em contexto seguro (HTTPS ou `localhost`), pois `crypto.randomUUID()` não existe em HTTP comum (R-06)
— requisito para o ambiente de produção

**Scale/Scope**: 1 rota, 1 página com ~8 componentes, 1 serviço HTTP, 1 parser, 1 mapper, 1 store,
2 arquivos de ambiente, 2 ícones novos, 3 tokens novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, OnPush, `input()`/`output()`, Signals (`signal`, `computed`) no store, RxJS para o fluxo HTTP. Sem `any` (respostas do serviço validadas por type guard). Componentes não chamam `subscribe()`: o store faz a assinatura com `takeUntilDestroyed`; o composer usa `toSignal` para o contador. |
| II. Responsabilidade única / por feature | PASS | `features/chatbot/` com página, subcomponentes de UI, `services/` (HTTP, parser, mapper), `state/` (store), `models/`, `chatbot-content.ts` (textos). Regras (bloqueio, 429, timeout, vazio) no store, nunca nos componentes. Nomes em inglês. |
| III. HTTP tipado | PASS | Só `ChatApiService` faz HTTP. DTOs `ChatRequestDto`/`ChatStreamChunkDto` separados do modelo de apresentação `ChatMessage`; `ChatErrorMapper` converte `HttpErrorResponse` → `ChatFailure`. Interceptor global **não** criado: o tratamento de erro é específico deste endpoint (429 bloqueante, mensagem do serviço) — ver Complexity Tracking. |
| IV. Segurança | PASS | Rota pública (sem guard — spec: acesso público). Textos do serviço renderizados só por interpolação (sem `innerHTML`). `user_code` não é persistido. URL da API vem de arquivo de ambiente (não é segredo). Únicas chamadas de DOM: `scrollIntoView` em `afterRenderEffect` para rolagem automática e `focus()` no textarea ao fim da resposta (ambas justificadas abaixo). |
| V. UX e identidade visual | PASS | Textos pt-BR; Material para campo, botões (inclusive as sugestões, como `mat-stroked-button` em formato de pílula), ícones; cores `#F3F2E9`, `#FFFFFF`, `#07150E` viram tokens em `_tokens.scss` (`#FCFAF1` e `#00A35C` já existem); estados tratados: boas-vindas (vazio), aguardando (indicador), sucesso, erro, bloqueado; formulário com Reactive Forms + `Validators.maxLength(50)` + contador; responsivo. |
| VI. Testes | PASS | Specs: parser, mapper, serviço (`HttpTestingController`), store (todas as transições), composer, sugestões, lista de mensagens, header, página e rotas. Fluxo crítico coberto por teste de integração da página com `HttpTestingController`. E2E segue fora do escopo (sem ferramenta definida). |
| VII. Dependências mínimas | PASS | Zero dependências novas: streaming via `HttpClient` (sem SSE lib, sem `fetch` manual), UUID via `crypto.randomUUID()`. `SiteHeader` promovido a `core/layout/` porque agora há uso real em 2 telas (decisão prevista no plano 002). |
| SDD | PASS | Spec aprovada (limite 50 caracteres confirmado). Fora do escopo respeitado: sem modo escuro, sem histórico, sem formatação rica. |

**Re-check pós-design (Phase 1)**: PASS — contratos e data model não introduzem dependências nem
cores fora de tokens. Riscos: (a) CORS no backend UAT — mitigação: proxy do dev server documentado
em research R-05/quickstart; (b) formato exato do corpo de erro desconhecido — mapper aceita
`message` ou `detail` e cai no texto genérico (R-04); (c) `provideBrowserGlobalErrorListeners`
escreve erros não tratados no console — mitigado capturando todos os erros do fluxo no store (R-08).

## Project Structure

### Documentation (this feature)

```text
specs/003-chatbot-page/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── chat-api.md      # contrato HTTP + streaming + erros
│   └── routes.md        # rotas e navegação
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
angular.json                                   # + fileReplacements de environment na config development
public/icons/
├── home.svg                                   # NOVO — item "início"
└── send.svg                                   # NOVO — botão enviar
src/
├── environments/
│   ├── environment.ts                         # NOVO — produção (chatApiUrl placeholder)
│   └── environment.development.ts             # NOVO — UAT http://127.0.0.1:8000/chat
├── styles/_tokens.scss                        # + --app-color-chat-window/-bubble/-text
└── app/
    ├── app.config.ts                          # + { provide: CHAT_API_URL, useValue: environment.chatApiUrl }
    ├── app.routes.ts                          # chatbot → loadComponent ChatbotPage
    ├── app.routes.spec.ts                     # expectativas atualizadas
    ├── core/
    │   ├── config/chat-api-url.token.ts       # NOVO — InjectionToken<string>
    │   ├── icons/app-icon-name.ts             # + 'home', 'send'
    │   ├── layout/
    │   │   ├── site-header/                   # MOVIDO de features/landing/site-header
    │   │   │   └── site-header.ts/.html/.scss/.spec.ts   # input navigationItems
    │   │   └── navigation-item.ts             # NOVO — { label, icon, path }
    │   └── routing/app-paths.ts
    └── features/
        ├── landing/landing-page.ts/.html      # usa core/layout/site-header com "testar chatbot"
        └── chatbot/
            ├── chatbot-page.ts/.html/.scss/.spec.ts      # rota; providers: [ChatSessionStore]
            ├── chatbot-content.ts                         # nome do bot, boas-vindas, sugestões, textos de erro, limite 50
            ├── models/
            │   ├── chat-request.dto.ts
            │   ├── chat-stream-chunk.dto.ts
            │   ├── chat-stream-event.ts
            │   ├── chat-failure.ts
            │   ├── chat-message.ts
            │   └── chat-status.ts
            ├── services/
            │   ├── chat-api.service.ts/.spec.ts
            │   ├── stream-data-parser.ts/.spec.ts
            │   └── chat-error.mapper.ts/.spec.ts
            ├── state/
            │   └── chat-session.store.ts/.spec.ts
            └── chat-window/
                ├── chat-window.ts/.html/.scss/.spec.ts            # compõe as partes abaixo
                ├── chat-window-header/…                           # ícone, "AchaLocalBot", "online"
                ├── chat-message-list/…                            # role="log", auto-scroll
                ├── chat-welcome/…                                 # saudação (primeiro item da lista)
                ├── chat-message-bubble/…                          # texto + HH:mm, variante aviso
                ├── chat-typing-indicator/…
                ├── chat-suggestions/…                             # "experimente:" + botões-pílula
                └── chat-composer/…                                # textarea + contador + enviar
```

**Structure Decision**: Nova feature isolada em `features/chatbot/`, seguindo o padrão da landing
(um componente por parte visual, `models/` separados, conteúdo textual num arquivo `*-content.ts`).
Pastas `services/` e `state/` entram porque esta é a primeira feature com HTTP e regra de negócio.
`SiteHeader` vai para `core/layout/` (como antecipado no plano 002) e passa a receber os itens de
navegação por `input()`. O `ChatMessage` da landing (simulação estática) **não** é reutilizado: tem
outro propósito e outros campos.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| `ElementRef.nativeElement.scrollIntoView()` em `afterRenderEffect` | FR-018 exige rolar até a última mensagem; Angular não oferece binding de rolagem | `CdkScrollable`/`ScrollingModule` não rolam até um elemento filho de altura variável sem acessar o DOM do mesmo jeito; `ViewportScroller` só rola a janela, não um contêiner |
| `ElementRef<HTMLTextAreaElement>.nativeElement.focus()` em `effect` do `ChatComposer` | FR-017 exige devolver o foco ao campo de texto ao fim do processamento; Angular não oferece binding de foco (exceção aprovada pelo responsável do produto em 2026-11-21) | Atributo `autofocus`/`cdkFocusInitial` só age na criação do elemento, não na transição `waiting → idle`; `FocusMonitor.focusVia` acessa o DOM do mesmo jeito com mais indireção |
| Tratamento de erro HTTP no store/mapper e não em Interceptor | O comportamento (429 bloqueia, texto do serviço vira balão de aviso) é específico deste endpoint | Interceptor global aplicaria regras de chat a todo HTTP (ex.: ícones) e precisaria de canal extra para devolver o estado ao store |
| Ambientes (`src/environments`) + `fileReplacements` | URL da API difere entre UAT e produção | URL fixa no código violaria "configurável por ambiente" (spec, Assumptions) |
