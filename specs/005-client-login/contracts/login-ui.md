# Contract: Interface da página de login

**Feature**: [../spec.md](../spec.md) | Layout de referência: página `/register`
(`.mine/register_page/register-page.excalidraw`)

## Estrutura

```text
[SiteHeader: logo + "AchaLocal" → /      |      "início" (home) → /]
<main>
  <section cartão centralizado>
    [ícone login]
    "Acesse sua conta"                         (h1)
    "Gerencie seus negócios no AchaLocal."     (p)
    [E-mail          ]                         mat-form-field outline
    [Senha       (👁)]                         mat-form-field outline + toggle matSuffix
    [aviso de erro — vermelho, discreto]       só quando houver
                         (spinner) [ entrar ]  ações à direita
```

## Textos (`login-content.ts`)

| Chave | Texto |
|-------|-------|
| Título | Acesse sua conta |
| Subtítulo | Gerencie seus negócios no AchaLocal. |
| Rótulo e-mail | E-mail |
| Rótulo senha | Senha |
| Botão | entrar |
| Toggle (oculta / visível) | Mostrar senha / Ocultar senha |
| Spinner (`aria-label`) | Entrando |
| Campo vazio | Campo obrigatório |
| E-mail inválido | Informe um e-mail válido |
| Falha genérica | Não foi possível entrar agora. Tente novamente em instantes. |
| Item da landing | login |
| Título da aba | Login — AchaLocal |

Mensagens do serviço (401/403/…) são exibidas como vieram (interpolação, nunca `innerHTML`).

## Estados

| Estado | Campos | Toggle | Botão | Spinner | Aviso |
|--------|--------|--------|-------|---------|-------|
| `idle` | habilitados, vazios | habilitado | habilitado | oculto | oculto |
| `submitting` | desabilitados | desabilitado | desabilitado | visível ao lado do botão | oculto |
| `failed` | habilitados; e-mail mantido; senha vazia | habilitado | habilitado | oculto | vermelho com texto |
| `succeeded` | desabilitados (até navegar) | desabilitado | desabilitado | oculto | oculto |

Aviso some ao digitar em qualquer campo ou ao reenviar.

## Acessibilidade

- `mat-label` em todos os campos; `mat-error` associado pelo Material (`aria-describedby`).
- Aviso de erro com `role="alert"` (anunciado ao aparecer).
- Toggle: `type="button"`, `aria-label` dinâmico, `aria-pressed`.
- Spinner com `aria-label="Entrando"`.
- Enter em qualquer campo envia (`<form (ngSubmit)>`); envio inválido foca o primeiro campo inválido.
- `novalidate` no form (validação do Angular, mensagens em pt-BR).

## Estilo

- Reaproveita a estrutura SCSS do `RegisterForm`/`RegisterPage` (heading, field, notice--error,
  actions); cores só via `--app-color-*` (`primary`, `on-surface`, `on-surface-variant`,
  `error-bg`, `error-text`).
- Sem rolagem horizontal de 320 px a 1920 px.
