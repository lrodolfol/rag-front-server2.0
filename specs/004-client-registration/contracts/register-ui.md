# Contract: Interface da página de cadastro

**Feature**: [../spec.md](../spec.md) | Desenho: `.mine/register_page/register-page.excalidraw`

Todos os textos ficam em `features/register/register-content.ts`.

## Layout (de cima para baixo)

```text
┌──────────────────────────────────────────────────────────┐
│ [storefront] AchaLocal                       [home] início│  ← SiteHeader (core/layout)
├──────────────────────────────────────────────────────────┤
│                     [person_add]                         │
│                    Crie sua conta                         │  h1
│    Cadastre e gerencie seus negócios no AchaLocal.        │  p (on-surface-variant)
│   ┌ Seu nome ───────────────────────────┐                 │
│   ┌ E-mail ─────────────────────────────┐                 │
│   ┌ Senha ──────────────────── [👁] ────┐                 │  matSuffix toggle
│     Mínimo de 8 caracteres, com letras e números          │  mat-hint
│   [aviso sucesso/erro — só quando houver]                 │
│                 (spinner) [ criar minha conta ]           │  spinner só ao enviar
└──────────────────────────────────────────────────────────┘
```

Bloco central `max-width: 420px`, `width: 100%`, sem rolagem horizontal de 320 a 1920 px.

## Textos

| Chave | Texto |
|-------|-------|
| Título da aba | "Cadastro — AchaLocal" |
| Título | "Crie sua conta" |
| Subtítulo | "Cadastre e gerencie seus negócios no AchaLocal." |
| Rótulo nome | "Seu nome" |
| Rótulo e-mail | "E-mail" |
| Rótulo senha | "Senha" |
| Dica senha | "Mínimo de 8 caracteres, com letras e números" |
| Botão | "criar minha conta" |
| Toggle senha (aria-label) | "Mostrar senha" / "Ocultar senha" |
| Spinner (aria-label) | "Enviando cadastro" |
| Obrigatório | "Campo obrigatório" |
| E-mail inválido | "Informe um e-mail válido" |
| Senha curta | "A senha deve ter pelo menos 8 caracteres" |
| Senha sem letra | "A senha deve conter pelo menos uma letra" |
| Senha sem número | "A senha deve conter pelo menos um número" |
| E-mail em uso (fallback) | "Este e-mail já está cadastrado" |
| Sucesso (fallback) | "Cadastro realizado!" |
| Erro genérico | "Não foi possível concluir o cadastro agora. Tente novamente em instantes." |

## Campos

| Campo | `type` | `autocomplete` | `maxlength` |
|-------|--------|----------------|-------------|
| Seu nome | `text` | `name` | 100 |
| E-mail | `email` | `email` | 254 |
| Senha | `password` / `text` (toggle) | `new-password` | 64 |

`mat-form-field appearance="outline"`, largura 100%. Toggle: `mat-icon-button matSuffix
type="button"`, `[attr.aria-pressed]`, ícone `visibility`/`visibility_off`, desabilitado enquanto
envia.

## Estados

| Estado | Campos | Botão | Spinner | Aviso |
|--------|--------|-------|---------|-------|
| `idle` | editáveis | habilitado | oculto | — |
| `submitting` | desabilitados | desabilitado | visível ao lado do botão | — (avisos anteriores somem) |
| `succeeded` | editáveis e vazios | habilitado | oculto | verde, `role="status"`, ícone `check` |
| `failed` | editáveis, valores mantidos | habilitado | oculto | vermelho, `role="alert"` (só se houver mensagem geral) + erros nos campos |

Avisos: bloco discreto (padding 8–12 px, borda arredondada, fonte do corpo), cores **apenas** por
tokens: `--app-color-success-bg`/`--app-color-success-text` e
`--app-color-error-bg`/`--app-color-error-text`.

## Interação e acessibilidade

- Envio por clique ou Enter (`(ngSubmit)` no `<form>`); `novalidate` no form.
- Envio com campo inválido: `markAllAsTouched()`, nenhuma requisição, foco no 1º campo inválido.
- Erro do servidor em campo: mensagem no `mat-error` do campo e foco nele.
- `mat-error` já é ligado ao input por `aria-describedby` (Material); avisos gerais anunciados por
  `role="alert"` (erro) e `role="status"` (sucesso).
- Ordem de tabulação: nome → e-mail → senha → toggle → botão.
- Ícones decorativos com `aria-hidden="true"`.
