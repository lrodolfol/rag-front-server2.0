# Feature Specification: Tela de Cadastro de Clientes (/register)

**Feature Branch**: `feat/register-page`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Criar tela de cadastro de clientes. Refator tela inicial: a tela inicial deve ter um menu (ao lado de 'testar chatbot') chamado registrar e deve ser redirecionado para '/register'. Tela de cadastro de clientes: criar a página '/register' usando Angular Material como biblioteca oficial de componentes e mantendo o design do projeto. Objetivo: criar tela para que novos clientes possam se cadastrar. Comportamento esperado: cliente informa nome, email e senha; aplicação manda solicitação para backend de auth. Fora do escopo: modo escuro; planos de assinatura." (fonte: `.mine/register_page/specify.md`)

## Contexto

O AchaLocal é um diretório local com IA. A tela inicial hoje oferece no cabeçalho apenas o item
"testar chatbot". Não existe forma de um novo cliente criar uma conta. Esta feature adiciona o item
"registrar" ao cabeçalho da tela inicial e cria a página `/register`, onde o visitante informa nome,
e-mail e senha para criar sua conta no serviço de autenticação.

A página de cadastro de negócio (`/cadastrar-negocio`, ainda "em breve") é uma funcionalidade
distinta e não é alterada por esta feature.

## Clarifications

### Session 2026-11-22

- Q: Após o cadastro concluído com sucesso, para onde o cliente deve ir? → A: ~~Exibir "Conta criada com sucesso!" e voltar à tela inicial, sem login automático.~~ **(Substituída — ver Session 2026-11-22, etapa de plano.)**
- Q: Quais regras a senha deve cumprir para ser aceita no formulário? → A: Mínimo de 8 caracteres, com pelo menos uma letra e um número.
- Q: O formulário deve ter um campo "Confirme a senha"? → A: Não; apenas o controle de mostrar/ocultar a senha.
- Q: O serviço de autenticação já existe, com endereço e formato de resposta conhecidos? → A: Sim; o contrato (endereço, campos e respostas) será informado pelo responsável na etapa de plano.

### Session 2026-11-22 (etapa de plano — `.mine/register_page/plan.md` + desenho)

- Q: Após o sucesso, o que acontece? → A: Exibir na própria tela, em cores de sucesso e sem poluir, a mensagem devolvida pelo serviço (ex.: "Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail"); o visitante permanece em `/register` com o formulário limpo. **Substitui** a resposta anterior (mensagem fixa + volta à tela inicial).
- Q: E-mail já cadastrado (409): onde e qual texto? → A: Junto ao campo de e-mail, com o texto devolvido pelo serviço; "Este e-mail já está cadastrado" apenas se o serviço não enviar texto.
- Q: Dados recusados (400) com erros por campo? → A: Cada mensagem vai para o campo correspondente e a mensagem geral do serviço aparece no aviso de erro.
- Q: Textos da tela? → A: Título "Crie sua conta", subtítulo "Cadastre e gerencie seus negócios no AchaLocal." e botão "criar minha conta" (conforme o desenho, trocando "Acesse" por "Crie" no título).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar uma conta de cliente (Priority: P1)

O visitante abre `/register`, preenche nome, e-mail e senha e confirma. O sistema envia os dados ao
serviço de autenticação; enquanto aguarda, mostra que o cadastro está em andamento; ao concluir,
informa que a conta foi criada.

**Why this priority**: é o objetivo da feature — permitir que novos clientes se cadastrem. Sem isso
não há valor entregue.

**Independent Test**: abrir `/register`, preencher dados válidos, enviar e verificar que o serviço de
autenticação recebe nome, e-mail e senha e que o visitante vê a confirmação de sucesso.

**Acceptance Scenarios**:

1. **Given** a página `/register` aberta, **When** o visitante a visualiza, **Then** vê um formulário
   com os campos "Seu nome", "E-mail" e "Senha" e o botão "criar minha conta", no padrão visual do
   projeto.
2. **Given** todos os campos preenchidos com valores válidos, **When** o visitante aciona o botão de
   cadastro (clique ou tecla Enter), **Then** os dados são enviados ao serviço de autenticação.
3. **Given** o cadastro foi enviado, **When** o serviço ainda não respondeu, **Then** o botão de
   cadastro fica desabilitado, os campos ficam bloqueados para edição e um indicador de
   carregamento é exibido.
4. **Given** o cadastro foi enviado, **When** o serviço confirma a criação da conta, **Then** o
   visitante vê, na própria página e em cores de sucesso, a mensagem devolvida pelo serviço, e o
   formulário é limpo e liberado.

---

### User Story 2 - Corrigir dados inválidos antes de enviar (Priority: P1)

O visitante que deixa um campo em branco, digita um e-mail mal formatado ou uma senha fraca vê, junto
ao campo, uma mensagem em português explicando o problema, e o envio não acontece até que tudo esteja
correto.

**Why this priority**: evita requisições inúteis ao serviço e frustração do visitante; é parte
indispensável de qualquer formulário de cadastro.

**Independent Test**: tentar enviar o formulário com cada campo inválido e verificar a mensagem
exibida e que nenhuma requisição é feita ao serviço.

**Acceptance Scenarios**:

1. **Given** um campo obrigatório vazio, **When** o visitante sai do campo ou tenta enviar,
   **Then** é exibida a mensagem "Campo obrigatório" junto ao campo.
2. **Given** um e-mail em formato inválido (ex.: "maria@"), **When** o visitante sai do campo ou
   tenta enviar, **Then** é exibida a mensagem "Informe um e-mail válido".
3. **Given** uma senha que não atende às regras de FR-007, **When** o visitante sai do campo ou tenta
   enviar, **Then** é exibida uma mensagem explicando a regra não atendida.
4. **Given** qualquer campo inválido, **When** o visitante tenta enviar, **Then** nenhuma requisição
   é feita ao serviço e o foco vai para o primeiro campo inválido.
5. **Given** o campo de senha preenchido, **When** o visitante aciona o botão de mostrar/ocultar,
   **Then** a senha alterna entre visível e oculta.

---

### User Story 3 - Ser informado quando o cadastro falha (Priority: P2)

Se o e-mail já estiver cadastrado, o serviço recusar os dados ou estiver indisponível, o visitante
vê uma mensagem em português explicando o ocorrido, sem perder o que já digitou, e pode tentar
novamente.

**Why this priority**: o serviço de autenticação pode recusar ou falhar; sem tratamento claro o
visitante fica sem saber se a conta foi criada.

**Independent Test**: simular as respostas de e-mail já cadastrado, dados recusados e serviço fora
do ar e verificar a mensagem exibida e o estado do formulário.

**Acceptance Scenarios**:

1. **Given** um cadastro enviado, **When** o serviço informa que o e-mail já está em uso, **Then** é
   exibida junto ao campo de e-mail a mensagem do serviço (ou "Este e-mail já está cadastrado", se
   não houver) e o formulário é liberado para correção.
2. **Given** um cadastro enviado, **When** o serviço recusa os dados com uma mensagem legível,
   **Then** essa mensagem é exibida ao visitante sem códigos técnicos e o formulário é liberado;
   se o serviço indicar erros por campo, cada um aparece junto ao campo correspondente.
3. **Given** um cadastro enviado, **When** o serviço está indisponível, não responde em até 30
   segundos ou devolve erro sem mensagem legível, **Then** é exibida a mensagem genérica "Não foi
   possível concluir o cadastro agora. Tente novamente em instantes." e o formulário é liberado.
4. **Given** qualquer falha, **When** o formulário é liberado, **Then** nome e e-mail continuam
   preenchidos com o que o visitante digitou.

---

### User Story 4 - Chegar ao cadastro pela tela inicial (Priority: P2)

Na tela inicial, o visitante vê no cabeçalho o item "registrar" ao lado de "testar chatbot" e, ao
clicar, é levado à página de cadastro.

**Why this priority**: é o ponto de entrada principal da página; sem ele o cadastro só é acessível
digitando o endereço.

**Independent Test**: abrir a tela inicial, verificar o item "registrar" ao lado de "testar chatbot"
e clicar nele.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** o visitante observa o cabeçalho, **Then** vê o item
   "registrar", com ícone, ao lado de "testar chatbot", no mesmo estilo dos demais itens.
2. **Given** a tela inicial, **When** o visitante clica em "registrar", **Then** é levado a
   `/register`.
3. **Given** a página `/register`, **When** o visitante clica no logotipo "AchaLocal" ou em "início"
   no cabeçalho, **Then** volta à tela inicial.

---

### Edge Cases

- Duplo clique / Enter repetido no envio: apenas uma requisição é feita.
- Espaços no início e fim de nome e e-mail: removidos antes da validação e do envio; a senha é
  enviada exatamente como digitada.
- E-mail com letras maiúsculas: enviado em minúsculas.
- Nome só com espaços: tratado como vazio.
- Textos muito longos: nome limitado a 100 caracteres, e-mail a 254 e senha a 64; o excedente não
  pode ser digitado.
- Gerenciadores de senha / preenchimento automático do navegador: os campos são reconhecidos como
  nome, e-mail e nova senha.
- Visitante sai da página com o cadastro em andamento: a espera é cancelada sem erros visíveis.
- Visitante recarrega a página: o formulário volta vazio (nada é guardado no navegador).
- Telas pequenas (smartphone): o formulário ocupa a largura disponível, sem rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

**Tela inicial**

- **FR-001**: O cabeçalho da tela inicial MUST exibir o item "registrar", com ícone, ao lado de
  "testar chatbot", no mesmo estilo visual dos demais itens.
- **FR-002**: O item "registrar" MUST levar o visitante à página `/register`.

**Página e layout**

- **FR-003**: O endereço `/register` MUST exibir a página de cadastro de clientes; o título da aba
  do navegador MUST identificar o cadastro do AchaLocal.
- **FR-004**: A página MUST exibir o cabeçalho do site com logotipo + "AchaLocal" (link para a tela
  inicial) e o item "início", seguindo o padrão das demais páginas.
- **FR-005**: A página MUST seguir a identidade visual do projeto (paleta, tipografia e componentes
  oficiais) e funcionar em desktop, tablet e smartphone, sem rolagem horizontal.

**Formulário e validação**

- **FR-006**: O formulário MUST conter o título "Crie sua conta", o subtítulo "Cadastre e gerencie
  seus negócios no AchaLocal.", os campos obrigatórios "Seu nome", "E-mail" e "Senha" (com as regras
  da senha visíveis abaixo do campo) e um botão de envio rotulado "criar minha conta"; não há campo
  de confirmação de senha.
- **FR-007**: A senha MUST ter no mínimo 8 caracteres e conter pelo menos uma letra e um número.
- **FR-008**: O e-mail MUST ter formato válido (usuário@domínio).
- **FR-009**: Cada campo inválido MUST exibir mensagem de validação em português junto ao campo,
  a partir do momento em que o visitante sai do campo ou tenta enviar.
- **FR-010**: O sistema MUST NOT enviar o formulário enquanto houver campo inválido e MUST levar o
  foco ao primeiro campo inválido ao tentar enviar.
- **FR-011**: O campo de senha MUST ficar oculto por padrão e oferecer um controle acessível para
  mostrar/ocultar o conteúdo.
- **FR-012**: O sistema MUST remover espaços no início e no fim de nome e e-mail e enviar o e-mail
  em minúsculas.

**Envio**

- **FR-013**: Ao enviar um formulário válido, o sistema MUST enviar nome, e-mail e senha ao serviço
  de autenticação, uma única vez por envio.
- **FR-014**: Do envio até a resposta, o botão MUST ficar desabilitado, os campos bloqueados e um
  indicador de carregamento visível ao lado do botão.
- **FR-015**: Em caso de sucesso, o sistema MUST exibir na própria página, em cores de sucesso e de
  forma discreta, a mensagem devolvida pelo serviço ("Cadastro realizado!" se não houver), limpar o
  formulário e manter o visitante em `/register`; o visitante MUST NOT ser autenticado
  automaticamente.

**Erros**

- **FR-016**: Quando o serviço informar que o e-mail já está cadastrado, o sistema MUST exibir junto
  ao campo de e-mail a mensagem do serviço ("Este e-mail já está cadastrado" se não houver).
- **FR-017**: Quando o serviço recusar os dados com mensagem legível, o sistema MUST exibi-la, em
  cores de erro e de forma discreta, sem códigos, status técnicos ou detalhes internos; erros por
  campo devolvidos pelo serviço MUST aparecer junto ao campo correspondente.
- **FR-018**: Quando o serviço estiver indisponível, não responder em até 30 segundos ou devolver
  erro sem mensagem legível, o sistema MUST exibir "Não foi possível concluir o cadastro agora.
  Tente novamente em instantes."
- **FR-019**: Após qualquer falha, o formulário MUST ser liberado mantendo nome e e-mail digitados.

**Segurança e privacidade**

- **FR-020**: A senha MUST NOT ser armazenada no navegador, exibida em mensagens, incluída no
  endereço da página nem escrita em logs ou no console.
- **FR-021**: O sistema MUST NOT escrever mensagens, erros ou logs no console do navegador.

**Acessibilidade e idioma**

- **FR-022**: Todos os campos e botões MUST ter rótulos acessíveis e ser operáveis por teclado;
  mensagens de erro e de sucesso MUST ser anunciadas a leitores de tela.
- **FR-023**: Todos os textos exibidos ao visitante MUST estar em português (exceto mensagens
  vindas do serviço).

### Key Entities

- **Cadastro de cliente**: dados informados pelo visitante para criar a conta — nome, e-mail e
  senha. Existe apenas durante o preenchimento; nada é guardado no navegador.
- **Resultado do cadastro**: resposta do serviço de autenticação — sucesso, e-mail já cadastrado,
  dados recusados (com mensagem) ou falha/indisponibilidade.
- **Estado do formulário**: preenchendo, enviando, sucesso, erro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante consegue chegar da tela inicial à página de cadastro com 1 clique.
- **SC-002**: Um visitante consegue preencher e enviar o cadastro em menos de 1 minuto.
- **SC-003**: 100% dos envios com campo inválido são bloqueados antes de chegar ao serviço, com
  mensagem explicando o problema.
- **SC-004**: Em 100% dos casos de teste de erro (e-mail duplicado, dados recusados, serviço fora do
  ar, tempo esgotado), o visitante vê uma mensagem em português sem códigos técnicos e o formulário
  nunca fica preso no estado "enviando".
- **SC-005**: Zero ocorrências da senha no armazenamento do navegador, no endereço da página ou no
  console durante qualquer fluxo.
- **SC-006**: A página é utilizável em larguras de 320 px a 1920 px, sem rolagem horizontal.
- **SC-007**: Em testes com usuários, pelo menos 90% concluem o cadastro na primeira tentativa, sem
  instruções.

## Assumptions

- **Rótulo do menu**: "registrar", em minúsculas, como os demais itens do cabeçalho ("testar
  chatbot").
- **Endereço**: `/register`, conforme solicitado (as demais rotas do projeto estão em português,
  mas o endereço pedido foi mantido).
- **Cliente vs. negócio**: "cliente" é qualquer pessoa que cria uma conta no AchaLocal; o cadastro
  de negócio (`/cadastrar-negocio`) continua separado e inalterado.
- **Após o sucesso**: como ainda não existe tela de login nem área logada, o visitante vê a mensagem
  do serviço (que pede a confirmação por e-mail) e permanece na página; não é autenticado
  automaticamente.
- **Regras de senha**: mínimo de 8 caracteres com pelo menos uma letra e um número (confirmado em
  2026-11-22); se o serviço de autenticação recusar a senha por regras próprias, sua mensagem é
  exibida conforme FR-017.
- **Sem confirmação de senha** (confirmado em 2026-11-22): o formulário tem apenas os três campos
  pedidos; o controle de mostrar/ocultar senha reduz erros de digitação.
- **Sem verificação de e-mail, termos de uso ou captcha** nesta versão.
- **Serviço de autenticação**: o serviço já existe (confirmado em 2026-11-22); recebe nome, e-mail
  e senha e responde com sucesso, e-mail já cadastrado ou erro. Seu endereço é configurável por
  ambiente; o contrato foi fornecido na etapa de plano (ver `contracts/auth-register-api.md`).
  A verificação de e-mail é feita pelo serviço; esta tela apenas exibe a mensagem que ele devolve.
- **Tempo máximo de espera**: 30 segundos sem resposta é tratado como falha.
- **Acesso público**: a página não exige autenticação.
- **Fora do escopo**: modo escuro; planos de assinatura; login; recuperação de senha; edição de
  perfil; cadastro via redes sociais.
- **Componentes visuais**: a biblioteca oficial de componentes, os tokens de tema e o cabeçalho já
  existentes no projeto serão reutilizados (ver constitution, Princípio V).
