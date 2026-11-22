# rag-front-server2.0

## Tema e cores

O tema visual usa Angular Material (M3) configurado em `src/styles/`:

| Arquivo | Conteúdo |
|---------|----------|
| `src/styles/_tokens.scss` | **Única fonte de cores** (`--app-color-*`): marca, neutros e status |
| `src/styles/_theme.scss` | `mat.theme()` + overrides que mapeiam os tokens para os componentes Material e variantes de snackbar |
| `src/styles/_typography.scss` | Roboto auto-hospedada (`@fontsource/roboto`, 400/500/700) e pilha de fallback |

### Regras

- **Nunca use hexadecimal, `rgb()` ou `hsl()` fora de `src/styles/_tokens.scss`.** Em componentes, use
  `var(--app-color-*)` ou `var(--mat-sys-*)`.
- **Cor nova ou complementar**: declare-a apenas como token em `_tokens.scss` e adicione o par de
  contraste correspondente em `scripts/check-color-contrast.mjs` (array `PAIRS`).
- **Primária como cor de texto** (`--app-color-primary`) só em texto grande (≥ 24px, ou ≥ 18,66px em
  negrito) ou em elementos de interface; texto normal e links usam `--app-color-on-surface`.
- **Botões compactos**: se o rótulo grande não couber num `mat-flat-button`, use `mat-stroked-button`
  ou `mat-button` (rótulo escuro).

### Mensagens de status

Use `FeedbackSnackbarService` (`src/app/core/feedback/`) — a cor vem do tipo:

```ts
private readonly feedback = inject(FeedbackSnackbarService);

this.feedback.open('Dados salvos com sucesso.', 'success', 'Fechar');
// tipos: 'error' | 'success' | 'info' | 'warning'
```

### Página de demonstração

Com `npm start`, acesse [`/dev/tema`](http://localhost:4200/dev/tema) para ver todos os componentes
tematizados. A rota existe só em desenvolvimento: o build de produção substitui
`src/app/dev/dev.routes.ts` por `dev.routes.prod.ts` (`fileReplacements` em `angular.json`).

## Chatbot (`/chatbot`)

A página do chat fica em `src/app/features/chatbot/` e conversa com o serviço de recomendação por
`POST` com resposta em fluxo contínuo (`data: {"message": "..."}`).

- **URL da API por ambiente**: `src/environments/environment.ts` (produção — placeholder `/chat`) e
  `environment.development.ts` (UAT `http://127.0.0.1:8000/chat`, usado pelo `npm start` via
  `fileReplacements` da configuração `development` em `angular.json`). O valor chega ao código pelo
  `InjectionToken` `CHAT_API_URL` (`src/app/core/config/`), provido em `app.config.ts`; nos testes,
  forneça um valor próprio.
- **Apontar para o backend UAT**: suba o serviço em `http://127.0.0.1:8000` e rode `npm start`. Se o
  navegador bloquear por CORS, crie `proxy.conf.json` (`/chat` → `http://127.0.0.1:8000`), ligue-o
  em `serve.options.proxyConfig` e use `chatApiUrl: '/chat'` no ambiente de desenvolvimento.
- **Contexto seguro**: o `user_code` usa `crypto.randomUUID()`, disponível só em HTTPS ou `localhost`.

## Cadastro (`/register`)

A página de cadastro de clientes fica em `src/app/features/register/` e envia
`POST {authApiUrl}/register` com `{ Name, Email, Password }` ao serviço de autenticação.

- **URL da API por ambiente**: `authApiUrl` é a **base** do serviço (sem `/register`):
  `environment.development.ts` usa o UAT `http://localhost:5170/api/v1/auth`; `environment.ts`
  (produção) usa o placeholder `/api/v1/auth`. O valor chega ao código pelo `InjectionToken`
  `AUTH_API_URL` (`src/app/core/config/`), provido em `app.config.ts`; nos testes, forneça um valor
  próprio.
- **CORS**: a chamada sai de `http://localhost:4200` para `http://localhost:5170`, então o backend
  UAT precisa liberar essa origem (`POST`, cabeçalho `Content-Type`). Plano B: crie
  `proxy.conf.json` (`/api` → `http://localhost:5170`), ligue-o em `serve.options.proxyConfig` no
  `angular.json` e use `authApiUrl: '/api/v1/auth'` no ambiente de desenvolvimento.
- **Organização**: `AuthApiService` (único ponto HTTP, em `src/app/core/auth/`), mappers puros de
  entrada e de erro em `services/`, validadores em `validators/` e `RegistrationStore` (Signals)
  provido pela página — o estado e a requisição pendente morrem com ela. A senha nunca vai para URL,
  storage nem console.

## Login (`/login`)

A página de login fica em `src/app/features/login/` e envia `POST {authApiUrl}/login` com
`{ Email, Password }` (mesma base e mesmas observações de CORS do cadastro).

- **Sucesso**: a sessão (`accessToken`, `tokenType`, `expiresAt`, `clientId`) é salva pelo
  `AuthSessionService` (`src/app/core/auth/`) em `sessionStorage`, chave `achalocal.auth-session`
  (morre ao fechar a aba; nunca `localStorage`), e o cliente vai para `/dashboard`.
- **`/dashboard`**: por enquanto só a página "Área do cliente — em breve", sem guard (virá com a
  feature de dashboard, que consumirá `AuthSessionService.read()`).
- **Falhas**: a mensagem do serviço (401, 403, …) aparece num aviso vermelho; rede, timeout de 30 s
  ou resposta sem dados de sessão mostram uma mensagem genérica. O e-mail fica, a senha é apagada.
- **Compartilhado com o cadastro** (`src/app/core/`): envelope `ApiResponseDto` e leitura segura do
  corpo de erro (`api/`), `AuthApiService` (`auth/`) e `trimmedEmailValidator` (`forms/`).

### Layout compartilhado

`SiteHeader` fica em `src/app/core/layout/site-header/` e recebe os links por
`navigationItems: readonly NavigationItem[]` (landing: "testar chatbot", "registrar" e "login";
chatbot: "início" e "cadastrar"; cadastro e login: "início").

### Verificações

```bash
npm run lint:colors    # falha se houver cor literal fora de _tokens.scss
npm run lint:contrast  # contraste WCAG 2.1 dos pares de tokens e cores proibidas
npm test               # testes unitários (Vitest)
```
