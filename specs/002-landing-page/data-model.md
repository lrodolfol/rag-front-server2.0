# Data Model: Tela Inicial (Landing Page) do AchaLocal

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-18

A tela é estática (FR-018): não há persistência nem chamadas HTTP. Os "modelos" abaixo são tipos de
apresentação (`readonly`) para o conteúdo fixo em `src/app/features/landing/landing-content.ts`,
cada um em seu próprio arquivo em `src/app/features/landing/models/`.

## HowItWorksStep

Cartão numerado da seção "Como funciona".

| Campo | Tipo | Regra |
|-------|------|-------|
| `order` | `number` | 1, 2 ou 3; único; define a ordem de exibição |
| `title` | `string` | Não vazio; ex.: "Cadastre" (exibido como "1. Cadastre") |
| `description` | `string` | Não vazio |
| `icon` | `AppIconName` | Nome registrado no `MatIconRegistry` (R-01) |

Instâncias: exatamente 3 (Cadastre / Usuário pergunta / Recomendação).

## ChatMessage

Mensagem da simulação de conversa (FR-009).

| Campo | Tipo | Regra |
|-------|------|-------|
| `author` | `'user' \| 'assistant'` | Define alinhamento e cor do balão |
| `text` | `string` | Não vazio; texto real (não imagem) |

Regras: ≥ 1 mensagem `user` em linguagem natural e ≥ 1 mensagem `assistant` que recomenda um
negócio fictício contendo endereço, preço e contato. Conteúdo em
[contracts/landing-sections.md](./contracts/landing-sections.md).

## Plan

Oferta exibida em "Planos mensais" (FR-011).

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `string` | "Essencial" |
| `monthlyPriceInCents` | `number` | 999 (inteiro, evita erro de ponto flutuante) |
| `benefits` | `readonly string[]` | ≥ 1; ["respostas ilimitadas"] |
| `cancellationNote` | `string` | "cancele quando quiser" |

Exibição do preço: formatado em pt-BR pelo `CurrencyPipe` (`'BRL'`, locale `pt-BR` registrado) +
sufixo "/mês" → "R$ 9,99/mês".

## Benefit

Item da lista da chamada final.

| Campo | Tipo | Regra |
|-------|------|-------|
| `label` | `string` | Não vazio |
| `icon` | `AppIconName` | Nome registrado |

Instâncias: exatamente 3 (Setup em 5 minutos / Sem conhecimento técnico / Resultados rápidos).

## AppIconName

Union type literal dos ícones registrados (R-01), garantindo em tempo de compilação que só nomes
existentes são usados:
`'storefront' | 'chat' | 'add_business' | 'edit_note' | 'forum' | 'location_on' | 'bolt' |
'sentiment_satisfied' | 'trending_up' | 'mail' | 'arrow_forward' | 'check'`.

## AppPaths

Constantes de caminho de rota (ver [contracts/routes.md](./contracts/routes.md)):
`home: ''`, `registerBusiness: 'cadastrar-negocio'`, `chatbot: 'chatbot'`.

## Constantes simples

- `CONTACT_EMAIL = 'contato@tinosnegocios.com.br'` (FR-012).

## Estados / transições

Nenhum. A tela não carrega dados, logo não há estados de carregamento, erro ou vazio (o requisito
da constitution sobre esses estados não se aplica — registrado no Constitution Check).
