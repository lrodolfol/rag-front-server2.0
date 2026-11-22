# Feature Specification: Tela de Login de Clientes (/login)

**Feature Branch**: `feat/login-page` (a criar; branch atual: `feat/register-page`)

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Refator tela inicial: a tela inicial deve ter um menu (ao lado de 'testar chatbot') chamado login e deve ser redirecionado para '/login'. Tela de login: criar a página '/login' usando Angular Material como biblioteca oficial de componentes e mantendo o design do projeto. Objetivo: criar tela para que clientes possam logar no sistema. Comportamento esperado: cliente informa nome e senha; aplicação manda solicitação para backend de auth. Fora do escopo: modo escuro; planos de assinatura." (fonte: `.mine/login_page/specify.md`; decisões complementares em `.mine/login_page/plan.md`)

## Contexto

O AchaLocal é um diretório local com IA. Clientes já podem criar uma conta em `/register`
(feature 004), mas não existe forma de entrar no sistema. Esta feature adiciona o item "login" ao
cabeçalho da tela inicial e cria a página `/login`, onde o cliente informa e-mail e senha para
acessar sua conta pelo serviço de autenticação. Após o login, o cliente é levado à área do cliente
(`/dashboard`), que será construída em feature própria.

> **Nota sobre o campo de identificação**: a descrição original cita "Nome" e senha, mas o contrato
> do serviço de autenticação (`.mine/login_page/plan.md`) recebe **e-mail** e senha, e o cadastro
> (feature 004) identifica o cliente pelo e-mail (o nome não é único). Esta especificação adota
> **e-mail** como identificador do login.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar na conta (Priority: P1)

O cliente abre `/login`, informa e-mail e senha e confirma. O sistema envia os dados ao serviço de
autenticação; enquanto aguarda, bloqueia o formulário e mostra que o login está em andamento; ao
concluir com sucesso, guarda a sessão do cliente e o leva à área do cliente (`/dashboard`), sem
exibir mensagem de sucesso.

**Why this priority**: é o objetivo da feature — permitir que clientes cadastrados acessem o
sistema. Sem isso não há valor entregue.

**Independent Test**: abrir `/login`, informar credenciais válidas, enviar e verificar que o
serviço recebe e-mail e senha, que a sessão do cliente fica disponível para as próximas
solicitações e que o cliente é levado a `/dashboard`.

**Acceptance Scenarios**:

1. **Given** a página `/login` aberta, **When** o cliente a visualiza, **Then** vê um formulário com
   os campos "E-mail" e "Senha" e o botão "entrar", no padrão visual da página de cadastro.
2. **Given** e-mail e senha preenchidos com valores válidos, **When** o cliente aciona "entrar"
   (clique ou tecla Enter), **Then** os dados são enviados ao serviço de autenticação.
3. **Given** o login foi enviado, **When** o serviço ainda não respondeu, **Then** o botão fica
   desabilitado, os campos ficam bloqueados e um indicador de carregamento aparece ao lado do botão.
4. **Given** o login foi enviado, **When** o serviço confirma as credenciais, **Then** a sessão do
   cliente é guardada e o cliente é levado a `/dashboard`, sem mensagem de sucesso.

---

### User Story 2 - Ser informado quando o login falha (Priority: P1)

Se as credenciais estiverem erradas, o e-mail ainda não tiver sido confirmado, ou o serviço estiver
indisponível, o cliente vê na própria página, de forma discreta e em cores de erro, uma mensagem em
português explicando o ocorrido, e pode tentar novamente.

**Why this priority**: falhas de login são frequentes (senha errada, e-mail não confirmado logo após
o cadastro); sem retorno claro o cliente fica sem saber o que fazer.

**Independent Test**: simular as respostas de credenciais inválidas, e-mail não confirmado e
serviço fora do ar e verificar a mensagem exibida e o estado do formulário.

**Acceptance Scenarios**:

1. **Given** um login enviado, **When** o serviço informa credenciais inválidas, **Then** é exibida
   a mensagem devolvida pelo serviço (ex.: "E-mail ou senha inválidos.") e o formulário é liberado.
2. **Given** um login enviado, **When** o serviço informa que o e-mail ainda não foi confirmado,
   **Then** é exibida a mensagem devolvida pelo serviço e o formulário é liberado.
3. **Given** um login enviado, **When** o serviço está indisponível, não responde em até 30 segundos
   ou devolve erro sem mensagem legível, **Then** é exibida a mensagem genérica "Não foi possível
   entrar agora. Tente novamente em instantes." e o formulário é liberado.
4. **Given** qualquer falha, **When** o formulário é liberado, **Then** o e-mail continua preenchido,
   a senha é apagada e nenhuma sessão é guardada.
5. **Given** uma mensagem de erro exibida, **When** o cliente altera e-mail ou senha, **Then** a
   mensagem deixa de ser exibida.

---

### User Story 3 - Corrigir dados inválidos antes de enviar (Priority: P2)

O cliente que deixa um campo em branco ou digita um e-mail mal formatado vê, junto ao campo, uma
mensagem em português, e o envio não acontece até que tudo esteja correto.

**Why this priority**: evita requisições inúteis ao serviço; complementa o fluxo principal.

**Independent Test**: tentar enviar com cada campo inválido e verificar a mensagem exibida e que
nenhuma requisição é feita.

**Acceptance Scenarios**:

1. **Given** um campo vazio, **When** o cliente sai do campo ou tenta enviar, **Then** é exibida a
   mensagem "Campo obrigatório" junto ao campo.
2. **Given** um e-mail em formato inválido (ex.: "maria@"), **When** o cliente sai do campo ou tenta
   enviar, **Then** é exibida a mensagem "Informe um e-mail válido".
3. **Given** qualquer campo inválido, **When** o cliente tenta enviar, **Then** nenhuma requisição é
   feita e o foco vai para o primeiro campo inválido.
4. **Given** o campo de senha preenchido, **When** o cliente aciona o botão de mostrar/ocultar,
   **Then** a senha alterna entre visível e oculta.

---

### User Story 4 - Chegar ao login pela tela inicial (Priority: P2)

Na tela inicial, o cliente vê no cabeçalho o item "login" junto a "testar chatbot" e "registrar" e,
ao clicar, é levado à página de login.

**Why this priority**: é o ponto de entrada principal da página; sem ele o login só é acessível
digitando o endereço.

**Independent Test**: abrir a tela inicial, verificar o item "login" no cabeçalho e clicar nele.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** o cliente observa o cabeçalho, **Then** vê o item "login", com
   ícone, junto a "testar chatbot" e "registrar", no mesmo estilo dos demais itens.
2. **Given** a tela inicial, **When** o cliente clica em "login", **Then** é levado a `/login`.
3. **Given** a página `/login`, **When** o cliente clica no logotipo "AchaLocal" ou em "início" no
   cabeçalho, **Then** volta à tela inicial.

---

### Edge Cases

- Duplo clique / Enter repetido no envio: apenas uma requisição é feita.
- Espaços no início e fim do e-mail: removidos; e-mail enviado em minúsculas. A senha é enviada
  exatamente como digitada.
- Textos muito longos: e-mail limitado a 254 caracteres e senha a 64; o excedente não pode ser
  digitado.
- Gerenciadores de senha / preenchimento automático: os campos são reconhecidos como e-mail e senha
  atual.
- Cliente sai da página com o login em andamento: a espera é cancelada sem erros visíveis e nenhuma
  sessão é guardada.
- Cliente recarrega `/login`: o formulário volta vazio.
- Serviço responde sucesso sem os dados de sessão esperados: tratado como falha genérica; nenhuma
  sessão é guardada e o cliente não é redirecionado.
- Novo login com sessão anterior já guardada: a nova sessão substitui a anterior.
- Telas pequenas (smartphone): o formulário ocupa a largura disponível, sem rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

**Tela inicial**

- **FR-001**: O cabeçalho da tela inicial MUST exibir o item "login", com ícone, junto a "testar
  chatbot" e "registrar", no mesmo estilo visual dos demais itens.
- **FR-002**: O item "login" MUST levar o cliente à página `/login`.

**Página e layout**

- **FR-003**: O endereço `/login` MUST exibir a página de login; o título da aba do navegador MUST
  identificar o login do AchaLocal.
- **FR-004**: A página MUST exibir o cabeçalho do site com logotipo + "AchaLocal" (link para a tela
  inicial) e o item "início", seguindo o padrão das demais páginas.
- **FR-005**: A página MUST seguir a identidade visual do projeto e o layout da página de cadastro
  (bloco central com ícone, título, subtítulo, campos, aviso e botão) e funcionar em desktop, tablet
  e smartphone, sem rolagem horizontal.

**Formulário e validação**

- **FR-006**: O formulário MUST conter um título, um subtítulo, os campos obrigatórios "E-mail" e
  "Senha" e um botão de envio rotulado "entrar".
- **FR-007**: O e-mail MUST ter formato válido (usuário@domínio). A senha MUST ser apenas
  obrigatória; regras de composição da senha MUST NOT ser aplicadas no login.
- **FR-008**: Cada campo inválido MUST exibir mensagem de validação em português junto ao campo, a
  partir do momento em que o cliente sai do campo ou tenta enviar.
- **FR-009**: O sistema MUST NOT enviar o formulário enquanto houver campo inválido e MUST levar o
  foco ao primeiro campo inválido ao tentar enviar.
- **FR-010**: O campo de senha MUST ficar oculto por padrão e oferecer um controle acessível para
  mostrar/ocultar o conteúdo.
- **FR-011**: O sistema MUST remover espaços no início e no fim do e-mail e enviá-lo em minúsculas.

**Envio e sessão**

- **FR-012**: Ao enviar um formulário válido, o sistema MUST enviar e-mail e senha ao serviço de
  autenticação, uma única vez por envio.
- **FR-013**: Do envio até a resposta, o botão MUST ficar desabilitado, os campos bloqueados e um
  indicador de carregamento visível ao lado do botão.
- **FR-014**: Em caso de sucesso, o sistema MUST guardar a sessão do cliente (credencial de acesso,
  tipo e data de expiração devolvidos pelo serviço) para uso em solicitações futuras e MUST levar o
  cliente a `/dashboard` sem exibir mensagem de sucesso.
- **FR-015**: A sessão MUST durar no máximo até a expiração informada pelo serviço ou até o
  fechamento da aba/navegador, o que ocorrer primeiro.

**Erros**

- **FR-016**: Quando o serviço recusar o login com mensagem legível (ex.: credenciais inválidas,
  e-mail não confirmado), o sistema MUST exibir essa mensagem na própria página, em cores de erro e
  de forma discreta, sem códigos, status técnicos, identificadores de rastreamento ou detalhes
  internos.
- **FR-017**: Quando o serviço estiver indisponível, não responder em até 30 segundos ou devolver
  erro sem mensagem legível, o sistema MUST exibir "Não foi possível entrar agora. Tente novamente em
  instantes."
- **FR-018**: Após qualquer falha, o formulário MUST ser liberado mantendo o e-mail digitado e
  apagando a senha; nenhuma sessão MUST ser guardada.
- **FR-019**: A mensagem de erro MUST deixar de ser exibida quando o cliente alterar algum campo ou
  enviar novamente.

**Segurança e privacidade**

- **FR-020**: A senha MUST NOT ser armazenada no navegador, exibida em mensagens, incluída no
  endereço da página nem escrita em logs ou no console.
- **FR-021**: A credencial de acesso MUST NOT ser guardada em armazenamento persistente do navegador
  (que sobreviva ao fechamento do navegador), MUST NOT aparecer no endereço da página e MUST NOT ser
  escrita em logs, no console ou na tela.
- **FR-022**: O sistema MUST NOT escrever mensagens, erros ou logs no console do navegador; o
  monitoramento é feito pelo serviço.

**Acessibilidade e idioma**

- **FR-023**: Todos os campos e botões MUST ter rótulos acessíveis e ser operáveis por teclado;
  mensagens de erro MUST ser anunciadas a leitores de tela.
- **FR-024**: Todos os textos exibidos ao cliente MUST estar em português (exceto mensagens vindas
  do serviço).

### Key Entities

- **Credenciais de login**: e-mail e senha informados pelo cliente. Existem apenas durante o
  preenchimento; nada é guardado no navegador.
- **Sessão do cliente**: resultado de um login bem-sucedido — credencial de acesso, tipo da
  credencial, data de expiração e identificação do cliente. Usada pelas próximas solicitações e pela
  área do cliente.
- **Resultado do login**: resposta do serviço — sucesso, credenciais inválidas, e-mail não
  confirmado, ou falha/indisponibilidade.
- **Estado do formulário**: preenchendo, enviando, erro (o sucesso leva a outra página).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente consegue chegar da tela inicial à página de login com 1 clique.
- **SC-002**: Um cliente cadastrado consegue preencher e enviar o login em menos de 30 segundos.
- **SC-003**: 100% dos envios com campo inválido são bloqueados antes de chegar ao serviço, com
  mensagem explicando o problema.
- **SC-004**: Em 100% dos casos de teste de erro (credenciais inválidas, e-mail não confirmado,
  serviço fora do ar, tempo esgotado), o cliente vê uma mensagem em português sem códigos técnicos
  e o formulário nunca fica preso no estado "enviando".
- **SC-005**: Em 100% dos logins bem-sucedidos, o cliente é levado à área do cliente e a sessão
  está disponível para as solicitações seguintes.
- **SC-006**: Zero ocorrências da senha no armazenamento do navegador, no endereço da página ou no
  console; zero ocorrências da credencial de acesso em armazenamento persistente, no endereço ou no
  console.
- **SC-007**: A página é utilizável em larguras de 320 px a 1920 px, sem rolagem horizontal.

## Assumptions

- **Identificador**: o login usa **e-mail** (e não nome), conforme o contrato do serviço em
  `.mine/login_page/plan.md` e o cadastro da feature 004.
- **Rótulo e posição do menu**: "login", em minúsculas como os demais itens, exibido junto a "testar
  chatbot" e "registrar" (ordem: "testar chatbot", "registrar", "login").
- **Textos da tela**: título "Acesse sua conta" e subtítulo "Gerencie seus negócios no AchaLocal.",
  seguindo o desenho da página de cadastro; podem ser ajustados no plano.
- **Após o sucesso**: sem mensagem de sucesso; redirecionamento direto para `/dashboard`
  (`.mine/login_page/plan.md`). A área do cliente e sua proteção de acesso (verificação de sessão
  válida e não expirada) pertencem à feature de dashboard; até ela existir, `/dashboard` deve
  apenas existir como destino válido (ex.: página "em breve" já usada no projeto).
- **Duração da sessão**: guardada apenas durante a sessão do navegador (não sobrevive ao fechamento)
  e respeitando a expiração informada pelo serviço, conforme a constitution (Princípio IV) e a
  especificação do dashboard ("token guardado na sessão").
- **Serviço de autenticação**: já existe; recebe e-mail e senha e responde no mesmo formato de
  envelope do cadastro (sucesso com dados de sessão; 401 credenciais inválidas; 403 e-mail não
  confirmado; ambos com mensagem legível). Endereço configurável por ambiente (UAT disponível;
  produção ainda não existe).
- **Tempo máximo de espera**: 30 segundos sem resposta é tratado como falha (mesmo padrão do
  cadastro).
- **Usuário já logado acessando `/login`**: o formulário é exibido normalmente; um novo login
  substitui a sessão anterior.
- **Acesso público**: a página de login não exige autenticação.
- **Fora do escopo**: modo escuro; planos de assinatura; logout; recuperação de senha; reenvio do
  link de confirmação de e-mail; "lembrar de mim"; login via redes sociais; links cruzados entre
  login e cadastro; implementação da área do cliente (`/dashboard`).
- **Componentes visuais**: a biblioteca oficial de componentes, os tokens de tema, o cabeçalho e o
  padrão visual da página de cadastro serão reutilizados (ver constitution, Princípio V).
