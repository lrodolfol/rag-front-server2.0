# Implementation Plan: Ajuste do payload de cadastro de negócio (`descricao`)

**Branch**: `feat/new-business-page` | **Date**: 2026-11-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-business-payload-descricao/spec.md`

## Summary

O `POST {API_BASE_URL}/{clientId}/business` (feature 007) envia a descrição rápida em
`description`; o backend espera `descricao`. A correção fica restrita à fronteira com a API:
renomear a propriedade no `RegisterBusinessRequestDto` e no mapper
`toRegisterBusinessRequestDto` (`input.description` → `descricao`), ajustar os testes que
verificam o corpo do `POST` e atualizar o contrato da 007. Formulário, modelo de entrada
(`BusinessRegistrationInput`), validações, store e leitura do negócio (`GET`) não mudam
(research R-01).

## Technical Context

**Language/Version**: TypeScript ~6.x (`strict: true`), Angular 22.x (Standalone, Signals)

**Primary Dependencies**: Angular (`HttpClient`, Reactive Forms), Angular Material, RxJS 7.x. Nenhuma nova.

**Storage**: N/A

**Testing**: Vitest + jsdom; `HttpTestingController` para o serviço HTTP

**Target Platform**: Navegadores modernos (desktop, tablet, smartphone)

**Project Type**: Web application (SPA frontend)

**Performance Goals**: N/A (mudança de contrato, sem impacto de desempenho)

**Constraints**: Envio idêntico ao exemplo do usuário; nenhuma mudança visível na UI

**Scale/Scope**: 2 arquivos de produção, 4 specs, 1 documento de contrato

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Angular moderno / TS estrito | Só renomeia uma propriedade tipada; sem `any` | ✅ |
| II. Responsabilidade única | Mudança isolada no DTO e no mapper; componentes intocados | ✅ |
| III. HTTP tipado | DTO de envio continua tipado; o mapper continua separando o modelo da API (`descricao`, `detalhes`) do modelo de apresentação (`description`, `details`) | ✅ |
| IV. Segurança | Sem mudança em token, guard ou interceptor | ✅ |
| V. UX / identidade visual | Textos, layout e estados inalterados | ✅ |
| VI. Testes | Testes do mapper, do serviço (`HttpTestingController`), do store e da página atualizados para o novo corpo | ✅ |
| VII. Simplicidade | Nenhuma dependência nova nem abstração nova | ✅ |

**Pós-design (Phase 1)**: reavaliado — sem violações. Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/008-business-payload-descricao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── business-registration-api.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
src/app/
├── core/business/
│   └── business-api.service.spec.ts                  # corpo esperado do POST → descricao
└── features/business-registration/
    ├── models/
    │   └── register-business-request.dto.ts          # description → descricao
    ├── services/
    │   ├── business-registration-input.mapper.ts     # descricao: input.description
    │   └── business-registration-input.mapper.spec.ts
    ├── state/
    │   └── business-registration.store.spec.ts       # corpo esperado do POST
    └── business-registration-page.spec.ts            # corpo esperado do POST

specs/007-business-registration/contracts/
└── business-registration-api.md                      # exemplo e regras com descricao
```

**Structure Decision**: estrutura existente por feature (`features/business-registration`) e
`core/business`; nenhum arquivo novo de código.

## Complexity Tracking

Não aplicável — nenhuma violação da constitution.
