# Research: Área do Cliente (/dashboard)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. As decisões abaixo resolvem as
escolhas técnicas e os pontos que a spec deixou para o plano ("endereço e formato da resposta serão
definidos no plano").

## R-01 — Guard de acesso

- **Decision**: `authGuard: CanActivateFn` em `core/auth/auth.guard.ts`. Chama
  `AuthSessionService.read()` (que já descarta sessão ausente, corrompida ou expirada) e devolve
  `true` ou `router.createUrlTree(['/login'])`. Síncrono, sem HTTP. Aplicado a `dashboard`,
  `editar-negocio` e `excluir-negocio`.
- **Rationale**: Princípio IV (toda rota autenticada com guard). `read()` já concentra a regra de
  validade (feature 005, contrato `auth-session.md`), então o guard só decide. `canActivate` roda em
  toda navegação — URL digitada, link, F5, voltar/avançar — e antes do carregamento lazy do
  componente, atendendo FR-002 e SC-001 ("nem por um instante").
- **Alternatives considered**: guard de classe (`CanActivate`) — API legada; `canMatch` — faria
  `/dashboard` cair no 404/wildcard em vez de redirecionar; checar na própria página — o conteúdo
  apareceria antes da decisão.

## R-02 — Envio do token (interceptor)

- **Decision**: `authTokenInterceptor: HttpInterceptorFn` registrado com
  `provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor]))`. Só atua em URLs que
  começam com `API_BASE_URL + '/'` **e não** com `AUTH_API_URL + '/'`:
  1. lê a sessão (`read()`); se não houver sessão válida → `AuthRedirectService.redirectToLogin()` e
     devolve `EMPTY` (a requisição não sai);
  2. senão clona a requisição com `Authorization: ${tokenType} ${accessToken}` (`Bearer …`);
  3. se a resposta for 401 → `redirectToLogin()` e devolve `EMPTY`; demais erros são repassados.
- **Rationale**: Princípio III (autenticação e erro transversal via interceptor); FR-004, FR-019 e
  User Story 1 cenário 5 (sessão expira com a página aberta). Restringir por prefixo evita mandar o
  token ao serviço de chat (`127.0.0.1:8000`) e evita que o 401 "credencial inválida" do `/auth/login`
  expulse o usuário. Devolver `EMPTY` evita piscar a mensagem de erro antes da navegação.
- **Alternatives considered**: adicionar o cabeçalho no `BusinessApiService` — cada serviço futuro
  repetiria; interceptor global sem filtro de URL — vazaria o token para o chat e quebraria o login;
  403 também redirecionar — 403 significa "autenticado mas sem permissão", não sessão inválida; cai no
  erro genérico.

## R-03 — URL do serviço de negócio

- **Decision**: novo token `API_BASE_URL` (`core/config/api-base-url.token.ts`) com
  `environment.apiBaseUrl` = `http://localhost:5170/api/v1` (dev) e `/api/v1` (prod, placeholder
  como os demais). Endpoint: `GET ${apiBaseUrl}/${clientId}/business`, `clientId` lido da sessão.
- **Rationale**: o endpoint de `.mine/dash-board_page/plan.md` não fica sob `/auth`, então
  `AUTH_API_URL` não serve; um token base genérico também é o critério de escopo do interceptor
  (R-02). `clientId` já está na sessão (`AuthSession.clientId`), não há outra fonte.
- **Alternatives considered**: derivar de `AUTH_API_URL` cortando `/auth` — frágil; token específico
  `BUSINESS_API_URL` — o interceptor precisaria de uma lista de prefixos; endpoint "me"
  (`/business` sem id) — não existe no backend.

## R-04 — Mapeamento de respostas para estados

- **Decision** (`business-response.mapper.ts`, ver [contracts/business-api.md](./contracts/business-api.md)):

  | Resposta | Resultado | Estado |
  |----------|-----------|--------|
  | 2xx, `success !== false`, `data` objeto com `name` texto não vazio | `found` | `loaded` |
  | 2xx com `data: null` | `not-found` | `empty` |
  | HTTP 404 | `not-found` | `empty` |
  | 2xx com `success: false` ou `data` sem `name` válido | `invalid` | `failed` |
  | rede (`status 0`), timeout 30 s, 4xx (≠401/404), 5xx | erro | `failed` |
  | 401 / sessão expirada | interceptor redireciona | — (página destruída) |

  A mensagem de falha é sempre o texto fixo da spec (FR-014); o `message` do serviço nunca é exibido.
- **Rationale**: o plano do usuário só mostra o 200 com negócio. Para cliente sem negócio, APIs REST
  do mesmo backend usam 404 com envelope, mas `200` + `data: null` também é comum; aceitar os dois
  impede que todo cliente novo veja "erro". Spec, edge case "dados incompletos → falha".
- **Alternatives considered**: só 404 ou só `data: null` — risco de erro falso; exibir `message` do
  serviço — FR-014 pede texto fixo sem detalhes técnicos.
- **Pendente**: confirmar com o backend qual forma é usada; remover o ramo não usado depois.

## R-05 — Imagem do negócio

- **Decision**: `Business` não tem campo de imagem; o cartão mostra sempre o ícone padrão `image`
  sobre fundo `--app-color-accent` (área superior do cartão, como em `dash02`).
- **Rationale**: a resposta da API não traz imagem. A spec já prevê "ícone padrão se não houver".
  Modelar `imageUrl` sem fonte de dados seria YAGNI.
- **Alternatives considered**: campo opcional `imageUrl` + `<img>` com fallback — código morto até a
  API ter o campo.

## R-06 — Estado da página (store)

- **Decision**: `DashboardStore` (`@Injectable()`, provido em `DashboardPage`) com
  `status = signal<DashboardStatus>('loading')` e `business = signal<Business | null>(null)`;
  `load()` chamado no construtor da página (sem `ngOnInit` lógico) e por "Tentar novamente".
  Pipeline: `api.getClientBusiness(clientId).pipe(timeout(30_000), takeUntilDestroyed, catchError)`.
  Chamadas de `load()` com status `loading` em curso são ignoradas (duplo clique no retry).
- **Rationale**: mesmo padrão de `LoginStore`/`RegistrationStore`; prover na página faz o estado
  morrer com ela e cancela a requisição ao sair (edge case "sai durante o carregamento"). Refaz a
  consulta a cada abertura (FR-009).
- **Alternatives considered**: `resource()`/`httpResource` — API ainda experimental no projeto e
  diverge do padrão das features anteriores; resolver de rota — atrasaria a navegação e não daria
  estado de carregamento visível (FR-010).

## R-07 — "Sair" e redirecionamentos

- **Decision**: `AuthRedirectService` (`core/auth/`, root):
  - `redirectToLogin()`: `session.clear()` + `navigateByUrl('/login')`.
  - `signOut()`: `session.clear()` + `navigateByUrl('/', { replaceUrl: true })`.
  Navegações com `.catch(() => undefined)` para não poluir o console. O botão "Sair" é projetado em
  `SiteHeader` via `<ng-content />`.
- **Rationale**: FR-017/SC-004 — após sair, voltar ao `/dashboard` passa pelo guard e cai no
  `/login`; `replaceUrl` ainda remove a entrada do histórico. Três consumidores reais (guard não
  precisa — devolve `UrlTree`; interceptor e página sim, store via interceptor).
- **Alternatives considered**: lógica de logout no componente — viola Princípio II; chamar endpoint
  de logout — fora do escopo (spec, Assumptions).

## R-08 — Layout e componentes visuais

- **Decision**:
  - Cabeçalho: `SiteHeader` com itens `Testar Chatbot` (`chat` → `/chatbot`), `Meus negócios`
    (`grid_view` → `/dashboard`) e botão projetado `Sair` (`logout`).
  - Título `h1` "Meus negócios" + subtítulo; botão `mat-flat-button` "Novo negócio" (`add`) à
    direita, só no estado `empty`; em < 600 px título e botão empilham.
  - Conteúdo: `mat-card` com borda (`appearance="outlined"`) — estado vazio (ícone `storefront` em
    quadrado `--app-color-accent`, textos, `mat-flat-button` "Cadastrar agora") ou cartão do negócio
    (≈ 600 px máx.: área de imagem, nome com `text-overflow: ellipsis` e `title`, `mat-stroked-button`
    "Editar" (`edit`) + `mat-icon-button` "Excluir" (`delete`, cor `--app-color-error-text`,
    `aria-label="Excluir negócio"`)).
  - Carregando: `mat-progress-spinner` com `role="status"` e texto oculto "Carregando seus dados".
  - Erro: bloco `role="alert"` com o texto fixo + `mat-stroked-button` "Tentar novamente".
  - Cartão do chatbot: `mat-card` com fundo `--app-color-accent`, ícone `chat`, título, texto e
    `mat-stroked-button` "Abrir o chat" → `/chatbot`.
- **Rationale**: esboços `dash`/`dash02`; Princípio V (Material primeiro, tokens existentes, nada de
  hex). Os verdes e bege dos esboços equivalem a `--app-color-primary`, `--app-color-accent` e
  `--app-color-surface`.
- **Alternatives considered**: criar tokens novos para as cores exatas do esboço — diferença
  imperceptível, viola "paleta padrão".

## R-09 — CORS e ambiente

- **Decision**: igual às features 004/005 — o UAT precisa liberar `http://localhost:4200`, agora
  também com o cabeçalho `Authorization` (preflight `OPTIONS`). Plano B documentado no quickstart:
  proxy do dev server.
- **Rationale**: requisição com `Authorization` deixa de ser "simple request".
- **Alternatives considered**: nenhuma no front; é configuração do backend.

## R-10 — Ícones

- **Decision**: adicionar `add`, `edit`, `delete`, `image`, `logout`, `grid_view` (SVG Material
  Symbols, mesmo estilo dos existentes) em `public/icons/` e em `APP_ICON_NAMES`. Reusar `chat` e
  `storefront`.
- **Rationale**: padrão do projeto (`provideAppIcons` + SVG locais, sem fonte de ícones externa).
- **Alternatives considered**: fonte Material Symbols via Google Fonts — dependência externa nova.
