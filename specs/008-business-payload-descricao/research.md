# Research: Ajuste do payload de cadastro de negócio (`descricao`)

Nenhum item de Technical Context ficou como NEEDS CLARIFICATION. As decisões abaixo registram o
escopo da mudança.

## R-01 — Onde renomear `description` → `descricao`

- **Decision**: somente no DTO de envio (`RegisterBusinessRequestDto`) e no mapper
  `toRegisterBusinessRequestDto`. `BusinessRegistrationInput`, o `FormGroup` (`formControlName="description"`)
  e `BusinessRegistrationField` mantêm `description`.
- **Rationale**: Princípio III — o modelo da API e o de apresentação ficam separados por um
  mapper; é o mesmo padrão já usado para `details` → `detalhes`. Nomes de código em inglês
  (Princípio II) continuam valendo fora do DTO, que espelha o contrato do backend.
- **Alternatives considered**: renomear também o campo do formulário/modelo de entrada —
  rejeitado: espalha a chave em português pela UI e aumenta o diff sem benefício.

## R-02 — Leitura do negócio (`GET`)

- **Decision**: `BusinessResponseDataDto` continua com `description` e `details`.
- **Rationale**: a spec limita a mudança ao envio; o contrato do `GET` (feature 006) não foi
  alterado pelo usuário e hoje só `name` é lido.
- **Alternatives considered**: alinhar o `GET` para `descricao` — rejeitado sem confirmação do
  backend.

## R-03 — Opcionais vazios

- **Decision**: `descricao` vazia continua sendo enviada como `null`, assim como `email` e
  `telephone`.
- **Rationale**: regra confirmada com o backend em 2026-11-25 (contrato da 007, item 2); o
  exemplo do usuário não mostra o caso vazio.
- **Alternatives considered**: omitir a chave quando vazia — rejeitado, mudaria um comportamento
  já confirmado.

## R-04 — Documentação do contrato

- **Decision**: atualizar `specs/007-business-registration/contracts/business-registration-api.md`
  (exemplo, regra de opcionais, observação sobre chaves em português e lista de testes) e manter
  `contracts/business-registration-api.md` desta feature como o delta.
- **Rationale**: FR-006; evita que a 007 documente um contrato desatualizado.
