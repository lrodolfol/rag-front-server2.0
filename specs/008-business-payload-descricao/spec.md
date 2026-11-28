# Feature Specification: Ajuste do payload de cadastro de negócio (`descricao`)

**Feature Branch**: `feat/new-business-page`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "alterar o payload de envio para API na tela /dashboard para exemplo: { "name": "pet_amigo", "descricao": "pet shop e cuidados para animais", "email": "atendimento@petamigo.com.br", "address": "avenida das acacias - 310", "telephone": "35995678902", "detalhes": "O Pet Amigo oferece banho e tosa, produtos para cães e gatos, rações, brinquedos, acessórios e itens de higiene animal. Também realizamos agendamentos para cuidados estéticos e orientamos os clientes sobre os produtos disponíveis. Atendimento via WhatsApp." }"

## Contexto

Na área do cliente (`/dashboard`), o formulário de cadastro de negócio (`/dashboard/new`, feature
007) envia os dados do negócio ao serviço de cadastro. Hoje o envio usa a chave `description` para
a "Descrição rápida". O serviço de cadastro espera essa informação na chave **`descricao`**, como no
exemplo informado. As demais chaves (`name`, `email`, `address`, `telephone`, `detalhes`) já estão
no formato do exemplo e permanecem iguais.

Formato esperado do envio:

```json
{
  "name": "pet_amigo",
  "descricao": "pet shop e cuidados para animais",
  "email": "atendimento@petamigo.com.br",
  "address": "avenida das acacias - 310",
  "telephone": "35995678902",
  "detalhes": "O Pet Amigo oferece banho e tosa, produtos para cães e gatos, ..."
}
```

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar negócio com a descrição rápida reconhecida pelo serviço (Priority: P1)

O cliente logado, sem negócio cadastrado, preenche o formulário de novo negócio (incluindo a
"Descrição rápida") e confirma o cadastro. A descrição rápida chega ao serviço no campo que ele
reconhece (`descricao`), de modo que o negócio fica salvo com essa informação.

**Why this priority**: sem essa correção, a descrição rápida informada pelo cliente não é
reconhecida pelo serviço e se perde, o que prejudica a apresentação do negócio e as recomendações.

**Independent Test**: preencher todos os campos com os valores do exemplo, confirmar o cadastro e
verificar que os dados enviados ao serviço têm exatamente as seis chaves do exemplo, com
`descricao` contendo a descrição rápida digitada.

**Acceptance Scenarios**:

1. **Given** um cliente sem negócio no formulário de novo negócio, **When** ele preenche Nome
   "pet_amigo", Descrição rápida "pet shop e cuidados para animais", E-mail
   "atendimento@petamigo.com.br", Endereço "avenida das acacias - 310", Telefone
   "(35) 99567-8902" e a Descrição completa, e confirma, **Then** os dados enviados são iguais ao
   exemplo: `name`, `descricao`, `email`, `address`, `telephone` (só dígitos, "35995678902") e
   `detalhes`.
2. **Given** o mesmo preenchimento, **When** o cadastro é enviado, **Then** os dados enviados
   **não** contêm a chave `description` nem a chave `details`.
3. **Given** o envio aceito pelo serviço, **When** o cadastro é concluído, **Then** o cliente é
   levado a `/dashboard` com o aviso "Negócio cadastrado com sucesso." (comportamento atual
   mantido).

---

### User Story 2 - Cadastrar negócio sem descrição rápida (Priority: P2)

O cliente deixa a "Descrição rápida" (opcional) em branco e confirma o cadastro.

**Why this priority**: o campo é opcional; o cadastro sem ele precisa continuar funcionando com o
novo nome de chave.

**Independent Test**: enviar o formulário com a descrição rápida vazia e verificar que `descricao`
vai sem valor (nulo), como já acontece hoje com os campos opcionais vazios.

**Acceptance Scenarios**:

1. **Given** a Descrição rápida vazia ou só com espaços, **When** o cliente confirma o cadastro,
   **Then** os dados enviados contêm `descricao` sem valor (nulo) e o cadastro segue normalmente.

### Edge Cases

- Descrição rápida com espaços no início/fim: enviada em `descricao` sem esses espaços (regra
  atual de limpeza mantida).
- E-mail e Telefone opcionais vazios: continuam indo sem valor (nulo), com as chaves `email` e
  `telephone`.
- Leitura do negócio na área do cliente (`/dashboard`): não muda; só o envio do cadastro é afetado.
- Respostas de erro do serviço: tratamento atual (mensagem genérica, dados inválidos, negócio já
  cadastrado) mantido sem alteração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O envio do cadastro de negócio MUST levar a "Descrição rápida" na chave `descricao`.
- **FR-002**: O envio MUST NOT conter a chave `description`.
- **FR-003**: O envio MUST conter exatamente as chaves `name`, `descricao`, `email`, `address`,
  `telephone` e `detalhes`, nessa correspondência com os campos Nome, Descrição rápida, E-mail,
  Endereço, Telefone e Descrição completa.
- **FR-004**: As regras atuais de preparação dos valores MUST ser mantidas: remoção de espaços nas
  pontas, opcionais vazios enviados sem valor (nulo) e telefone enviado só com dígitos.
- **FR-005**: O formulário, seus textos, validações e o comportamento após sucesso ou falha MUST
  permanecer inalterados para o cliente.
- **FR-006**: A documentação do contrato de envio do cadastro de negócio MUST refletir a chave
  `descricao`.

### Key Entities

- **Dados de cadastro do negócio (envio)**: nome, descrição rápida (`descricao`, opcional), e-mail
  (opcional), endereço, telefone (opcional, só dígitos) e descrição completa (`detalhes`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cadastros enviados com descrição rápida preenchida levam esse texto na chave
  `descricao`.
- **SC-002**: 0 envios de cadastro contêm a chave `description`.
- **SC-003**: Um cadastro preenchido com os valores do exemplo produz um envio idêntico ao exemplo
  informado.
- **SC-004**: Nenhuma mudança perceptível para o cliente no formulário ou no fluxo de cadastro.

## Assumptions

- "Tela /dashboard" refere-se ao cadastro de negócio dentro da área do cliente
  (`/dashboard/new`), que é o único ponto que envia dados de negócio ao serviço; a tela
  `/dashboard` em si apenas lê o negócio.
- A única diferença entre o envio atual e o exemplo é a chave `description` → `descricao`; as
  demais chaves já coincidem.
- O nome do negócio é enviado como o cliente digitou (após remover espaços nas pontas); "pet_amigo"
  no exemplo é apenas um valor ilustrativo, sem conversão automática de formato.
- Campos opcionais vazios continuam sendo enviados sem valor (nulo), como hoje; o exemplo não
  mostra esse caso.
- A resposta do serviço e a leitura do negócio (que usa `description`/`details`) não mudam.
