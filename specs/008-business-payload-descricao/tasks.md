# Tasks: Ajuste do payload de cadastro de negócio (`descricao`)

**Input**: Design documents from `specs/008-business-payload-descricao/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/business-registration-api.md, quickstart.md

**Tests**: incluídos — exigidos pela constitution (Princípio VI: regras de negócio, serviços HTTP com
`HttpTestingController` e fluxos críticos). Os testes existentes que verificam o corpo do `POST`
precisam ser atualizados.

**Organization**: tarefas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 / US2 conforme spec.md

## Path Conventions

Caminhos relativos à raiz do repositório. Código em `src/app/`.

---

## Phase 1: Setup

Nenhuma tarefa: projeto, dependências e estrutura já existem (plan.md, "Structure Decision").

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: mudar o contrato tipado do envio; todas as stories dependem dele.

- [X] T001 Em `src/app/features/business-registration/models/register-business-request.dto.ts`, renomear a propriedade `readonly description: string | null;` para `readonly descricao: string | null;`, mantendo a posição logo após `name`, e adicionar o comentário JSDoc `/** Chave em português, exatamente como no payload do backend (feature 008). */`. O DTO deve ter exatamente as seis chaves `name`, `descricao`, `email`, `address`, `telephone` e `detalhes`; `description` e `details` MUST NOT aparecer (data-model.md §2). Não alterar `BusinessRegistrationInput` nem o formulário (research R-01).

**Checkpoint**: o build acusa erro no mapper e nos specs que ainda usam `description` no DTO — esperado até a Phase 3.

---

## Phase 3: User Story 1 - Cadastrar negócio com a descrição rápida reconhecida pelo serviço (Priority: P1) 🎯 MVP

**Goal**: a Descrição rápida preenchida chega ao backend na chave `descricao`.

**Independent Test**: com os valores do exemplo preenchidos, o corpo do `POST` é idêntico ao exemplo de `specs/008-business-payload-descricao/contracts/business-registration-api.md` e não contém `description` nem `details`.

### Tests for User Story 1

- [X] T002 [P] [US1] Em `src/app/features/business-registration/services/business-registration-input.mapper.spec.ts`, no `describe('toRegisterBusinessRequestDto')`, renomear o teste para `'should copy the input and rename description to descricao and details to detalhes'`, trocar a chave esperada `description:` por `descricao: 'pet shop e cuidados para animais'` e acrescentar asserções de que o resultado não tem as propriedades `description` nem `details` (`expect(dto).not.toHaveProperty('description')` / `'details'`).
- [X] T003 [P] [US1] Em `src/app/core/business/business-api.service.spec.ts`, no `describe('registerBusiness')`, trocar `description: 'pet shop e cuidados para animais'` por `descricao: 'pet shop e cuidados para animais'` na constante `REQUEST` (tipada como `RegisterBusinessRequestDto`); manter a asserção de corpo `toEqual(REQUEST)`.

### Implementation for User Story 1

- [X] T004 [US1] Em `src/app/features/business-registration/services/business-registration-input.mapper.ts`, na função `toRegisterBusinessRequestDto`, trocar `description: input.description,` por `descricao: input.description,` e atualizar o JSDoc da função para `/** Valores normalizados → corpo do \`POST\` (\`description\` → \`descricao\`, \`details\` → \`detalhes\`). */`. `toBusinessRegistrationInput` não muda (depende de T001).

**Checkpoint**: T002 e T003 passam; US1 validável pelo passo 2 de `specs/008-business-payload-descricao/quickstart.md`.

---

## Phase 4: User Story 2 - Cadastrar negócio sem descrição rápida (Priority: P2)

**Goal**: com a Descrição rápida vazia, o corpo leva `descricao: null` e o cadastro segue normalmente ("Opcionais vazios (`descricao`, `email`, `telephone`) → `null`", contracts/business-registration-api.md).

**Independent Test**: enviar o formulário com a Descrição rápida vazia e verificar `"descricao": null` no corpo do `POST`.

### Tests for User Story 2

- [X] T005 [P] [US2] Em `src/app/features/business-registration/state/business-registration.store.spec.ts`, no teste que verifica `request.request.body` do `POST` (por volta da linha 198), trocar `description: null,` por `descricao: null,`. Não alterar a constante `INPUT` (linha ~33), que é um `BusinessRegistrationInput` e continua com `description`.
- [X] T006 [P] [US2] Em `src/app/features/business-registration/business-registration-page.spec.ts`, no teste `'should register the business and go back to /dashboard with a notice'` (`describe('fluxo crítico (US1)')`, por volta da linha 152), trocar `description: null,` por `descricao: null,` no corpo esperado.
- [X] T007 [P] [US2] Em `src/app/features/business-registration/services/business-registration-input.mapper.spec.ts`, no `describe('toRegisterBusinessRequestDto')`, adicionar o teste `'should send descricao as null when the quick description is blank'`: montar o input com `toBusinessRegistrationInput({ ...FORM_VALUE, description: '   ' })` e verificar `toRegisterBusinessRequestDto(input).descricao` igual a `null` (depende de T002 por ser o mesmo arquivo).

### Implementation for User Story 2

Nenhuma tarefa adicional: a regra `emptyToNull` de `toBusinessRegistrationInput` já produz `null`, e T004 o leva para `descricao`.

**Checkpoint**: T005–T007 passam.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T008 [P] Atualizar `specs/007-business-registration/contracts/business-registration-api.md` (FR-006, research R-04): no exemplo da seção "Corpo (`RegisterBusinessRequestDto`)" trocar `"description"` por `"descricao"`; na regra de opcionais escrever `Opcionais vazios (\`descricao\`, \`email\`, \`telephone\`) → \`null\`.`; trocar a observação sobre `detalhes` por `Chaves \`descricao\` e \`detalhes\` (não \`description\`/\`details\`) — conforme payload do usuário (feature 008).`; na seção "Testes", item `toRegisterBusinessRequestDto`, incluir `description` → `descricao`.
- [X] T009 Rodar `Get-ChildItem -Recurse src -Include *.ts | Select-String "description"` (ou Grep) e confirmar que `description` só sobrou em `BusinessRegistrationInput`, no formulário, em `BusinessRegistrationField`, em `BusinessResponseDataDto`/specs do `GET` e na landing — nunca em objetos `RegisterBusinessRequestDto` ou corpos de `POST` esperados.
- [ ] T010 Rodar `npm test` na raiz e confirmar que todos os testes passam; em seguida executar a validação manual de `specs/008-business-payload-descricao/quickstart.md` (passos 2 e 3). — **Parcial (2026-11-27)**: `npm test` verde (70 arquivos, 506 testes); validação manual do quickstart pendente (requer backend local).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (T001)**: bloqueia tudo.
- **US1 (T002–T004)**: depende de T001.
- **US2 (T005–T007)**: depende de T001; o comportamento depende de T004 (mesmo mapper).
- **Polish**: T008 é independente (documentação); T009 e T010 após todas as stories.

### User Story Dependencies

- **US1**: independente após T001.
- **US2**: os specs de US2 só passam com T004 aplicado, porque o mapper é compartilhado.

### Within Each User Story

- Testes primeiro (devem falhar após T001 ou não compilar), depois a implementação.

### Parallel Opportunities

- T002 e T003 (arquivos diferentes).
- T005, T006 e T008 (arquivos diferentes); T007 compartilha arquivo com T002.

## Parallel Example: User Story 1

```text
Task: "T002 [US1] mapper spec — descricao + ausência de description/details"
Task: "T003 [US1] business-api.service.spec — REQUEST com descricao"
```

## Parallel Example: User Story 2

```text
Task: "T005 [US2] store spec — corpo esperado com descricao: null"
Task: "T006 [US2] page spec — corpo esperado com descricao: null"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 → T002/T003 → T004.
2. Validar com o passo 2 do quickstart: o corpo do `POST` é igual ao exemplo.

### Incremental Delivery

1. MVP (US1) → envio com `descricao` preenchida.
2. US2 → specs de store/página e caso vazio cobertos.
3. Polish → contrato da 007 atualizado, varredura de `description`, `npm test` verde.

## Notes

- Mudança de uma chave; diff total esperado: 2 arquivos de produção, 4 specs e 1 doc.
- Não alterar `BusinessResponseDataDto` (leitura `GET`, research R-02).
