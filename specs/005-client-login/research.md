# Research: Tela de Login de Clientes (/login)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. As decisões abaixo resolvem as
escolhas técnicas e os pontos que a spec deixou para o plano.

## R-01 — Reuso do código do cadastro (promoção para `core/`)

- **Decision**: mover para `core/` o que passa a ter dois consumidores reais:
  - `features/register/models/api-response.dto.ts` → `core/api/api-response.dto.ts`
  - helpers privados de `registration-error.mapper.ts` (`isApiResponse`, `parseBody`,
    `readableMessage`, `isRecord`) → `core/api/api-response-body.ts` (exportados e testados)
  - `features/register/services/auth-api.service.ts` → `core/auth/auth-api.service.ts` (+ `login()`)
  - `features/register/validators/trimmed-email.validator.ts` → `core/forms/trimmed-email.validator.ts`
  
  Os specs acompanham os arquivos; os imports do cadastro são atualizados sem mudar comportamento.
- **Rationale**: Princípio VII (sem duplicação quando o compartilhamento é real) e o próprio plano
  004, que previu "promover a `core/` quando o login existir". Importar de `features/register/` dentro
  de `features/login/` acoplaria features entre si (Princípio II).
- **Alternatives considered**: (a) duplicar serviço/DTO no login — viola VII; (b) importar direto do
  cadastro — acoplamento entre features; (c) extrair também `notBlankValidator`,
  `toFieldErrorMessage` e o toggle de senha — o login não usa `notBlank` (senha é só obrigatória) e as
  mensagens/toggle são poucas linhas com textos próprios; extrair agora seria abstração prematura.

## R-02 — Contrato de requisição

- **Decision**: `POST {AUTH_API_URL}/login` com corpo `{ "Email": string, "Password": string }`
  (PascalCase, igual ao cadastro). URL base já configurada (`environment.authApiUrl`), nada muda em
  ambientes nem em `app.config.ts`.
- **Rationale**: o exemplo em `.mine/login_page/plan.md` mistura `Email` e `password`; o backend
  (ASP.NET) associa propriedades sem diferenciar maiúsculas, e manter o padrão do cadastro evita
  surpresa. O teste do serviço fixa o corpo enviado.
- **Alternatives considered**: copiar o exemplo literal (`Email`/`password`) — inconsistente sem
  ganho; camelCase — diverge do cadastro já validado em UAT.

## R-03 — Onde guardar a sessão

- **Decision**: `AuthSessionService` (`core/auth/`, `providedIn: 'root'`) mantém a sessão em memória
  e espelha em `sessionStorage` (chave `achalocal.auth-session`, JSON com `accessToken`, `tokenType`,
  `expiresAt` ISO, `clientId`). Leitura: memória → storage; se o JSON for inválido ou
  `expiresAt <= agora`, a sessão é apagada e `null` é devolvido. Todo acesso ao storage fica em
  `try/catch` silencioso (modo privado/cota) — nesse caso vale só a memória.
- **Rationale**: FR-015 (dura até a expiração ou o fechamento da aba, o que vier primeiro) e FR-021
  (nada persistente após fechar o navegador). `sessionStorage` cumpre ambos e mantém o login após F5
  em `/dashboard`. `accessCode` e `business` não são guardados (não exigidos pela spec; YAGNI) —
  o dashboard pode ampliar o modelo quando especificar a necessidade.
- **Alternatives considered**: só memória (perde login a cada recarga); `localStorage` (proibido —
  Princípio IV, FR-021); cookie HttpOnly (exige backend; fora do escopo). Exceção registrada no
  Complexity Tracking do plano.

## R-04 — Validação da resposta de sucesso

- **Decision**: `toAuthSession(response: unknown): AuthSession | null` aceita apenas quando
  `success !== false` e `data` tem `accessToken` (string não vazia), `tokenType` (string não vazia),
  `expiresAt` (data ISO interpretável) e `clientId` (número). Caso contrário → falha genérica, nada é
  guardado, sem redirecionamento (edge case da spec). **Não** rejeita `expiresAt` já passado no login;
  a expiração é verificada na leitura (`AuthSessionService.read()`).
- **Rationale**: dados obrigatórios garantem que a próxima feature terá o que precisa; rejeitar por
  relógio do cliente adiantado bloquearia logins válidos e confundiria o usuário.
- **Alternatives considered**: confiar no tipo genérico do `HttpClient` (sem validação em tempo de
  execução — Princípio III pede tipagem, e o edge case exige tratar resposta incompleta).

## R-05 — Mapeamento de erros

- **Decision**: `mapLoginError(error: unknown): string`:
  - não é `HttpErrorResponse`, `status === 0`, `TimeoutError` → `GENERIC_ERROR_TEXT`
    ("Não foi possível entrar agora. Tente novamente em instantes.");
  - qualquer status com corpo no envelope → `message` legível, senão `error.detail` legível, senão
    genérica. Cobre 401 ("E-mail ou senha inválidos."), 403 (e-mail não confirmado), 400/5xx com texto.
  - Nunca usa `title`, `status`, `instance`, `correlationId`.
  Resposta 2xx com `success: false` ou sem sessão válida → genérica (R-04).
- **Rationale**: FR-016/FR-017; mesma regra de legibilidade do cadastro, reaproveitando
  `core/api/api-response-body.ts`. O login não tem erros por campo (não há 400 por campo no contrato),
  então o resultado é um único texto — modelo mais simples que `RegistrationFailure`.
- **Alternatives considered**: tipos de falha (`invalid-credentials`, `email-not-confirmed`) — nenhuma
  regra de tela depende do tipo; seria complexidade sem uso.

## R-06 — Redirecionamento e rota `/dashboard`

- **Decision**: em caso de sucesso, `LoginStore` salva a sessão, põe status `succeeded` (formulário
  continua bloqueado) e chama `router.navigateByUrl('/dashboard')`, ignorando rejeição com
  `.catch(() => undefined)` para não chegar ao console. `AppPaths.dashboard = 'dashboard'` com
  `ComingSoonPage` (`data.featureName: 'Área do cliente'`, título "Área do cliente — em breve"), sem
  guard.
- **Rationale**: spec (Assumptions) pede `/dashboard` como destino válido até a feature própria;
  padrão já usado por `/cadastrar-negocio`. Manter `succeeded` evita reenvio/flicker durante a
  navegação lazy.
- **Alternatives considered**: navegar no componente reagindo ao status (regra de fluxo no
  componente); criar guard agora (antecipa decisões do dashboard).

## R-07 — Formulário: validação, bloqueio, limpeza e foco

- **Decision**: `email: ['', [required, trimmedEmailValidator, maxLength(254)]]`,
  `password: ['', [required, maxLength(64)]]` + atributo `maxlength` nos inputs; `autocomplete="email"`
  e `autocomplete="current-password"`. Mesmo `effect` do cadastro: `submitting` → `form.disable()`;
  `failed` → `form.enable()` + `password.reset('')` (fica pristine/untouched, sem "Campo obrigatório"
  imediato); `succeeded` → permanece desabilitado. Envio inválido → `markAllAsTouched()` + foco no
  primeiro `MatInput` inválido. Aviso de erro some via `(input)` no `<form>` → `store.dismissError()`
  (o `reset` programático não dispara `input`, então não apaga o aviso recém-exibido); novo envio
  também limpa (FR-019).
- **Rationale**: FR-007–FR-013, FR-018, FR-019; reaproveita o padrão validado no 004; evita
  `valueChanges.subscribe()` no componente (Princípio I).
- **Alternatives considered**: `valueChanges` com `takeUntilDestroyed` — dispararia também no
  `reset()` da senha e apagaria o aviso logo após aparecer.

## R-08 — Assinatura, timeout, cancelamento, console e sessão anterior

- **Decision**: igual ao `RegistrationStore`: `timeout(30_000)`, `takeUntilDestroyed(destroyRef)` do
  store provido na página (sair da página cancela e nada é salvo), `catchError` → `EMPTY`, guarda de
  duplo envio por `isSubmitting()`. Uma falha de login **não** apaga sessão anterior existente; um
  sucesso a substitui (`save` sobrescreve).
- **Rationale**: FR-017, FR-022, edge cases da spec. Apagar a sessão anterior numa falha seria uma
  regra de negócio não pedida (logout implícito) — fora do escopo.
- **Alternatives considered**: interceptor de timeout global (afetaria o streaming do chat).

## R-09 — CORS no UAT

- **Decision**: mesma situação e mesmo plano B da feature 004 (proxy do dev server em `/api` →
  `http://localhost:5170` + `authApiUrl: '/api/v1/auth'`), documentado no quickstart. Nenhuma mudança
  de configuração nesta feature se o CORS do UAT já estiver liberado.
- **Rationale / Alternatives**: ver research R-08 da feature 004.

## R-10 — Ícone, cabeçalho e textos

- **Decision**: novo ícone `login` (Material Symbols, `public/icons/login.svg`, `fill="currentColor"`,
  `viewBox="0 -960 960 960"`) registrado em `APP_ICON_NAMES`; usado no item "login" da landing e no
  topo do cartão. Ordem no cabeçalho da landing: "testar chatbot", "registrar", "login". Página
  `/login`: cabeçalho com "início". Título da aba: "Login — AchaLocal". Textos: título "Acesse sua
  conta", subtítulo "Gerencie seus negócios no AchaLocal.", botão "entrar", rótulo do spinner
  "Entrando".
- **Rationale**: FR-001–FR-006; padrão de ícones locais do projeto (sem fontes externas).
- **Alternatives considered**: reutilizar `person_add` (sugere cadastro, confunde o usuário).

## R-11 — Layout responsivo

- **Decision**: copiar a estrutura da página de cadastro (`main` centralizado, cartão com
  `max-width` e largura 100% em telas pequenas, mesmos tokens de espaçamento). Ações à direita com o
  spinner à esquerda do botão.
- **Rationale**: FR-005, SC-007; consistência visual com o desenho do cadastro.
