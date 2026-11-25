# Feature Specification: Área do Cliente (/dashboard)

**Feature Branch**: `feat/dashboard-page` (a criar; branch atual: `feat/register-page`)

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Criar tela '/dashboard' onde os clientes poderão gerenciar o negócio deles. Tela deve ser criada usando Angular Material como biblioteca oficial de componentes e mantendo o design do projeto. Objetivo: criar tela para que clientes possam gerenciar o negócio deles. Comportamento esperado: deve ser aberto se e somente se o cliente estiver logado e com token guardado na sessão ou storage; token deve ser válido (olhar tempo de expiração); deve-se passar por Route guards antes. Fora do escopo: modo escuro; planos de assinatura." (fonte: `.mine/dash-board_page/specify.md`; decisões complementares em `.mine/dash-board_page/plan.md`, `dash.excalidraw` e `dash02.excalidraw`)

## Contexto

O AchaLocal é um diretório local com IA. Clientes já podem se cadastrar (`/register`, feature 004)
e entrar no sistema (`/login`, feature 005); após o login, são levados a `/dashboard`, que hoje é
apenas uma página "em breve". Esta feature cria a área do cliente — "Meus negócios" — onde o
cliente autenticado vê o seu negócio cadastrado no diretório (ou é convidado a cadastrar um) e
acessa as ações de gestão. Cada cliente pode ter **um e somente um** negócio.

O acesso à área do cliente é restrito: só é permitido a quem tem uma sessão guardada e ainda não
expirada; qualquer outro visitante é levado ao login.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso restrito a clientes autenticados (Priority: P1)

Somente um cliente com sessão válida (guardada e dentro do prazo de expiração) consegue abrir a
área do cliente. Quem não tem sessão, ou tem uma sessão expirada ou corrompida, é levado à página de
login sem ver nenhum conteúdo da área do cliente.

**Why this priority**: é o requisito central e não negociável da descrição ("se e somente se o
cliente estiver logado com token válido"); sem ele, dados do cliente ficariam expostos.

**Independent Test**: abrir `/dashboard` (a) sem sessão, (b) com sessão expirada, (c) com sessão
malformada e (d) com sessão válida, verificando que apenas (d) exibe a área do cliente.

**Acceptance Scenarios**:

1. **Given** nenhuma sessão guardada, **When** o visitante abre `/dashboard` (digitando o endereço,
   por link ou recarregando), **Then** é levado a `/login` sem que a área do cliente seja exibida,
   nem por um instante.
2. **Given** uma sessão guardada cuja expiração já passou, **When** o cliente abre `/dashboard`,
   **Then** a sessão é descartada e ele é levado a `/login`.
3. **Given** uma sessão guardada incompleta ou corrompida, **When** o cliente abre `/dashboard`,
   **Then** a sessão é descartada e ele é levado a `/login`.
4. **Given** uma sessão válida e não expirada, **When** o cliente abre `/dashboard`, **Then** a área
   do cliente é exibida.
5. **Given** a área do cliente aberta, **When** a sessão expira enquanto o cliente permanece na
   página e ele realiza qualquer ação que dependa do serviço ou navega para outra área protegida,
   **Then** a sessão é descartada e ele é levado a `/login`.

---

### User Story 2 - Ver o próprio negócio (Priority: P1)

O cliente autenticado que já tem um negócio cadastrado vê, sob o título "Meus negócios", um cartão
com a imagem e o nome do negócio e o botão "Editar".

**Why this priority**: é o conteúdo principal da área do cliente — o ponto de partida para gerenciar
o negócio.

**Independent Test**: entrar com um cliente que tem negócio cadastrado e verificar o cartão com os
dados do negócio.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado com negócio cadastrado, **When** abre a área do cliente,
   **Then** vê o título "Meus negócios", o subtítulo "Gerencie os negócios que você cadastrou no
   diretório." e um cartão com a imagem (ou um ícone de imagem padrão, se não houver) e o nome do
   negócio.
2. **Given** o cartão do negócio exibido, **When** o cliente aciona "Editar", **Then** é levado a
   uma página "em breve" de edição do negócio.
3. **Given** o cartão do negócio exibido, **When** o cliente aciona o ícone "Excluir", **Then** é
   levado a uma página "em breve" de exclusão do negócio; nada é excluído.
4. **Given** um cliente que já tem negócio, **When** visualiza a área do cliente, **Then** a ação
   "Novo negócio" não é exibida (cada cliente tem no máximo um negócio).
5. **Given** os dados do negócio ainda estão sendo obtidos, **When** a página é exibida, **Then**
   aparece um indicador de carregamento no lugar do conteúdo.

---

### User Story 3 - Ser convidado a cadastrar o primeiro negócio (Priority: P1)

O cliente autenticado que ainda não tem negócio vê um estado vazio — ícone, "Nenhum negócio ainda",
"Cadastre seu primeiro negócio para aparecer no chatbot." e o botão "Cadastrar agora" — além do
botão "Novo negócio" ao lado do título.

**Why this priority**: todo cliente recém-cadastrado chega nesse estado; sem ele a página ficaria
vazia e sem direção.

**Independent Test**: entrar com um cliente sem negócio e verificar o estado vazio e as duas ações
de cadastro.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado sem negócio, **When** abre a área do cliente, **Then** vê o
   estado vazio com ícone, a mensagem "Nenhum negócio ainda", o texto "Cadastre seu primeiro
   negócio para aparecer no chatbot." e o botão "Cadastrar agora".
2. **Given** um cliente sem negócio, **When** visualiza o topo da página, **Then** vê o botão
   "Novo negócio" ao lado do título "Meus negócios".
3. **Given** o estado vazio, **When** o cliente aciona "Cadastrar agora" ou "Novo negócio",
   **Then** é levado à página "em breve" de cadastro de negócio.

---

### User Story 4 - Tratar falha ao obter os dados do negócio (Priority: P2)

Se não for possível obter os dados do negócio do cliente, a área do cliente exibe uma mensagem em
português e permite tentar novamente, sem quebrar a página nem expor detalhes técnicos.

**Why this priority**: a constitution exige tratamento dos estados de carregamento, erro e ausência
de dados em toda tela que carrega dados.

**Independent Test**: simular indisponibilidade do serviço e verificar a mensagem e a ação de
tentar novamente.

**Acceptance Scenarios**:

1. **Given** o serviço indisponível, sem resposta em até 30 segundos ou respondendo com qualquer
   erro (exceto sessão não aceita, cenário 3, e cliente sem negócio, User Story 3), **When** a área do cliente tenta obter os dados do negócio, **Then** é exibida a
   mensagem "Não foi possível carregar seus dados agora. Tente novamente em instantes." com o botão
   "Tentar novamente".
2. **Given** a mensagem de erro exibida, **When** o cliente aciona "Tentar novamente", **Then** uma
   nova tentativa é feita, com o indicador de carregamento visível.
3. **Given** o serviço responde que a sessão não é mais aceita, **When** a área do cliente recebe
   essa resposta, **Then** a sessão é descartada e o cliente é levado a `/login`.

---

### User Story 5 - Navegar e sair pela área do cliente (Priority: P2)

O cabeçalho da área do cliente oferece "Testar Chatbot", "Meus negócios" e "Sair". Ao sair, a
sessão é encerrada e o cliente volta à tela inicial. Abaixo do conteúdo, um cartão "Veja como
aparece no chatbot" convida o cliente a testar o chatbot.

**Why this priority**: completa a experiência da área do cliente; sem "Sair" o cliente não tem como
encerrar a sessão em um computador compartilhado.

**Independent Test**: na área do cliente, verificar os itens do cabeçalho, acionar "Sair" e
"Abrir o chat" e verificar os destinos e o estado da sessão.

**Acceptance Scenarios**:

1. **Given** a área do cliente aberta, **When** o cliente observa o cabeçalho, **Then** vê o
   logotipo "AchaLocal" e os itens "Testar Chatbot", "Meus negócios" e "Sair", cada um com ícone.
2. **Given** a área do cliente aberta, **When** o cliente aciona "Sair", **Then** a sessão é
   descartada, ele é levado à tela inicial e, se tentar voltar a `/dashboard` (inclusive pelo botão
   "voltar" do navegador), é levado a `/login`.
3. **Given** a área do cliente aberta, **When** o cliente aciona "Testar Chatbot" ou "Abrir o chat"
   no cartão "Veja como aparece no chatbot", **Then** é levado ao chatbot.
4. **Given** a área do cliente aberta, **When** o cliente aciona "Meus negócios", **Then**
   permanece na área do cliente (`/dashboard`).
5. **Given** a área do cliente aberta, **When** o cliente aciona o logotipo "AchaLocal", **Then** é
   levado à tela inicial (`/`), seguindo o padrão do site.

---

### Edge Cases

- Sessão expira exatamente durante o carregamento dos dados: tratado como sessão não aceita
  (descartar e levar a `/login`), sem mensagem de erro técnica.
- Várias abas: cada aba tem sua própria sessão (a sessão vive apenas na aba); sair em uma aba não
  afeta outra já aberta, mas qualquer nova abertura de `/dashboard` sem sessão leva a `/login`.
- Cliente acessa `/dashboard` diretamente após recarregar a página com sessão válida: a área do
  cliente é exibida normalmente.
- Nome do negócio muito longo: é exibido sem quebrar o layout (cortado com reticências ou quebrado
  em linhas, sem rolagem horizontal).
- Negócio sem imagem ou imagem que não carrega: exibido um ícone de imagem padrão.
- Serviço responde sucesso com dados de negócio incompletos/inválidos: tratado como falha ao obter
  os dados (User Story 4).
- Cliente sai da página durante o carregamento: a espera é cancelada sem erros visíveis.
- Telas pequenas (smartphone): cabeçalho, título, ações e cartões se reorganizam para a largura
  disponível, sem rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

**Controle de acesso**

- **FR-001**: O endereço `/dashboard` MUST ser acessível se e somente se existir uma sessão do
  cliente guardada, completa e cuja data de expiração ainda não tenha passado.
- **FR-002**: A verificação de acesso MUST ocorrer antes de qualquer conteúdo da área do cliente
  ser exibido ou de qualquer dado do cliente ser solicitado, em toda forma de navegação (endereço
  digitado, link interno, recarregamento, botões voltar/avançar).
- **FR-003**: Quando o acesso for negado, o sistema MUST descartar qualquer sessão inválida ou
  expirada e levar o visitante a `/login`.
- **FR-004**: Quando o serviço indicar que a sessão não é mais aceita, o sistema MUST descartar a
  sessão e levar o cliente a `/login`.

**Página e layout**

- **FR-005**: A página MUST exibir o título da aba do navegador identificando a área do cliente do
  AchaLocal.
- **FR-006**: A página MUST exibir um cabeçalho com logotipo + "AchaLocal" (link para a tela
  inicial) e os itens "Testar Chatbot", "Meus negócios" e "Sair", com ícones, seguindo a
  identidade visual do projeto.
- **FR-007**: A página MUST exibir o título "Meus negócios" e o subtítulo "Gerencie os negócios que
  você cadastrou no diretório.", seguindo os esboços `dash.excalidraw` e `dash02.excalidraw`.
- **FR-008**: A página MUST funcionar em desktop, tablet e smartphone, sem rolagem horizontal.

**Conteúdo do negócio**

- **FR-009**: O sistema MUST obter o negócio do cliente autenticado por meio de uma consulta própria
  ao serviço, feita a cada abertura da área do cliente (os dados exibidos estão sempre atualizados).
  O endereço e o formato da resposta serão definidos no plano de implementação.
- **FR-010**: Enquanto os dados do negócio são obtidos, o sistema MUST exibir um indicador de
  carregamento.
- **FR-011**: Quando o cliente tiver negócio, o sistema MUST exibir um cartão com a imagem (ou
  ícone padrão) e o nome do negócio e as ações "Editar" e "Excluir"; a ação "Novo negócio" MUST NOT
  ser exibida.
- **FR-012**: Quando o cliente não tiver negócio, o sistema MUST exibir o estado vazio (ícone,
  "Nenhum negócio ainda", "Cadastre seu primeiro negócio para aparecer no chatbot.", botão
  "Cadastrar agora") e a ação "Novo negócio" ao lado do título.
- **FR-013**: As ações "Cadastrar agora", "Novo negócio", "Editar" e "Excluir" MUST apenas levar o
  cliente a páginas "em breve" (padrão já usado no projeto); nenhuma delas MUST cadastrar, alterar
  ou excluir dados nesta feature.
- **FR-014**: Em falha ao obter os dados, o sistema MUST exibir "Não foi possível carregar seus
  dados agora. Tente novamente em instantes." com a ação "Tentar novamente", sem códigos, status
  técnicos ou identificadores de rastreamento. Sem resposta em até 30 segundos MUST ser tratado
  como falha.

**Chatbot e saída**

- **FR-015**: A página MUST exibir o cartão "Veja como aparece no chatbot", com o texto "Teste
  perguntas como "estou com fome" no simulador." e o botão "Abrir o chat", que leva ao chatbot.
- **FR-016**: O item "Testar Chatbot" do cabeçalho MUST levar ao chatbot.
- **FR-017**: O item "Sair" MUST descartar a sessão do cliente e levá-lo à tela inicial; após
  sair, nenhuma tentativa de voltar à área do cliente MUST ter sucesso sem novo login.

**Segurança e privacidade**

- **FR-018**: A credencial de acesso MUST continuar guardada apenas durante a sessão da aba do
  navegador (como definido na feature 005), MUST NOT ser movida para armazenamento persistente,
  MUST NOT aparecer no endereço da página e MUST NOT ser exibida na tela ou escrita em logs/console.
- **FR-019**: Toda solicitação ao serviço feita pela área do cliente MUST se identificar com a
  credencial de acesso da sessão.
- **FR-020**: O sistema MUST NOT escrever mensagens, erros ou logs no console do navegador.

**Acessibilidade e idioma**

- **FR-021**: Todos os botões, links e o cartão do negócio MUST ter rótulos acessíveis e ser
  operáveis por teclado; os estados de carregamento e erro MUST ser anunciados a leitores de tela.
- **FR-022**: Todos os textos exibidos ao cliente MUST estar em português.

### Key Entities

- **Sessão do cliente**: credencial de acesso, tipo, data de expiração e identificação do cliente,
  guardadas pelo login (feature 005). É o que libera ou nega o acesso à área do cliente.
- **Negócio**: o estabelecimento que o cliente cadastrou no diretório — no mínimo nome e imagem
  (opcional). Relação 1:1: cada cliente tem zero ou um negócio.
- **Estado da área do cliente**: carregando, com negócio, sem negócio, erro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das tentativas de abrir `/dashboard` sem sessão, com sessão expirada ou com
  sessão corrompida, o visitante é levado ao login sem ver nenhum conteúdo da área do cliente.
- **SC-002**: Em 100% das aberturas com sessão válida, a área do cliente é exibida e mostra o
  estado correto (com negócio ou sem negócio) em até 3 segundos em condições normais de rede.
- **SC-003**: Um cliente sem negócio consegue chegar à área de cadastro de negócio com 1 clique a
  partir da área do cliente.
- **SC-004**: Após "Sair", 100% das tentativas de voltar à área do cliente (endereço, link ou botão
  voltar) levam ao login.
- **SC-005**: Em 100% dos casos de teste de falha (serviço fora do ar, tempo esgotado, dados
  inválidos), o cliente vê uma mensagem em português sem códigos técnicos e consegue tentar
  novamente; a página nunca fica presa no estado de carregamento.
- **SC-006**: Zero ocorrências da credencial de acesso em armazenamento persistente, no endereço da
  página, na tela ou no console.
- **SC-007**: A página é utilizável em larguras de 320 px a 1920 px, sem rolagem horizontal.

## Assumptions

- **Armazenamento da sessão**: a descrição permite "sessão ou storage"; adota-se o armazenamento
  apenas da sessão da aba já usado pelo login (feature 005), pois a constitution (Princípio IV)
  proíbe guardar tokens em armazenamento persistente.
- **Validade do token**: considera-se válida a sessão completa cuja data de expiração (informada
  pelo serviço no login) ainda não passou; a validação definitiva da credencial continua sendo do
  serviço.
- **Destino ao negar acesso**: `/login`, sem mensagem adicional e sem retorno automático a
  `/dashboard` após o login (o login já leva a `/dashboard` por padrão).
- **Relação 1:1**: um cliente tem no máximo um negócio (`.mine/dash-board_page/plan.md`); por isso
  "Novo negócio" só aparece quando não há negócio, apesar do título no plural "Meus negócios"
  (mantido conforme os esboços).
- **Layout**: segue `dash.excalidraw` (sem negócio) e `dash02.excalidraw` (com negócio), com a
  identidade visual e os componentes oficiais do projeto (constitution, Princípio V).
- **Cabeçalho da área do cliente**: substitui os itens públicos ("registrar", "login") pelos itens
  de cliente autenticado ("Testar Chatbot", "Meus negócios", "Sair"). O cabeçalho da tela inicial
  não muda nesta feature.
- **Sair**: encerra a sessão apenas no navegador (descarta a credencial); não há solicitação de
  logout ao serviço.
- **Tempo máximo de espera**: 30 segundos, mesmo padrão do cadastro e do login.
- **Imagem do negócio**: a resposta atual do serviço não traz imagem; por isso o cartão exibe
  sempre o ícone de imagem padrão (US2 cenário 1, edge case "negócio sem imagem"). Exibir a imagem
  real fica fora do escopo até o serviço fornecê-la (plan, research R-05).
- **Dados do negócio**: obtidos por consulta própria ao serviço (não pelo campo `business` da
  resposta do login); endereço, método e formato serão informados no plano.
- **Ações de gestão**: "Cadastrar agora", "Novo negócio", "Editar" e "Excluir" levam a páginas
  "em breve" (decisão do usuário em 2026-11-22).
- **Fora do escopo**: modo escuro; planos de assinatura; cadastro, edição e exclusão do negócio
  (apenas páginas "em breve"); edição de dados do cliente; recuperação de senha;
  renovação automática da sessão; múltiplos negócios por cliente.
