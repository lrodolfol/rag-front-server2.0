# Research: Cadastro de Negócio (/dashboard/new)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. As decisões abaixo resolvem o que a
spec deixou para o plano ("endereço e formato da solicitação serão definidos no plano"; "obrigatoriedade
e limites serão confrontados no plano"; "formato do telefone será definido no plano") e incorporam as
decisões do usuário em `.mine/cadastro-de-negocios/plan.md` e no esboço
`.mine/cadastro-de-negocios/cadastro-page.excalidraw`.

## R-01 — Campos, obrigatoriedade e limites (decisão do usuário)

- **Decision**: o mapeamento de `.mine/cadastro-de-negocios/plan.md` substitui a tabela original de
  FR-007 (a spec foi atualizada para refletir isto):

  | Rótulo (esboço)        | Campo do payload | Obrigatório | Regras |
  |------------------------|------------------|-------------|--------|
  | "Nome do negócio"      | `name`           | Sim         | 2–100 caracteres |
  | "Descrição rápida"     | `description`    | Não         | até 150 caracteres; uma linha |
  | "Descrição completa"   | `detalhes`       | Sim         | 20–1000 caracteres; várias linhas; contador |
  | "Endereço completo"    | `address`        | Sim         | 5–200 caracteres |
  | "E-mail"               | `email`          | Não         | se preenchido: formato válido; até 150 caracteres |
  | "Telefone"             | `telephone`      | Não         | se preenchido: 10 ou 11 dígitos com DDD; máscara (R-06) |

- **Rationale**: o usuário definiu explicitamente quais campos são obrigatórios; a "Descrição
  completa" alimenta a IA (texto de apoio do esboço), por isso é obrigatória e tem limite maior (o
  exemplo do payload tem ~330 caracteres). A "Descrição rápida" é uma linha no esboço → 150
  caracteres. Mínimos evitam textos vazios de sentido (FR-008).
- **Alternatives considered**: manter a tabela anterior de FR-007 (Descrição/E-mail/Telefone
  obrigatórios, Detalhes opcional) — contradiz a decisão do usuário; limites maiores para
  `description` — o esboço mostra campo de uma linha.

## R-02 — Endpoint e payload

- **Decision**: `POST {API_BASE_URL}/{clientId}/business` (dev:
  `http://localhost:5170/api/v1/{clientId}/business`; o `1` do exemplo do usuário é o `clientId`).
  Reutiliza `API_BASE_URL`/`environment.apiBaseUrl` — nada novo em `environment*.ts`. Corpo:

  ```json
  { "name": "...", "description": "..." | null, "email": "..." | null,
    "address": "...", "telephone": "35995678901" | null, "detalhes": "..." }
  ```

  Chave `detalhes` exatamente como no payload de exemplo do usuário. Campos opcionais vazios são
  enviados como `null` (após `trim`).
- **Rationale**: mesmo recurso e mesmo `clientId` (da sessão) que o `GET` da feature 006; o
  `authTokenInterceptor` já cobre a URL (prefixo `API_BASE_URL/`). `null` diferencia "não informado"
  de string vazia e é aceito por desserializadores comuns de `string?`.
- **Alternatives considered**: omitir chaves opcionais — se o backend exigir presença das chaves,
  falha; enviar `""` — mistura "vazio" com "não informado".
- **Confirmado pelo usuário (2026-11-25)**: o backend aceita
  1. a chave `detalhes` no `POST` (o `GET` continua devolvendo `details`);
  2. `null` nos campos opcionais vazios;
  3. os códigos de resposta de R-03 (409 para "já possui negócio"; 400/422 para dados inválidos);
  4. CORS com preflight (`Authorization` + `Content-Type: application/json`) para
     `http://localhost:4200`.

## R-03 — Respostas do POST → resultado

- **Decision** (`business-registration-error.mapper.ts` / store):

  | Resposta | Resultado | Efeito |
  |----------|-----------|--------|
  | 2xx com `success !== false` | `succeeded` | navega a `/dashboard` (`replaceUrl`) + aviso de sucesso |
  | 2xx com `success: false` | `failed: generic` | "Não foi possível cadastrar seu negócio agora. Tente novamente em instantes." |
  | 409 | `already-registered` | aviso "Você já possui um negócio cadastrado." + navega a `/dashboard` (`replaceUrl`) |
  | 400 / 422 | `failed: invalid-data` | "Verifique os dados informados e tente novamente." (sem destacar campos) |
  | 401 | interceptor descarta a sessão e leva a `/login` | — |
  | status 0, timeout 30 s, 403, 404, 5xx, outro | `failed: generic` | mensagem genérica |

- **Rationale**: User Story 5 + FR-016/FR-017. 409 é o código HTTP natural para "recurso já
  existe" (1 negócio por cliente). Nenhum `message`/`errors`/`correlationId` do serviço é exibido.
- **Alternatives considered**: reconhecer "já possui negócio" pelo texto do `message` — frágil;
  aceitar só 201 — rejeitaria um 200 válido.

## R-04 — Rota `/dashboard/new` e verificação "sem negócio"

- **Decision**:
  - `AppPaths.newBusiness = 'dashboard/new'`; rota irmã de `dashboard` em `app.routes.ts`
    (`path: 'dashboard/new'`, `canActivate: [authGuard]`, lazy `BusinessRegistrationPage`, título
    "Novo negócio — AchaLocal").
  - A verificação de existência de negócio é feita pela página (store), **não** por guard: ao abrir,
    `BusinessRegistrationStore.check()` chama o mesmo `GET {clientId}/business` do dashboard e
    reutiliza `toBusinessLoadResult`/`errorToBusinessLoadResult`: `not-found` → formulário;
    `found` → `navigateByUrl('/dashboard', { replaceUrl: true })`; `invalid`/erro/timeout →
    estado `check-failed` com "Tentar novamente".
  - A rota antiga `cadastrar-negocio` (placeholder "em breve") vira `redirectTo: 'dashboard/new'`:
    os links públicos da landing e do chatbot continuam válidos e passam pelo `authGuard`.
  - "Cadastrar agora" e "Novo negócio" do dashboard passam a apontar para `AppPaths.newBusiness`.
- **Rationale**: FR-003/FR-005 exigem indicador de carregamento e erro com retry **na página**, o
  que um guard assíncrono não oferece (a navegação ficaria pendente sem feedback). O componente é
  criado a cada navegação (URL, link, F5, voltar/avançar), então a verificação roda em toda forma de
  acesso e o formulário só é renderizado no estado `ready` (FR-003). Rota irmã evita transformar
  `DashboardPage` em layout com `<router-outlet>` (mudança desnecessária na feature 006).
- **Alternatives considered**: guard assíncrono `noBusinessGuard` — sem estado de carregamento/erro
  visível; rotas filhas de `dashboard` com `children` — exigiria refatorar a página do dashboard em
  layout; remover `cadastrar-negocio` — quebraria links da landing/chatbot.

## R-05 — Serviço de negócio compartilhado

- **Decision**: mover `BusinessApiService`, `BusinessResponseDataDto`, `Business`,
  `BusinessLoadResult` e `business-response.mapper` de `features/dashboard/` para
  `core/business/` e adicionar `registerBusiness(clientId, request)` ao serviço.
- **Rationale**: Princípio VII — agora há dois consumidores reais (dashboard e cadastro) do mesmo
  recurso; importar de outra feature criaria acoplamento entre features (Princípio II). Os testes
  existentes acompanham os arquivos.
- **Alternatives considered**: segundo serviço HTTP na nova feature — duplicaria a URL e o `GET`;
  importar de `features/dashboard` — dependência cruzada entre features.

## R-06 — Telefone: máscara e formato enviado

- **Decision**:
  - Funções puras em `features/business-registration/services/phone-mask.ts`:
    `extractDigits(text)` e `formatPhone(digits)` → `(XX) XXXX-XXXX` (10) / `(XX) XXXXX-XXXX` (11) /
    formatação parcial durante a digitação / dígitos crus quando > 11.
  - O componente do formulário trata o evento `(input)` do campo: lê o valor, extrai os dígitos; se
    `inputType` não for colagem (`insertFromPaste`/`insertFromDrop`), limita a 11 dígitos; aplica
    `control.setValue(formatPhone(digits), { emitEvent: false })`. Valor colado com > 11 dígitos é
    mantido (não truncado) e o validador `brazilianPhoneValidator` marca `phone`.
  - Validador: vazio → válido (opcional); senão exige 10 ou 11 dígitos.
  - **A máscara é só de exibição** (decisão do usuário): o serviço recebe apenas os dígitos
    (`extractDigits`), ex.: `"35995678901"`. Nenhum parêntese, espaço ou hífen vai no payload.
- **Rationale**: FR-007a sem dependência nova (Princípio VII; `ngx-mask` seria a alternativa).
  `setValue` via Reactive Forms respeita o Princípio IV (sem manipular DOM). Separar exibição
  (máscara) de dado (dígitos) mantém o backend independente do formato visual.
- **Alternatives considered**: `ngx-mask` — dependência nova para um único campo; enviar o valor
  mascarado ou o formato `35 9 95678901` do exemplo — rejeitado pelo usuário: máscara é
  responsabilidade do frontend.

## R-07 — Validações e mensagens

- **Decision**: Reactive Forms (`NonNullableFormBuilder`). Validadores: `Validators.required` +
  `notBlankValidator` (obrigatórios), `trimmedMinLength(n)` (novo, mínimo calculado sobre o valor
  com `trim`), `Validators.maxLength`, `trimmedEmailValidator` (core), `brazilianPhoneValidator`
  (novo). `notBlankValidator` é movido de `features/register/validators/` para `core/forms/` (dois
  consumidores reais). Mensagens (uma por vez, por prioridade) em
  `business-field-message.ts`:
  - required/blank → "Campo obrigatório."
  - minlength → "Informe pelo menos {n} caracteres."
  - maxlength → "Use no máximo {n} caracteres." (alcançável só por colagem, pois `maxlength` no
    `<input>` impede digitar além; mantém FR-007 cenário 4)
  - email → "Informe um e-mail válido."
  - phone → "Informe um telefone válido com DDD."
  Erros exibidos em `mat-error` (ao sair do campo — `touched` — e ao enviar via
  `markAllAsTouched()`); foco no primeiro inválido via `viewChildren(MatInput)` na ordem dos campos
  (mesmo padrão de `RegisterForm`). Contadores com `mat-hint align="end"` em "Descrição completa"
  (e "Descrição rápida").
- **Rationale**: FR-008–FR-011; padrão já usado em `RegisterForm`/`LoginForm`; `mat-error` já é
  associado ao campo por `aria-describedby` (FR-024).
- **Alternatives considered**: validar só no envio — FR-008 pede ao sair do campo; Signal Forms —
  diverge do padrão do projeto.

## R-08 — Estado da página e envio

- **Decision**: `BusinessRegistrationStore` (`@Injectable()`, provido na página) com
  `status: 'checking' | 'check-failed' | 'ready' | 'submitting' | 'submit-failed'` e
  `failureMessage: string | null`. `check()` (construtor da página e "Tentar novamente") e
  `submit(input)`; ambos ignoram chamadas com requisição em curso (duplo clique — SC-007);
  `timeout(30_000)`, `takeUntilDestroyed`, `catchError` → estado; `finalize` libera a trava (o
  interceptor pode completar sem emitir em 401). Sucesso e "já possui" chamam
  `navigateByUrl('/dashboard', { replaceUrl: true })` e em seguida
  `FeedbackSnackbarService.open(texto, 'success' | 'warning', 'Fechar')`.
- **Rationale**: mesmo padrão de `DashboardStore`/`RegistrationStore`. `replaceUrl` tira
  `/dashboard/new` do histórico (User Story 3, cenário 4); mesmo que o usuário volte por outra
  entrada, a verificação o devolve ao dashboard. O `MatSnackBar` é overlay global: sobrevive à troca
  de rota, some em ~5 s, tem ação "Fechar" focável por teclado, usa `aria-live` (`polite` para
  sucesso) e não reaparece no F5 porque não há estado persistido (FR-015). Sair da página durante o
  envio cancela a assinatura sem erro visível (edge case).
- **Alternatives considered**: flag em `sessionStorage`/`history.state` para o dashboard mostrar o
  aviso — mais código e risco de reaparecer; dois stores (verificação e envio) — dividiria um fluxo
  de estados único; `resource()` — diverge do padrão.

## R-09 — Layout (esboço `cadastro-page.excalidraw`) e botão fixo

- **Decision**:
  - Cabeçalho: `SiteHeader` com `DASHBOARD_NAVIGATION_ITEMS` ("Testar Chatbot", "Meus negócios") e
    botão projetado "Sair" (`AuthRedirectService.signOut()`), igual ao dashboard (FR-019). Os
    itens/rótulos são importados de `dashboard-content.ts`.
  - Coluna central (máx. ≈ 600 px): link-botão "← Voltar" (`mat-button`, ícone `arrow_back`),
    `h1` "Novo negócio", subtítulo do esboço.
  - Três `mat-card appearance="outlined"` com `h2`: **Informações básicas** (Nome do negócio *,
    Descrição rápida, Descrição completa * com `textarea` `cdkTextareaAutosize` e hint "Esta
    descrição é usada pela IA para encontrar você quando alguém perguntar algo relacionado."),
    **Endereço** (Endereço completo *), **Contato** (E-mail e Telefone lado a lado ≥ 600 px; em
    coluna abaixo disso). Placeholders do esboço.
  - **Barra de ações fixa** (decisão do usuário): `div.actions` com `position: sticky; bottom: 0`,
    fundo `--app-color-surface` e borda superior, contendo `mat-flat-button type="submit"`
    "Cadastrar negócio" (ícone `save`) alinhado à direita (largura total < 600 px). Durante o envio:
    `mat-progress-spinner` 20 px + `aria-label="Cadastrando negócio"` e botão desabilitado. Fica
    visível em qualquer posição de rolagem e não cobre o último campo (`padding-bottom` no
    conteúdo).
  - Mensagens de falha de envio: bloco `role="alert"` logo acima da barra de ações.
  - "← Voltar" cumpre o papel de "Cancelar" de FR-012: sem conteúdo → `/dashboard`; com conteúdo →
    `MatDialog` `DiscardChangesDialog` ("Descartar os dados preenchidos?" — "Continuar editando"
    (`mat-dialog-close`, foco inicial) / "Descartar"); `MatDialog` já dá `role="dialog"`,
    `aria-modal`, trap de foco e `Esc`.
  - Estados `checking` (spinner + texto oculto "Verificando seus dados", `role="status"`) e
    `check-failed` (`role="alert"` + "Tentar novamente") no lugar dos cartões.
- **Rationale**: o plano do usuário manda seguir o esboço; textos do esboço substituem "Cadastrar
  negócio"/"Cancelar" da spec (spec atualizada). `sticky` mantém o botão no fluxo do documento (sem
  sobrepor o rodapé) e funciona de 320 a 1920 px; Material + tokens existentes (Princípio V).
- **Alternatives considered**: `position: fixed` — sobrepõe conteúdo e exige compensação manual;
  botão "Cancelar" adicional na barra — o esboço não tem; `confirm()` nativo — sem identidade visual
  e fora do Material.

## R-10 — Ícones

- **Decision**: adicionar `arrow_back` e `save` (SVG Material Symbols, mesmo estilo) em
  `public/icons/` e em `APP_ICON_NAMES`. Reusar `logout`, `chat`, `grid_view`.
- **Rationale**: padrão `provideAppIcons` (feature 001); ← e ▣ do esboço.
- **Alternatives considered**: fonte Material Symbols remota — dependência externa.

## R-11 — Testes

- **Decision**: Vitest + jsdom (`ng test`): `BusinessApiService.registerBusiness`
  (`HttpTestingController`: método, URL, corpo, sem `Authorization` adicionado pelo serviço);
  mappers (input → DTO, erro → falha); `phone-mask`; validadores; `business-field-message`;
  `BusinessRegistrationStore` (check: found/not-found/erro/timeout/retry; submit: sucesso, 409,
  400, 5xx, timeout, duplo envio, navegação + snackbar); `BusinessRegistrationForm` (máscara,
  mensagens, foco, contador, desabilitar no envio, dados preservados na falha);
  `DiscardChangesDialog`; `BusinessRegistrationPage` (integração com `RouterTestingHarness` +
  `HttpTestingController`: fluxo completo, cliente com negócio → `/dashboard`, sem sessão →
  `/login`, 401 no envio → `/login`); rotas (`dashboard/new`, redirect de `cadastrar-negocio`);
  ajuste dos specs do dashboard (links) e dos arquivos movidos.
- **Rationale**: Princípio VI; fluxo crítico "dashboard → cadastro → dashboard" coberto por
  integração.
- **Alternatives considered**: E2E — ferramenta ainda não definida no projeto (constitution).
