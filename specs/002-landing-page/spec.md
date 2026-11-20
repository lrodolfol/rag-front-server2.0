# Feature Specification: Tela Inicial (Landing Page) do AchaLocal

**Feature Branch**: `main` (nenhum hook de criação de branch configurado)

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Criar tela inicial da aplicação seguindo modelo em ./tela-inicial.excalidraw" (fonte: `.mine/tela_inicial/specify.md`; modelo visual: `.mine/tela_inicial/tela-inicial.excalidraw`)

## Contexto

O AchaLocal é um diretório local com IA: donos de negócios cadastram seus serviços uma vez e um
chatbot (no estilo WhatsApp) recomenda esses negócios a pessoas que descrevem sua necessidade em
linguagem natural ("estou com fome", "preciso reformar"). A tela inicial é a porta de entrada do
produto: explica a proposta de valor, mostra como funciona, apresenta o plano mensal e conduz o
visitante a cadastrar seu negócio ou testar o chatbot.

O modelo visual define, de cima para baixo, as seções abaixo (todas obrigatórias):

1. **Cabeçalho**: logotipo/ícone + nome "AchaLocal" à esquerda; à direita, itens com ícone
   "testar chatbot", "meus negócios" e "sair" (os dois últimos só para usuário autenticado — FR-004).
2. **Destaque (hero)**: título "Seu negócio encontrado no estilo WhatsApp."; texto de apoio
   "Cadastre uma vez. Quando alguém perguntar "estou com fome" ou "preciso reformar", nosso chatbot
   recomenda você — com endereço, preço e contato."; botão principal (verde) "cadastrar meu
   negócio" e botão secundário (contornado) "testar o chat online", ambos com ícone; ilustração
   "flutuante" à direita (imagem de negócios locais com balões de conversa e marcadores de
   localização, fornecida no modelo).
3. **Como funciona**: título "Como funciona", subtítulo "Dois lados de uma mesma plataforma: quem
   oferece e quem precisa." e três cartões numerados com ícone:
   - "1. Cadastre" — "Conte sobre seu negócio: serviços, preços, horários, localização. Nosso
     serviço aprende e indexa."
   - "2. Usuário pergunta" — "No chatbot, alguém manda 'preciso de aula de inglês',
     'cabeleireiro', padaria, pedreiro etc."
   - "3. Recomendação" — "Nosso serviço encontra os negócios mais relevantes por similaridade e
     proximidade. Você aparece."
   Abaixo, bloco "Funciona com linguagem natural." com o texto "Os usuários não precisam saber o
   nome certo da categoria. O serviço entende o contexto e encontra o negócio certo na sua base.",
   botão "testar agora →" e, ao lado, uma **simulação de conversa no estilo WhatsApp construída
   na própria interface (não uma imagem)**.
4. **Por que é melhor que o Google?**: título e texto explicativo (conteúdo definido nesta spec,
   ver FR-010).
5. **Planos mensais**: cartão do plano "Essencial" — "R$ 9,99/mês", "respostas ilimitadas",
   "cancele quando quiser".
6. **Chamada final e contato**: título "Pronto para alcançar maiores resultados?", texto "Não
   fazemos pedidos ou integração com empresas, disponibilizamos informações e ajudamos o cliente a
   encontrar seu serviço", lista com ícones "Setup em 5 minutos", "Sem conhecimento técnico",
   "Resultados rápidos" e, ao lado, uma área de contato destacada ("flutuante"), somente por e-mail.
7. **Rodapé**: "© {ano atual} AchaLocal — diretório local com IA", com o ano obtido
   dinamicamente.

## Clarifications

### Session 2026-11-18

- Q: "meus negócios" e "sair" no cabeçalho, sem autenticação existente? → A: Ocultos por ora; aparecem só para usuários autenticados quando a autenticação existir.
- Q: Mecanismo de contato por e-mail? → A: Cartão com o endereço visível e botão que abre o cliente de e-mail do visitante (sem formulário).
- Q: Endereço de e-mail de contato? → A: `contato@tinosnegocios.com.br`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante entende a proposta e inicia o cadastro do negócio (Priority: P1)

Como dono de um negócio local que chega à aplicação, eu vejo imediatamente o que o AchaLocal faz e
consigo, com um clique, iniciar o cadastro do meu negócio.

**Why this priority**: É o objetivo principal da tela: converter donos de negócio em cadastros. O
cabeçalho e a seção de destaque sozinhos já entregam esse valor (MVP).

**Independent Test**: Abrir a rota inicial da aplicação e verificar que cabeçalho e destaque são
exibidos com os textos do modelo e que o botão "cadastrar meu negócio" leva ao destino de cadastro.

**Acceptance Scenarios**:

1. **Given** um visitante acessando a raiz da aplicação, **When** a página carrega, **Then** a tela inicial é exibida com cabeçalho (marca AchaLocal) e seção de destaque com título, texto de apoio, dois botões e ilustração.
2. **Given** a seção de destaque visível, **When** o visitante clica em "cadastrar meu negócio", **Then** é levado ao destino de cadastro de negócio.
3. **Given** a tela inicial, **When** o visitante clica na marca "AchaLocal" no cabeçalho, **Then** permanece/retorna ao topo da tela inicial.

---

### User Story 2 - Visitante experimenta o chatbot (Priority: P1)

Como pessoa curiosa (dono de negócio ou consumidor), eu quero testar o chatbot a partir da tela
inicial para entender como as recomendações funcionam.

**Why this priority**: Experimentar o produto é o segundo caminho de conversão e aparece em três
pontos do modelo (cabeçalho, destaque e "Como funciona").

**Independent Test**: Clicar em cada um dos três acionadores ("testar chatbot", "testar o chat
online", "testar agora →") e verificar que todos levam ao mesmo destino de teste do chatbot.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** o visitante clica em "testar chatbot" no cabeçalho, **Then** é levado ao destino de teste do chatbot.
2. **Given** a seção de destaque, **When** o visitante clica em "testar o chat online", **Then** é levado ao mesmo destino.
3. **Given** a seção "Como funciona", **When** o visitante clica em "testar agora →", **Then** é levado ao mesmo destino.

---

### User Story 3 - Visitante entende como funciona e por que vale a pena (Priority: P2)

Como dono de negócio avaliando o serviço, eu leio como a plataforma funciona, vejo um exemplo de
conversa e entendo por que é melhor que uma busca no Google.

**Why this priority**: Conteúdo de convencimento; aumenta conversão, mas a tela já entrega valor
sem ele.

**Independent Test**: Rolar a página e verificar a presença das seções "Como funciona" (3 cartões +
simulação de conversa) e "Por que é melhor que o Google?" com os textos definidos.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** o visitante rola até "Como funciona", **Then** vê o subtítulo e três cartões numerados (Cadastre, Usuário pergunta, Recomendação), cada um com ícone, título e descrição.
2. **Given** a seção "Como funciona", **When** exibida, **Then** há uma simulação de conversa no estilo WhatsApp com ao menos uma mensagem do usuário em linguagem natural e uma resposta do chatbot recomendando um negócio com endereço, preço e contato, e o texto da conversa é selecionável (não é imagem).
3. **Given** a tela inicial, **When** o visitante rola até "Por que é melhor que o Google?", **Then** vê o título e o texto explicativo definido em FR-010.

---

### User Story 4 - Visitante conhece o plano e entra em contato (Priority: P2)

Como dono de negócio decidido, eu vejo o preço do plano e consigo entrar em contato por e-mail.

**Why this priority**: Transparência de preço e canal de contato são necessários para a decisão,
mas dependem das seções anteriores para fazer sentido.

**Independent Test**: Verificar o cartão do plano Essencial com preço e condições, a seção de
chamada final com os três benefícios e acionar o contato por e-mail.

**Acceptance Scenarios**:

1. **Given** a seção "Planos mensais", **When** exibida, **Then** mostra o plano "Essencial", "R$ 9,99/mês", "respostas ilimitadas" e "cancele quando quiser".
2. **Given** a seção de chamada final, **When** exibida, **Then** mostra o título, o texto explicativo e os três benefícios com ícones.
3. **Given** a área de contato, **When** o visitante a aciona, **Then** o contato ocorre exclusivamente por e-mail, conforme FR-012.

---

### User Story 5 - Cabeçalho adequado ao visitante não autenticado (Priority: P3)

Como visitante sem conta, eu vejo no cabeçalho apenas opções que fazem sentido para mim, sem itens
de usuário logado ("meus negócios", "sair").

**Why this priority**: Evita confusão; os itens de usuário logado dependem da feature de
autenticação, que não existe ainda.

**Independent Test**: Abrir a tela inicial sem autenticação e verificar que o cabeçalho mostra
apenas a marca e "testar chatbot".

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado, **When** a tela inicial carrega, **Then** o cabeçalho exibe a marca "AchaLocal" e "testar chatbot", e não exibe "meus negócios" nem "sair".

---

### Edge Cases

- **Tela pequena (smartphone)**: as seções empilham em uma coluna; a ilustração do destaque e a
  simulação de conversa ficam abaixo do texto; os itens do cabeçalho não podem estourar a largura
  (devem ser recolhidos em menu ou reduzidos a ícones com rótulo acessível); não há rolagem
  horizontal.
- **Ilustração não carrega**: o texto do destaque e os botões permanecem utilizáveis e a imagem tem
  texto alternativo descritivo.
- **Destinos ainda não implementados** (cadastro, chatbot): o clique leva a um
  destino provisório informando "Em breve" em português, nunca a uma página em branco ou erro.
- **Virada de ano**: o ano no rodapé reflete o ano corrente do dispositivo do visitante, sem
  alteração de código.
- **Sem cliente de e-mail configurado**: o endereço de contato fica visível como texto para que o
  visitante possa copiá-lo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela inicial MUST ser exibida ao acessar a raiz da aplicação e MUST ser acessível
  sem autenticação.
- **FR-002**: A tela MUST conter, nesta ordem, as sete seções descritas em "Contexto" (cabeçalho,
  destaque, como funciona, por que é melhor que o Google, planos mensais, chamada final/contato,
  rodapé), com os textos do modelo corrigidos ortograficamente (acentuação; "Essencial").
- **FR-003**: O cabeçalho MUST exibir a marca "AchaLocal" com ícone e o item "testar chatbot" com
  ícone, separados do conteúdo por uma linha divisória (itens de usuário logado: ver FR-004).
- **FR-004**: Os itens "meus negócios" e "sair" MUST ser exibidos somente para usuários
  autenticados. Como a autenticação ainda não existe, nesta feature eles MUST permanecer ocultos e
  o cabeçalho exibe apenas a marca e "testar chatbot"; passarão a aparecer quando a feature de
  autenticação for entregue.
- **FR-005**: Os acionadores "testar chatbot", "testar o chat online" e "testar agora →" MUST
  levar ao mesmo destino de teste do chatbot.
- **FR-006**: O botão "cadastrar meu negócio" MUST ser a ação principal (cor primária da marca) e o
  botão "testar o chat online" MUST ser a ação secundária (contornado).
- **FR-007**: Destinos ainda não implementados MUST apresentar uma tela provisória "Em breve" em
  português, com caminho de volta à tela inicial.
- **FR-008**: A seção de destaque MUST exibir a ilustração fornecida no modelo com texto
  alternativo descritivo em português.
- **FR-009**: A simulação de conversa MUST ser construída com elementos de interface (texto real,
  não imagem), no estilo visual de um aplicativo de mensagens (balões alternados para usuário e
  chatbot), contendo uma pergunta em linguagem natural e uma resposta recomendando um negócio
  fictício com endereço, preço e contato.
- **FR-010**: A seção "Por que é melhor que o Google?" MUST apresentar um texto curto (até ~80
  palavras) explicando que: (a) o visitante descreve a necessidade em linguagem natural, sem saber
  o nome da categoria; (b) recebe recomendações diretas de negócios locais com endereço, preço e
  contato, em vez de uma lista de links e anúncios; (c) negócios pequenos aparecem por relevância e
  proximidade, não por quem paga mais por anúncio ou tem melhor SEO; (d) a conversa acontece no
  formato familiar de chat.
- **FR-011**: A seção "Planos mensais" MUST exibir um cartão do plano "Essencial" com "R$ 9,99/mês",
  "respostas ilimitadas" e "cancele quando quiser".
- **FR-012**: A área de contato MUST oferecer contato somente por e-mail, por meio de um cartão
  destacado que exibe o endereço `contato@tinosnegocios.com.br` como texto visível e um botão que
  abre o cliente de e-mail do visitante já endereçado a ele. Não há formulário nem envio pela
  própria aplicação.
- **FR-013**: O rodapé MUST exibir "© {ano} AchaLocal — diretório local com IA", com o ano
  calculado a partir da data atual.
- **FR-014**: Todos os textos exibidos MUST estar em português.
- **FR-015**: A tela MUST funcionar em desktop, tablet e smartphone sem rolagem horizontal; em
  telas estreitas as colunas MUST empilhar.
- **FR-016**: A tela MUST seguir a identidade visual oficial (verde primário, fundo off-white,
  destaques em verde claro) já estabelecida na feature 001, sem cores fora da paleta.
- **FR-017**: Todos os elementos interativos MUST ser acessíveis por teclado, ter foco visível e
  rótulo acessível (inclusive itens reduzidos a ícone).
- **FR-018**: A tela inicial MUST ser estática: não depende de dados carregados de serviços
  externos (preço, textos e conversa simulada são conteúdo fixo).

### Key Entities

- **Plano**: oferta de assinatura exibida na tela — nome ("Essencial"), preço mensal (R$ 9,99),
  benefícios ("respostas ilimitadas") e condição ("cancele quando quiser"). Conteúdo fixo nesta
  feature.
- **Mensagem simulada**: item da conversa de exemplo — autor (usuário ou chatbot) e texto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das seções e textos do modelo estão presentes na tela, na ordem definida
  (verificável por checklist contra o modelo).
- **SC-002**: Um visitante chega ao início do cadastro de negócio com no máximo 1 clique a partir
  da tela inicial e ao teste do chatbot com no máximo 1 clique.
- **SC-003**: O conteúdo principal (cabeçalho e destaque) fica visível em até 2 segundos numa
  conexão móvel 4G típica.
- **SC-004**: Em larguras de 360px, 768px e 1280px não há rolagem horizontal nem sobreposição de
  elementos.
- **SC-005**: A tela não apresenta violações de contraste ou de rótulo acessível em uma verificação
  automática de acessibilidade (nível WCAG AA).
- **SC-006**: Em teste com 5 pessoas, ao menos 4 conseguem explicar com suas palavras o que o
  AchaLocal faz após 30 segundos na página.

## Assumptions

- A tela inicial substitui a rota raiz atual; as rotas de demonstração existentes (vitrine de tema)
  continuam disponíveis apenas em desenvolvimento.
- As telas de cadastro de negócio, chatbot, "meus negócios" e autenticação são features futuras;
  nesta feature os botões de cadastro e chatbot levam a destinos provisórios ("Em breve").
- O plano "Essencial" é o único plano exibido e não há fluxo de pagamento nesta feature.
- A ilustração do destaque é a imagem embutida no modelo Excalidraw e pode ser usada pelo produto.
- Os ícones marcados como `<icone>` no modelo serão escolhidos do conjunto de ícones padrão da
  biblioteca visual oficial, coerentes com o rótulo de cada item.
- "Imagem flutuante" e "área flutuante" significam destaque visual (elevação/sombra ou leve
  animação), não elementos fixos que acompanham a rolagem.
- Textos do modelo foram corrigidos ortograficamente ("Essensial" → "Essencial", "Porque" → "Por
  que", "contado" → "contato").
