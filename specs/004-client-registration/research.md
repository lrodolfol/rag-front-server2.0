# Research: Tela de Cadastro de Clientes (/register)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-22

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. As decisões de negócio em aberto
(mensagem de sucesso, onde mostrar os erros 409/400, textos da tela) foram confirmadas pelo
responsável em 2026-11-22 e registradas em `spec.md` → Clarifications.

---

## R-01 — Endereço da API por ambiente

- **Decision**: novo `AUTH_API_URL` (`InjectionToken<string>`) em `core/config/`, alimentado por
  `environment.authApiUrl` com a **base** do serviço (`http://localhost:5170/api/v1/auth` em
  development; `/api/v1/auth` como placeholder em produção). `AuthApiService` acrescenta `/register`.
- **Rationale**: repete o padrão `CHAT_API_URL` + `fileReplacements` da feature 003. A base (e não a
  URL completa) evita um segundo token quando o login usar o mesmo serviço; o custo é zero.
- **Alternatives considered**: URL completa no environment (funciona, mas mistura rota do endpoint
  com configuração de host); URL fixa no serviço (viola "configurável por ambiente").

## R-02 — Formulário, validação e normalização

- **Decision**: `FormGroup` tipado (`NonNullableFormBuilder`) no `RegisterForm`, com:
  - `name`: `Validators.required`, `notBlankValidator`, `Validators.maxLength(100)`;
  - `email`: `Validators.required`, `Validators.email` aplicado ao valor **após trim** (validador
    `trimmedEmailValidator` dentro de `validators/` que delega a `Validators.email`),
    `Validators.maxLength(254)`;
  - `password`: `Validators.required`, `passwordStrengthValidator` (erros `minLength`,
    `missingLetter`, `missingNumber`), `Validators.maxLength(64)`.
  - Atributo `maxlength` nos `<input>` impede digitar o excedente (edge case da spec).
  - `updateOn: 'change'` com exibição de erro do Material (só após `touched` ou envio — padrão
    `ErrorStateMatcher` do Material, que já considera `form.submitted`).
  - Normalização (`trim` de nome/e-mail, e-mail em minúsculas, senha intocada) em
    `registration-input.mapper.ts` (função pura), aplicada só no envio.
- **Rationale**: atende FR-007 a FR-012 com validadores puros e testáveis; o comportamento padrão do
  `ErrorStateMatcher` já cumpre "a partir do momento em que sai do campo ou tenta enviar".
- **Alternatives considered**: `Validators.pattern` para senha (mensagem única, não diz qual regra
  falhou); normalizar a cada digitação (move o cursor e altera o que o visitante vê).

## R-03 — Bloqueio durante o envio e foco no primeiro campo inválido

- **Decision**: o `RegistrationStore` expõe `status` (`idle | submitting | succeeded | failed`). Um
  `effect` no `RegisterForm` chama `form.disable()` em `submitting` e `form.enable()` ao sair dele.
  O botão usa `[disabled]="isSubmitting()"` e o `MatProgressSpinner` (`diameter=20`, `mode=
  indeterminate`) aparece ao lado dele com `aria-label="Enviando cadastro"`. O valor enviado é lido
  com `getRawValue()` **antes** do `disable()`.
  Foco: `viewChildren(MatInput)` + `MatInput.focus()` no primeiro controle inválido (após tentativa
  de envio inválida ou após erro do servidor em campo).
- **Rationale**: atende FR-010/FR-014 e o pedido "bloqueie todos os campos e deixe um loader ao lado
  do botão". `MatInput.focus()` é API pública do Material — sem acesso direto ao DOM (Princípio IV).
- **Alternatives considered**: `[attr.disabled]`/`[readonly]` (Reactive Forms alerta contra binding
  de disabled); overlay de carregamento sobre o cartão (polui a tela, contraria "simples e direto");
  `ElementRef.nativeElement.focus()` (exigiria exceção na constitution).

## R-04 — Mapeamento das respostas de erro

- **Decision**: `mapRegistrationError(error: unknown): RegistrationFailure`, função pura:

  | Situação | `kind` | `message` (aviso geral) | `fieldErrors` |
  |----------|--------|-------------------------|---------------|
  | `TimeoutError`, erro não-HTTP, `status === 0` | `generic` | texto genérico (FR-018) | — |
  | HTTP 409 | `email-taken` | — (nenhum aviso geral) | `email`: `message` → `error.detail` → fallback "Este e-mail já está cadastrado" |
  | HTTP 400 com `error.errors` | `invalid-fields` | `message` → `error.title` → genérico | 1ª mensagem de cada chave reconhecida (`name`/`email`/`password`, sem diferenciar caixa) |
  | Outro status com `message`/`error.detail` legível | `server-message` | esse texto | — |
  | Outro status sem texto legível | `generic` | texto genérico | — |

  Corpo lido como `unknown` e estreitado por type guards (`isApiResponse`). Chaves desconhecidas em
  `errors` são ignoradas para campos; se **nenhuma** for reconhecida, a 1ª mensagem vira o aviso
  geral. `correlationId`, `instance`, `status`, `title` técnicos nunca aparecem como código.
- **Rationale**: decisões do responsável (409 junto ao campo com texto do serviço; 400 por campo +
  aviso geral). O backend usa camelCase em `errors` (`password`), mas ASP.NET pode emitir PascalCase
  — a comparação sem caixa protege contra os dois.
- **Alternatives considered**: interceptor global (ver Complexity Tracking); exibir `error.title`
  em vez de `message` (no 409 o título é "Conflito", pouco útil).

## R-05 — Aplicação dos erros do servidor nos campos

- **Decision**: para cada `fieldErrors[field]`, `control.setErrors({ server: mensagem })` e
  `markAsTouched()`. O template mostra `server` com prioridade sobre as demais mensagens. Ao editar o
  campo, o Angular recalcula os validadores e o erro `server` some sozinho.
- **Rationale**: integra com o `mat-error` existente, sem estado paralelo; atende "formulário
  liberado para correção".
- **Alternatives considered**: signal separado de erros do servidor no template (duplica a lógica de
  exibição e exige limpeza manual).

## R-06 — Sucesso: mensagem e estado do formulário

- **Decision**: em `201`/`success: true`, o store guarda `successMessage = response.message` (ou
  "Cadastro realizado!" se vazio) e passa a `succeeded`. O formulário é `reset()` (campos vazios,
  `pristine`/`untouched`, sem erros visíveis) e permanece na página. Aviso verde (`role="status"`,
  tokens `--app-color-success-bg`/`-text`, ícone `check`) logo acima do botão. Avisos somem no
  próximo envio. `data` (incluindo `accessCode`) não é guardado nem exibido.
- **Rationale**: decisão do responsável ("mensagem do backend + fica na tela"); o texto do serviço
  pede a confirmação por e-mail, que um texto fixo perderia. Aviso inline em vez de snackbar: fica
  legível enquanto o visitante procura o e-mail e não sobrepõe o conteúdo ("sem poluir").
- **Alternatives considered**: `FeedbackSnackbarService` (some em 5 s, antes de o visitante ler);
  redirecionar à landing (descartado pelo responsável).

## R-07 — Assinatura, timeout, cancelamento e console

- **Decision**: `RegistrationStore` (provido em `RegisterPage.providers`) faz:
  `api.register(dto).pipe(timeout(30_000), takeUntilDestroyed(destroyRef), catchError(→ fail))`.
  `submit()` ignora chamadas com `status === 'submitting'` (duplo clique/Enter). Sair da página
  destrói o store e cancela a requisição sem erro visível. Todo erro (inclusive exceções no
  `subscribe`) é capturado — nada chega ao `ErrorHandler` global, que escreveria no console.
- **Rationale**: FR-013, FR-018, FR-021 e edge cases; mesmo padrão do `ChatSessionStore`.
- **Alternatives considered**: `exhaustMap` sobre um `Subject` de envios (mais RxJS sem ganho, já que
  a guarda por status resolve); timeout no `HttpClient` via `HttpContext` (não existe nativamente).

## R-08 — CORS no ambiente de UAT

- **Decision**: a chamada vai direto a `http://localhost:5170` (origem diferente de
  `http://localhost:4200`), então o backend UAT precisa liberar CORS para `http://localhost:4200`
  (métodos `POST`, cabeçalho `Content-Type`). Se não liberar, alternativa documentada no
  quickstart: `proxy.conf.json` do dev server mapeando `/api` → `http://localhost:5170` e
  `authApiUrl: '/api/v1/auth'` em development.
- **Rationale**: o responsável informou que o endereço está aberto para testes; o proxy fica como
  plano B sem mudar código além do environment.
- **Alternatives considered**: proxy obrigatório já agora (configuração extra desnecessária se o CORS
  estiver liberado).

## R-09 — Ícones e cabeçalho

- **Decision**: três SVGs do Material Symbols em `public/icons/` (`person_add`, `visibility`,
  `visibility_off`) registrados via `APP_ICON_NAMES`. `person_add` no item "registrar" da landing e
  acima do título do cartão (desenho: `<icone>`). Cabeçalho da página `/register`: `SiteHeader` com
  um único item "início" (`home`), como no desenho.
- **Rationale**: reutiliza o mecanismo `provideAppIcons` (ícones locais, sem fonte externa).
- **Alternatives considered**: fonte Material Icons via CDN (dependência externa nova e peso extra).

## R-10 — Layout responsivo

- **Decision**: `main` centraliza um cartão (`mat-card` *não* usado — `section` simples com
  `max-width: 420px; width: 100%`, padding 16 px) em coluna: ícone, título (`h1`), subtítulo,
  campos `mat-form-field appearance="outline"` com largura 100%, linha final com spinner + botão
  `mat-flat-button` (cor primária do tema). Em telas < 600 px o cartão ocupa toda a largura.
- **Rationale**: o desenho mostra um bloco central simples sem moldura de cartão; atende SC-006.
- **Alternatives considered**: `MatCard` (adiciona sombra/moldura que o desenho não mostra).
