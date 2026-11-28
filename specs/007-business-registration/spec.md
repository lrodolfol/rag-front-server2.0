# Feature Specification: Cadastro de Negócio (/dashboard/new)

**Feature Branch**: `feat/new-business-page`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Tela para cadastro de negócios. Criar tela para rota '/dashboard/new'. Ela deve ser uma sub rota de '/dashboard' para clientes logados possam cadastrar o negócio deles. Comportamento esperado: Clientes que NÃO POSSUEM negócio cadastrado poderão cadastrar um novo negócio." (fonte: `.mine/cadastro-de-negocios/specify.md`)

## Contexto

A área do cliente (`/dashboard`, feature 006) mostra o negócio do cliente ou, quando ele ainda não
tem um, um estado vazio com as ações "Cadastrar agora" e "Novo negócio" — que hoje levam a uma
página "em breve". Esta feature substitui essa página "em breve" por um formulário real de cadastro
de negócio em `/dashboard/new`, dentro da área do cliente. Cada cliente pode ter **um e somente um**
negócio; portanto o cadastro só é permitido a quem ainda não tem negócio.

## Clarifications

### Session 2026-11-25

- Q: Onde e como a confirmação "Negócio cadastrado com sucesso." deve aparecer após o cadastro? → A: Redirecionamento imediato para `/dashboard`, que exibe um aviso temporário (~5 s, fechável) com a mensagem.
- Q: O que deve acontecer quando o cliente aciona "Cancelar" depois de já ter digitado dados? → A: Pedir confirmação somente se algum campo foi preenchido, apenas no botão "Cancelar".
- Q: O campo "Telefone" deve formatar o número automaticamente enquanto o cliente digita? → A: Sim, máscara automática `(XX) XXXX-XXXX` (fixo) / `(XX) XXXXX-XXXX` (celular), aceitando só dígitos e números colados.
- Q: Quando o serviço rejeitar o cadastro indicando campos errados, as mensagens devem aparecer junto aos campos? → A: Não; exibir apenas a mensagem genérica, sem destacar campos.
- (Plano, `.mine/cadastro-de-negocios/plan.md`) Campos e obrigatoriedade: Nome, Descrição completa e Endereço obrigatórios; Descrição rápida, E-mail e Telefone opcionais (FR-007). Layout e textos seguem o esboço `cadastro-page.excalidraw`; o botão de cadastro fica fixo na tela durante a rolagem; "Cancelar" é representado pelo "← Voltar" do esboço (FR-012).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar o primeiro negócio (Priority: P1)

O cliente autenticado sem negócio aciona "Cadastrar agora" ou "Novo negócio" na área do cliente,
preenche o formulário com os dados do seu estabelecimento e confirma. O negócio é cadastrado e o
cliente volta à área do cliente, que passa a exibir o cartão do negócio recém-criado.

**Why this priority**: é o objetivo central da feature; sem ele o cliente não consegue aparecer no
diretório nem no chatbot.

**Independent Test**: entrar com um cliente sem negócio, abrir `/dashboard/new`, preencher dados
válidos, confirmar e verificar que a área do cliente mostra o cartão do novo negócio.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado sem negócio na área do cliente, **When** aciona "Cadastrar
   agora" ou "Novo negócio", **Then** é levado a `/dashboard/new` e vê o formulário de cadastro de
   negócio.
2. **Given** o formulário aberto, **When** o cliente preenche todos os campos obrigatórios com
   valores válidos e aciona "Cadastrar", **Then** o negócio é cadastrado, o cliente é levado
   imediatamente a `/dashboard`, que exibe o cartão com o nome do negócio e um aviso temporário
   com a confirmação "Negócio cadastrado com sucesso.".
3. **Given** o envio em andamento, **When** o cliente observa o formulário, **Then** vê um
   indicador de envio e não consegue enviar o formulário novamente até a resposta chegar.
4. **Given** o formulário aberto sem nenhum campo preenchido, **When** o cliente aciona
   "Cancelar", **Then** é levado a `/dashboard` sem que nada seja cadastrado.
5. **Given** o formulário com ao menos um campo preenchido, **When** o cliente aciona "Cancelar",
   **Then** vê a confirmação "Descartar os dados preenchidos?" com as ações "Descartar" e
   "Continuar editando"; "Descartar" leva a `/dashboard` sem cadastrar nada e "Continuar editando"
   fecha a confirmação mantendo os dados.

---

### User Story 2 - Validação dos dados do formulário (Priority: P1)

O cliente recebe orientações claras, em português, quando um campo está vazio ou em formato
inválido, antes de qualquer envio ao serviço.

**Why this priority**: evita cadastros incompletos ou incorretos no diretório e reduz falhas de
envio; a constitution exige validações com mensagens amigáveis.

**Independent Test**: tentar enviar o formulário vazio e com valores inválidos em cada campo,
verificando as mensagens e que nada é enviado.

**Acceptance Scenarios**:

1. **Given** o formulário com algum campo obrigatório vazio, **When** o cliente aciona
   "Cadastrar", **Then** nada é enviado, os campos com problema são destacados com mensagem em
   português e o foco vai para o primeiro campo inválido.
2. **Given** um e-mail em formato inválido, **When** o cliente sai do campo ou tenta enviar,
   **Then** vê a mensagem "Informe um e-mail válido.".
3. **Given** um telefone com quantidade de dígitos inválida, **When** o cliente sai do campo ou
   tenta enviar, **Then** vê a mensagem "Informe um telefone válido com DDD.".
4. **Given** um campo com texto acima do tamanho máximo, **When** o cliente digita, **Then** vê o
   limite de caracteres e não consegue enviar até corrigir.
5. **Given** um campo preenchido apenas com espaços, **When** o cliente tenta enviar, **Then** o
   campo é tratado como vazio.

---

### User Story 3 - Impedir cadastro por quem já tem negócio (Priority: P1)

O cliente que já possui negócio não consegue acessar o formulário de cadastro; ao tentar abrir
`/dashboard/new`, é levado de volta à área do cliente.

**Why this priority**: é a regra de negócio explícita da descrição ("Clientes que NÃO POSSUEM
negócio cadastrado poderão cadastrar") e protege a relação de um negócio por cliente.

**Independent Test**: entrar com um cliente que já tem negócio e abrir `/dashboard/new` pelo
endereço, verificando o redirecionamento sem exibição do formulário.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado com negócio cadastrado, **When** abre `/dashboard/new` (por
   endereço digitado, link, recarregamento ou botões voltar/avançar), **Then** é levado a
   `/dashboard` sem que o formulário seja exibido.
2. **Given** a verificação de existência de negócio em andamento, **When** a página é aberta,
   **Then** é exibido um indicador de carregamento no lugar do formulário.
3. **Given** não é possível verificar se o cliente já tem negócio (serviço indisponível, sem
   resposta em até 30 segundos ou erro), **When** o cliente abre `/dashboard/new`, **Then** vê a
   mensagem "Não foi possível carregar seus dados agora. Tente novamente em instantes." com o botão
   "Tentar novamente", e o formulário não é exibido.
4. **Given** o cliente cadastrou o negócio com sucesso, **When** tenta voltar a `/dashboard/new`
   (inclusive pelo botão "voltar" do navegador), **Then** é levado a `/dashboard`.

---

### User Story 4 - Acesso restrito a clientes autenticados (Priority: P1)

Somente clientes com sessão válida acessam `/dashboard/new`, com as mesmas regras da área do
cliente.

**Why this priority**: requisito de segurança não negociável da constitution; a rota é sub-rota da
área do cliente.

**Independent Test**: abrir `/dashboard/new` sem sessão, com sessão expirada e com sessão
corrompida, verificando o redirecionamento para `/login`.

**Acceptance Scenarios**:

1. **Given** nenhuma sessão, sessão expirada ou corrompida, **When** o visitante abre
   `/dashboard/new`, **Then** a sessão inválida é descartada e ele é levado a `/login` sem ver o
   formulário.
2. **Given** o formulário aberto, **When** o serviço responde que a sessão não é mais aceita (ao
   verificar o negócio ou ao enviar o cadastro), **Then** a sessão é descartada e o cliente é
   levado a `/login`.

---

### User Story 5 - Tratar falha no envio do cadastro (Priority: P2)

Se o serviço não conseguir concluir o cadastro, o cliente vê uma mensagem em português, mantém os
dados já digitados e pode tentar novamente.

**Why this priority**: evita perda do trabalho digitado e frustração; a constitution exige
tratamento de erros em português sem detalhes técnicos.

**Independent Test**: simular indisponibilidade do serviço, erro de validação do serviço e "cliente
já possui negócio" no envio, verificando a mensagem, a preservação dos dados e o comportamento.

**Acceptance Scenarios**:

1. **Given** o serviço indisponível, sem resposta em até 30 segundos ou respondendo com erro
   inesperado, **When** o cliente envia o formulário, **Then** vê a mensagem "Não foi possível
   cadastrar seu negócio agora. Tente novamente em instantes.", os dados digitados permanecem no
   formulário e ele pode enviar novamente.
2. **Given** o serviço rejeita os dados informados, **When** o cliente envia o formulário,
   **Then** vê a mensagem "Verifique os dados informados e tente novamente." e os dados
   permanecem no formulário. Nenhum campo é destacado com base na resposta do serviço, mesmo que
   ela indique campos específicos.
3. **Given** o serviço informa que o cliente já possui um negócio (ex.: cadastrado em outra aba),
   **When** o cliente envia o formulário, **Then** vê a mensagem "Você já possui um negócio
   cadastrado." e é levado a `/dashboard`.

---

### Edge Cases

- Cliente dá duplo clique em "Cadastrar": apenas um envio é feito.
- Cliente sai da página durante o envio: o envio em andamento não gera erros visíveis; o resultado
  é refletido na próxima abertura da área do cliente.
- Sessão expira enquanto o cliente preenche o formulário: ao enviar, a sessão é descartada e ele é
  levado a `/login` (os dados digitados são perdidos; aceitável nesta versão).
- Cliente cadastra o negócio em uma aba e, em outra aba já aberta em `/dashboard/new`, tenta
  cadastrar novamente: tratado pela User Story 5, cenário 3.
- Textos com espaços no início/fim: são removidos antes do envio.
- Telefone colado com formatação diferente (ex.: `+55 11 98765-4321`, `11.98765.4321`): apenas os
  dígitos são considerados e a máscara é reaplicada; se houver mais de 11 dígitos (ex.: com código
  do país), o valor é tratado como inválido com a mensagem "Informe um telefone válido com DDD.".
- Textos longos (nome, endereço, descrição): o formulário e a mensagem de limite não quebram o
  layout, sem rolagem horizontal.
- Telas pequenas (smartphone): os campos ficam em uma coluna, com botões acessíveis sem rolagem
  horizontal.
- Endereço não previsto abaixo de `/dashboard` (ex.: `/dashboard/xyz`): segue o comportamento
  padrão do site para páginas inexistentes.

## Requirements *(mandatory)*

### Functional Requirements

**Rota e acesso**

- **FR-001**: O sistema MUST disponibilizar o formulário de cadastro de negócio no endereço
  `/dashboard/new`, como parte da área do cliente.
- **FR-002**: `/dashboard/new` MUST seguir as mesmas regras de acesso de `/dashboard` (sessão
  guardada, completa e não expirada); caso contrário, a sessão inválida é descartada e o visitante
  é levado a `/login`, sem ver o formulário.
- **FR-003**: O formulário MUST ser exibido somente a clientes que comprovadamente não possuem
  negócio cadastrado; a verificação MUST ocorrer antes de o formulário ser exibido, em toda forma de
  navegação.
- **FR-004**: Clientes que já possuem negócio MUST ser levados a `/dashboard` ao tentar abrir
  `/dashboard/new`.
- **FR-005**: Enquanto a verificação de existência de negócio estiver em andamento, MUST ser
  exibido um indicador de carregamento; em falha da verificação, MUST ser exibida a mensagem de
  erro com "Tentar novamente" (User Story 3, cenário 3).
- **FR-006**: As ações "Cadastrar agora" e "Novo negócio" da área do cliente MUST levar a
  `/dashboard/new` (substituindo a página "em breve" atual).

**Formulário**

- **FR-007**: O formulário MUST conter os campos abaixo, com os respectivos rótulos em português:

  | Campo              | Rótulo                 | Obrigatório | Regras                                                        |
  |--------------------|------------------------|-------------|---------------------------------------------------------------|
  | Nome               | "Nome do negócio"      | Sim         | 2 a 100 caracteres                                             |
  | Descrição rápida   | "Descrição rápida"     | Não         | até 150 caracteres; uma linha                                  |
  | Descrição completa | "Descrição completa"   | Sim         | 20 a 1000 caracteres; várias linhas; usada pela IA             |
  | Endereço           | "Endereço completo"    | Sim         | 5 a 200 caracteres                                             |
  | E-mail             | "E-mail"               | Não         | se preenchido: formato de e-mail válido; até 150 caracteres    |
  | Telefone           | "Telefone"             | Não         | se preenchido: 10 ou 11 dígitos com DDD (fixo ou celular brasileiro); máscara automática (FR-007a) |

  *Atualizado em 2026-11-25 conforme `.mine/cadastro-de-negocios/plan.md` (mapeamento de campos e
  obrigatoriedade definidos pelo usuário) e o esboço `cadastro-page.excalidraw`; ver research R-01.*

- **FR-007a**: O campo "Telefone" MUST aplicar máscara automática durante a digitação:
  `(XX) XXXX-XXXX` com 10 dígitos e `(XX) XXXXX-XXXX` com 11 dígitos. O campo MUST aceitar
  apenas dígitos (demais caracteres digitados são ignorados), MUST aceitar e formatar números
  colados com ou sem formatação, e MUST impedir a digitação de mais de 11 dígitos. Um valor colado
  com mais de 11 dígitos MUST NOT ser truncado silenciosamente: é marcado como inválido. A
  validação considera somente os dígitos. A máscara é apenas de exibição: o telefone MUST ser
  enviado ao serviço somente com dígitos (ex.: `35995678901`).
- **FR-008**: O sistema MUST validar cada campo conforme FR-007 e exibir mensagens em português
  junto ao campo com problema, ao sair do campo e ao tentar enviar; nenhum envio MUST ocorrer
  enquanto houver campo inválido.
- **FR-009**: Ao tentar enviar com campos inválidos, o foco MUST ir para o primeiro campo inválido.
- **FR-010**: Espaços no início e no fim de todos os campos MUST ser removidos antes da validação
  final e do envio.
- **FR-011**: Campos com limite de tamanho e várias linhas (Descrição, Detalhes) MUST exibir a
  contagem de caracteres em relação ao limite.
- **FR-012**: A página MUST seguir o esboço `cadastro-page.excalidraw`: título "Novo negócio",
  subtítulo explicativo ("Quanto mais claras e relevantes forem as informações sobre seu negócio,
  mais precisas serão as recomendações. Não exagere e não seja ambíguo."), campos agrupados em
  "Informações básicas", "Endereço" e "Contato", a ação principal "Cadastrar negócio" — **fixa na
  tela, sempre visível durante a rolagem** — e a ação "← Voltar" (papel de "Cancelar" nos cenários
  desta spec), que leva a `/dashboard` sem cadastrar nada.
  Se algum campo tiver conteúdo (desconsiderando espaços), "Voltar" MUST antes pedir confirmação
  ("Descartar os dados preenchidos?" — "Descartar" / "Continuar editando"); a confirmação MUST ser
  acessível por teclado e leitores de tela. Outras formas de sair da página (links do cabeçalho,
  botão voltar do navegador) NÃO pedem confirmação nesta versão.

**Envio**

- **FR-013**: Ao enviar dados válidos, o sistema MUST solicitar ao serviço o cadastro do negócio
  vinculado ao cliente autenticado. O endereço e o formato da solicitação serão definidos no plano
  de implementação.
- **FR-014**: Durante o envio, o sistema MUST exibir um indicador de envio e impedir novos envios
  e alterações que gerem envios duplicados.
- **FR-015**: Em caso de sucesso, o sistema MUST levar o cliente imediatamente a `/dashboard`, que
  exibe o negócio recém-cadastrado e um aviso temporário com "Negócio cadastrado com sucesso.". O
  aviso MUST desaparecer sozinho após cerca de 5 segundos, MUST poder ser fechado pelo cliente
  (inclusive por teclado), MUST ser anunciado a leitores de tela e MUST NOT reaparecer ao
  recarregar `/dashboard`.
- **FR-016**: Em falha, o sistema MUST exibir a mensagem correspondente (User Story 5), sem
  códigos, status técnicos, mensagens brutas do serviço ou identificadores de rastreamento, e MUST
  preservar os dados digitados. Sem resposta em até 30 segundos MUST ser tratado como falha.
  Quando o serviço rejeitar os dados, MUST ser exibida apenas a mensagem genérica (User Story 5,
  cenário 2); detalhes por campo eventualmente enviados pelo serviço MUST NOT ser exibidos nem usados
  para destacar campos nesta versão.
- **FR-017**: Quando o serviço indicar que o cliente já possui negócio, o sistema MUST exibir
  "Você já possui um negócio cadastrado." e levar o cliente a `/dashboard`.
- **FR-018**: Quando o serviço indicar que a sessão não é mais aceita, o sistema MUST descartar a
  sessão e levar o cliente a `/login`.

**Layout, segurança e acessibilidade**

- **FR-019**: A página MUST manter o cabeçalho da área do cliente ("Testar Chatbot", "Meus
  negócios", "Sair") e a identidade visual do projeto.
- **FR-020**: A página MUST exibir um título da aba do navegador identificando o cadastro de
  negócio no AchaLocal.
- **FR-021**: A página MUST funcionar em desktop, tablet e smartphone (320 px a 1920 px), sem
  rolagem horizontal.
- **FR-022**: Toda solicitação ao serviço MUST se identificar com a credencial da sessão; a
  credencial MUST NOT aparecer no endereço da página, na tela, em armazenamento persistente ou no
  console.
- **FR-023**: O sistema MUST NOT escrever mensagens, erros ou logs no console do navegador.
- **FR-024**: Todos os campos MUST ter rótulos acessíveis, ser operáveis por teclado e ter as
  mensagens de erro associadas ao campo; os estados de carregamento, envio, sucesso e erro MUST ser
  anunciados a leitores de tela.
- **FR-025**: Todos os textos exibidos ao cliente MUST estar em português.

### Key Entities

- **Sessão do cliente**: credencial, expiração e identificação do cliente (feature 005); libera o
  acesso e vincula o negócio ao cliente.
- **Negócio**: estabelecimento do cliente no diretório — nome, descrição, e-mail de contato,
  telefone, endereço e detalhes (opcional). Relação 1:1: cada cliente tem zero ou um negócio. As
  datas de criação/atualização são definidas pelo serviço.
- **Estado da página de cadastro**: verificando, formulário disponível, enviando, sucesso, erro de
  verificação, erro de envio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente sem negócio consegue concluir o cadastro do negócio em menos de 3 minutos,
  partindo da área do cliente.
- **SC-002**: Em 100% das tentativas de abrir `/dashboard/new` por clientes que já possuem negócio,
  o formulário não é exibido e o cliente é levado à área do cliente.
- **SC-003**: Em 100% das tentativas de abrir `/dashboard/new` sem sessão válida, o visitante é
  levado ao login sem ver o formulário.
- **SC-004**: Em 100% dos casos de teste com dados inválidos, nenhum envio é feito e o cliente vê
  mensagem em português junto a cada campo com problema.
- **SC-005**: Em 100% dos casos de teste de falha no envio, o cliente vê mensagem em português sem
  detalhes técnicos, mantém os dados digitados e consegue tentar novamente; a página nunca fica
  presa no estado de envio.
- **SC-006**: Após um cadastro bem-sucedido, o negócio aparece na área do cliente em até 3
  segundos em condições normais de rede.
- **SC-007**: Zero cadastros duplicados gerados por cliques repetidos no botão de envio.
- **SC-008**: A página é utilizável em larguras de 320 px a 1920 px, sem rolagem horizontal.

## Assumptions

- **Campos do formulário**: correspondem aos dados do negócio já retornados pelo serviço na
  consulta da área do cliente (nome, descrição, e-mail, telefone, endereço, detalhes — feature 006,
  `contracts/business-api.md`). Obrigatoriedade e limites de tamanho em FR-007 são padrões
  razoáveis e serão confrontados com as regras do serviço no plano.
- **Imagem do negócio**: fora do escopo; o serviço ainda não fornece imagem (feature 006,
  research R-05) e o cartão continua exibindo o ícone padrão.
- **Verificação de existência de negócio**: reutiliza a mesma consulta do negócio do cliente usada
  pela área do cliente; "cliente sem negócio" segue a mesma interpretação da feature 006.
- **Destino após sucesso**: `/dashboard`, que recarrega os dados e exibe o novo negócio.
- **Telefone**: apenas números brasileiros (fixo ou celular com DDD); o formato enviado ao serviço
  será definido no plano.
- **Cabeçalho**: o mesmo da área do cliente (feature 006).
- **Tempo máximo de espera**: 30 segundos, padrão do projeto.
- **Sessão**: armazenamento apenas da sessão da aba, conforme features 005 e 006.
- **Fora do escopo**: edição e exclusão do negócio (continuam "em breve"); envio de imagem/logo;
  categorias, geolocalização/mapa ou busca de endereço por CEP; rascunho/salvamento automático do
  formulário; múltiplos negócios por cliente; modo escuro.
