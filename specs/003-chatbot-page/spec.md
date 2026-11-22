# Feature Specification: Página do Chatbot (/chatbot)

**Feature Branch**: `feat/chat-online-page`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "Criar a página /chatbot mantendo o design do projeto. Objetivo: criar tela para o usuário experimentar o funcionamento do sistema em RAG. A tela deve funcionar como um chat real de conversas entre o usuário e o sistema. Fora do escopo: modo escuro; histórico." (fonte: `.mine/chat-bot-page/specify.md`; decisões complementares: `.mine/chat-bot-page/plan.md`; modelo visual: `.mine/chat-bot-page/tela-chat.excalidraw`)

## Contexto

O AchaLocal é um diretório local com IA: pessoas descrevem o que precisam em linguagem natural e o
serviço recomenda negócios locais cadastrados. A tela inicial já convida o visitante a "testar o
chat online" / "testar chatbot", mas hoje o endereço `/chatbot` mostra apenas uma página "em breve".
Esta feature entrega a experiência real de conversa: o visitante escreve uma pergunta, o serviço de
recomendação a processa e as respostas aparecem como mensagens de um chat.

O modelo visual define dois estados da mesma tela:

1. **Antes da primeira mensagem**: cabeçalho do site (logotipo + "AchaLocal" e itens com ícone
   "início" e "cadastrar"); janela de chat flutuante com cabeçalho verde mostrando ícone, nome do
   assistente "AchaLocalBot" e o indicador "online"; mensagem de boas-vindas
   ("👋 Olá! Eu sou o AchaLocalBot" + "Como posso ajudar você hoje? Digite sua pergunta abaixo.");
   bloco "experimente:" com sugestões clicáveis ("estou com fome", "preciso reformar minha casa",
   "onde comprar roupas novas?", "quero cortar cabelo", "quero aprender inglês",
   "manutenção de celular"); campo de texto e botão de enviar com ícone.
2. **Durante a conversa**: as mensagens do usuário alinhadas de um lado e cada resposta do
   assistente como um balão separado do outro lado, todas com horário (HH:MM); campo de texto e
   botão de enviar ao final.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fazer uma pergunta e receber recomendações (Priority: P1)

O visitante abre `/chatbot`, digita o que procura (ex.: "procuro restaurantes para comer com a
família") e envia. A mensagem aparece imediatamente na conversa, a tela indica que o assistente
está "pensando" e, à medida que o serviço produz respostas, cada uma aparece como um balão próprio,
como em um aplicativo de mensagens. Enquanto as respostas não terminam, o visitante não pode enviar
outra mensagem; quando terminam, o campo é liberado para a próxima pergunta.

**Why this priority**: é a razão de existir da página — demonstrar na prática que o serviço entende
linguagem natural e recomenda negócios. Sem isso não há feature.

**Independent Test**: abrir `/chatbot`, enviar uma pergunta e verificar que a mensagem do usuário e
uma ou mais respostas do assistente aparecem em balões separados, com horário, e que o envio fica
bloqueado até a última resposta chegar.

**Acceptance Scenarios**:

1. **Given** a página aberta e o campo vazio, **When** o visitante digita uma pergunta e aciona
   "enviar" (botão ou tecla Enter), **Then** a pergunta aparece na conversa como mensagem do
   usuário, com o horário do envio, e o campo de texto é esvaziado.
2. **Given** uma pergunta acabou de ser enviada, **When** o serviço ainda não terminou de
   responder, **Then** o campo de texto e o botão de enviar ficam desabilitados e um indicador de
   "digitando/aguardando" do assistente é exibido.
3. **Given** o serviço devolve várias respostas para a mesma pergunta, **When** cada resposta
   chega, **Then** ela é exibida imediatamente como um balão separado do assistente, com horário,
   na ordem em que foi recebida, sem esperar as demais.
4. **Given** todas as respostas da pergunta foram recebidas, **When** o serviço sinaliza o fim do
   processamento, **Then** o indicador de espera desaparece e o campo de texto e o botão voltam a
   ficar habilitados, com o foco no campo de texto.
5. **Given** uma conversa com várias mensagens, **When** chega uma nova mensagem (do usuário ou do
   assistente), **Then** a área da conversa rola automaticamente para exibir a mensagem mais
   recente.
6. **Given** o visitante já fez perguntas anteriores, **When** envia uma nova pergunta, **Then** o
   serviço recebe o mesmo identificador de visitante usado nas perguntas anteriores dessa visita.

---

### User Story 2 - Começar pela tela de boas-vindas e sugestões (Priority: P2)

Ao abrir a página pela primeira vez, o visitante vê uma saudação do assistente e uma lista de
sugestões de perguntas ("experimente:"). Ao clicar em uma sugestão, ela é enviada como se o
visitante a tivesse digitado.

**Why this priority**: reduz o "medo da página em branco" e mostra exemplos do tipo de pergunta que
o serviço entende, aumentando a chance de o visitante experimentar. Depende da P1 para ter efeito
completo, mas a tela de boas-vindas pode ser verificada isoladamente.

**Independent Test**: abrir `/chatbot` sem enviar nada e verificar a saudação e as seis sugestões;
clicar em uma sugestão e verificar que ela é enviada como mensagem do usuário.

**Acceptance Scenarios**:

1. **Given** a página recém-aberta, **When** nenhuma mensagem foi enviada, **Then** são exibidos o
   cabeçalho do assistente (nome e "online"), a saudação de boas-vindas e o bloco "experimente:"
   com as sugestões.
2. **Given** a tela de boas-vindas, **When** o visitante clica em uma sugestão, **Then** o texto da
   sugestão é enviado exatamente como no fluxo da User Story 1.
3. **Given** a primeira mensagem foi enviada (digitada ou por sugestão), **When** a conversa
   começa, **Then** o bloco de sugestões deixa de ser exibido e a saudação permanece no topo da
   conversa.
4. **Given** uma resposta está sendo aguardada, **When** o visitante tenta clicar em uma sugestão,
   **Then** nada é enviado (as sugestões seguem a mesma regra de bloqueio do campo de texto).

---

### User Story 3 - Ser informado com clareza quando algo dá errado (Priority: P2)

Se o serviço recusar a pergunta, estiver indisponível ou o visitante atingir o limite de uso, a
conversa mostra uma mensagem em linguagem natural explicando o ocorrido, sem códigos técnicos.
Quando o limite de uso é atingido, a página deixa de enviar novas perguntas.

**Why this priority**: o serviço de recomendação aplica limite de uso e pode falhar; sem tratamento
claro o visitante fica preso em uma tela "pensando" para sempre ou vê mensagens técnicas, o que
prejudica a demonstração do produto.

**Independent Test**: simular respostas de erro do serviço (erro com mensagem, limite de uso
atingido, serviço fora do ar) e verificar a mensagem exibida e o estado do campo de envio.

**Acceptance Scenarios**:

1. **Given** uma pergunta enviada, **When** o serviço responde com erro acompanhado de uma mensagem
   em linguagem natural, **Then** essa mensagem é exibida na conversa (destacada como aviso), sem
   código de erro, status técnico ou detalhes internos, e o campo é liberado para nova tentativa.
2. **Given** uma pergunta enviada, **When** o serviço informa que o limite de uso foi atingido,
   **Then** a mensagem original do serviço sobre o limite é exibida e o campo de texto, o botão de
   enviar e as sugestões ficam permanentemente desabilitados durante a visita, com uma indicação
   visível do motivo.
3. **Given** o limite de uso foi atingido, **When** o visitante tenta enviar qualquer coisa,
   **Then** nenhuma nova requisição é feita ao serviço.
4. **Given** uma pergunta enviada, **When** o serviço não responde, está fora do ar ou devolve erro
   sem mensagem legível, **Then** é exibida uma mensagem genérica em português (ex.: "Não consegui
   responder agora. Tente novamente em instantes.") e o campo é liberado.
5. **Given** o serviço já havia enviado algumas respostas, **When** a comunicação é interrompida
   antes do fim, **Then** as respostas já recebidas permanecem visíveis, é exibido o aviso genérico
   e o campo é liberado.
6. **Given** qualquer situação de erro, **When** ela ocorre, **Then** nada é registrado no console
   do navegador e nenhum detalhe técnico aparece na tela.

---

### User Story 4 - Navegar a partir da página do chat (Priority: P3)

O visitante pode voltar à tela inicial ou ir para o cadastro de negócio pelo cabeçalho da página.

**Why this priority**: conveniência de navegação; a página funciona sem isso, mas fica isolada.

**Independent Test**: clicar em "início" e "cadastrar" no cabeçalho e verificar o destino.

**Acceptance Scenarios**:

1. **Given** a página do chat, **When** o visitante clica em "início" ou no logotipo, **Then** é
   levado à tela inicial.
2. **Given** a página do chat, **When** o visitante clica em "cadastrar", **Then** é levado à página
   de cadastro de negócio (atualmente "em breve").
3. **Given** a tela inicial, **When** o visitante clica em "testar o chat online" ou
   "testar agora", **Then** é levado à página do chat funcional (não mais à página "em breve").

---

### Edge Cases

- Mensagem vazia ou composta só de espaços: o envio não acontece (botão desabilitado / Enter
  ignorado).
- Mensagem muito longa: o campo aceita até 50 caracteres; o excedente não pode ser digitado
  (inclusive ao colar texto, que é cortado no limite) e o visitante vê um contador de caracteres
  usados/restantes.
- Shift+Enter: insere quebra de linha em vez de enviar.
- Duplo clique / Enter repetido: apenas uma mensagem é enviada.
- Resposta do serviço sem nenhuma mensagem útil (fim de processamento sem conteúdo): exibir aviso
  amigável "Não encontrei resultados para isso. Tente descrever de outro jeito." e liberar o campo.
- Resposta individual do serviço fora do formato esperado: ela é ignorada silenciosamente; as
  demais respostas válidas continuam sendo exibidas.
- Texto devolvido pelo serviço contendo marcação/HTML: é exibido como texto puro, nunca
  interpretado.
- Quebras de linha nas respostas do serviço: são preservadas na exibição.
- Visitante atualiza a página: a conversa é perdida, a tela volta ao estado de boas-vindas e um
  novo identificador de visitante é gerado (inclusive o bloqueio por limite de uso é reiniciado na
  interface; o serviço continua aplicando seu próprio limite).
- Visitante sai da página com uma resposta em andamento: a espera é cancelada sem erros visíveis.
- Telas pequenas (smartphone): a janela de chat ocupa a largura disponível, o campo de texto
  permanece visível acima do teclado virtual e não há rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

**Página e layout**

- **FR-001**: O endereço `/chatbot` MUST exibir a página do chat funcional, substituindo a página
  "em breve"; o título da aba do navegador MUST identificar a página do chatbot do AchaLocal.
- **FR-002**: A página MUST exibir o cabeçalho do site com logotipo + "AchaLocal" (link para a tela
  inicial) e os itens "início" e "cadastrar", com ícones, seguindo o padrão visual da tela inicial.
- **FR-003**: A página MUST exibir uma janela de chat flutuante com cabeçalho contendo ícone, nome
  do assistente ("AchaLocalBot") e o indicador "online".
- **FR-004**: A página MUST seguir a identidade visual do projeto: fundo da página off-white
  (`#FCFAF1`), fundo da janela de chat `#F3F2E9`, cabeçalho da janela no verde primário
  (`#00A35C`), balões de mensagem brancos (`#FFFFFF`) com texto `#07150E`, aplicados pelos tokens
  centralizados de cor do projeto.
- **FR-005**: Mensagens do usuário e do assistente MUST ser visualmente distinguíveis (lados
  opostos da conversa) e cada mensagem MUST exibir o horário em que foi enviada/recebida no formato
  HH:MM.
- **FR-006**: A página MUST funcionar em desktop, tablet e smartphone, sem rolagem horizontal.

**Boas-vindas e sugestões**

- **FR-007**: Antes da primeira mensagem, a conversa MUST exibir a saudação
  "👋 Olá! Eu sou o AchaLocalBot" e o texto "Como posso ajudar você hoje? Digite sua pergunta
  abaixo."
- **FR-008**: Antes da primeira mensagem, a página MUST exibir o rótulo "experimente:" e as
  sugestões clicáveis: "estou com fome", "preciso reformar minha casa", "onde comprar roupas
  novas?", "quero cortar cabelo", "quero aprender inglês", "manutenção de celular".
- **FR-009**: Clicar em uma sugestão MUST enviar o texto da sugestão pelo mesmo fluxo de uma
  mensagem digitada.
- **FR-010**: Após o envio da primeira mensagem, as sugestões MUST deixar de ser exibidas.

**Envio e recebimento**

- **FR-011**: O visitante MUST poder enviar uma mensagem pelo botão de enviar ou pela tecla Enter;
  Shift+Enter MUST inserir quebra de linha.
- **FR-012**: O sistema MUST impedir o envio de mensagens vazias ou só com espaços e MUST limitar a
  mensagem a 50 caracteres, exibindo um contador de caracteres ao visitante; espaços no início e no
  fim MUST ser removidos antes do envio.
- **FR-013**: Ao carregar a página, o sistema MUST gerar um identificador de visitante aleatório e
  único, e MUST enviá-lo ao serviço de recomendação junto com cada mensagem da visita. O
  identificador MUST NOT ser persistido entre visitas.
- **FR-014**: Ao enviar, a mensagem do usuário MUST aparecer imediatamente na conversa e o campo de
  texto MUST ser esvaziado.
- **FR-015**: Do envio até o fim do processamento (sucesso ou erro), o campo de texto, o botão de
  enviar e as sugestões MUST ficar desabilitados, e um indicador de espera do assistente MUST ser
  exibido.
- **FR-016**: Cada resposta parcial devolvida pelo serviço MUST ser exibida assim que chegar, como
  um balão separado do assistente, na ordem de chegada.
- **FR-017**: Ao fim do processamento, o sistema MUST remover o indicador de espera, reabilitar o
  envio (salvo bloqueio por limite de uso — FR-021) e devolver o foco ao campo de texto.
- **FR-018**: A área de conversa MUST rolar automaticamente até a mensagem mais recente sempre que
  uma nova mensagem for adicionada.
- **FR-019**: Textos recebidos do serviço MUST ser exibidos como texto puro (sem interpretação de
  marcação), preservando quebras de linha.

**Erros e limite de uso**

- **FR-020**: Quando o serviço devolver erro acompanhado de mensagem em linguagem natural, o sistema
  MUST exibir essa mensagem na conversa como aviso, sem códigos, status técnicos ou detalhes
  internos.
- **FR-021**: Quando o serviço informar que o limite de uso foi atingido, o sistema MUST exibir a
  mensagem original do serviço, MUST bloquear definitivamente (até a página ser recarregada) o
  campo, o botão e as sugestões, MUST exibir uma indicação visível do bloqueio e MUST NOT fazer
  nenhuma nova requisição ao serviço.
- **FR-022**: Quando o serviço estiver indisponível, não responder em até 60 segundos, interromper
  a resposta ou devolver erro sem mensagem legível, o sistema MUST exibir uma mensagem genérica em
  português e liberar o envio; respostas já exibidas MUST permanecer na conversa.
- **FR-023**: Quando o processamento terminar sem nenhuma resposta útil, o sistema MUST exibir
  "Não encontrei resultados para isso. Tente descrever de outro jeito." e liberar o envio.
- **FR-024**: O sistema MUST NOT escrever mensagens, erros ou logs no console do navegador nem
  exibir informações de diagnóstico na tela.

**Navegação e sessão**

- **FR-025**: Os botões da tela inicial que levam ao chat ("testar o chat online", "testar agora",
  "testar chatbot") MUST abrir a página do chat funcional.
- **FR-026**: A conversa MUST existir apenas em memória: ao recarregar ou sair da página, todas as
  mensagens são descartadas e a tela volta ao estado de boas-vindas.
- **FR-027**: Ao sair da página com uma resposta em andamento, o sistema MUST cancelar a espera sem
  exibir erro.
- **FR-028**: Todos os textos exibidos ao visitante (exceto os conteúdos vindos do serviço) MUST
  estar em português.

**Acessibilidade**

- **FR-029**: Novas mensagens do assistente MUST ser anunciadas a leitores de tela; o campo de
  texto, o botão de enviar e as sugestões MUST ter rótulos acessíveis e ser operáveis por teclado.

### Key Entities

- **Mensagem da conversa**: um item exibido no chat. Atributos: autor (visitante ou assistente),
  tipo (mensagem normal ou aviso de erro/limite), texto, horário. Existe apenas durante a visita.
- **Identificador do visitante**: valor aleatório gerado ao abrir a página e enviado em todas as
  perguntas da visita, permitindo ao serviço relacionar as mensagens de uma mesma conversa e
  aplicar limites de uso.
- **Pergunta**: o texto enviado pelo visitante + o identificador do visitante.
- **Resposta parcial**: cada trecho de texto devolvido pelo serviço para uma pergunta; uma pergunta
  pode gerar várias respostas parciais.
- **Estado do chat**: boas-vindas (sem mensagens), aguardando resposta, pronto para enviar,
  bloqueado por limite de uso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O visitante consegue enviar a primeira pergunta em até 10 segundos após abrir a
  página (digitando ou clicando em uma sugestão).
- **SC-002**: A mensagem enviada aparece na conversa em menos de 0,2 segundo após o envio, e cada
  resposta parcial aparece em menos de 0,5 segundo após ser recebida.
- **SC-003**: Em 100% dos casos de teste de erro (erro com mensagem, limite de uso, serviço fora do
  ar, interrupção, tempo esgotado), o visitante vê uma mensagem em português sem códigos técnicos e
  a tela nunca fica presa no estado "aguardando".
- **SC-004**: Após o limite de uso ser atingido, zero novas requisições são feitas ao serviço até a
  página ser recarregada.
- **SC-005**: Zero mensagens escritas no console do navegador durante qualquer fluxo da página.
- **SC-006**: A página é utilizável em larguras de tela de 320 px a 1920 px, sem rolagem horizontal
  e com o campo de envio sempre visível.
- **SC-007**: Em testes com usuários, pelo menos 90% conseguem fazer uma pergunta e ler as
  recomendações na primeira tentativa, sem instruções.

## Assumptions

- **Nome do assistente**: o modelo visual usa "AchalocalBot" no cabeçalho e "SpotBot" na saudação;
  adotou-se "AchaLocalBot" em ambos para consistência com a marca.
- **Sugestões**: os textos do modelo foram corrigidos ortograficamente ("inglês", "celular").
- **Limite de caracteres**: 50 caracteres por mensagem (definido pelo responsável do produto em
  2026-11-21); todas as sugestões de FR-008 cabem nesse limite.
- **Tempo máximo de espera**: 60 segundos sem resposta do serviço é tratado como falha.
- **Sem contexto de conversa na interface**: cada pergunta envia apenas o texto atual e o
  identificador do visitante; se o serviço usa o histórico, ele o mantém do lado dele.
- **Bloqueio por limite**: dura até a página ser recarregada (não há histórico nem persistência —
  coerente com o escopo); o serviço continua sendo a autoridade sobre o limite.
- **Acesso público**: a página não exige autenticação.
- **Serviço de recomendação**: existe um endereço de testes (UAT) que recebe a pergunta e devolve
  as respostas parciais em fluxo contínuo; o endereço de produção ainda não existe e será
  configurável por ambiente. Detalhes do contrato estão em `.mine/chat-bot-page/plan.md` e serão
  formalizados no plano técnico.
- **Monitoramento**: todo monitoramento é feito no serviço; a interface não coleta nem exibe logs.
- **Fora do escopo**: modo escuro; histórico de conversas (nada persiste após recarregar); envio de
  anexos, áudio ou imagens; edição/remoção de mensagens; avaliação de respostas; formatação rica
  (links clicáveis, negrito) nas respostas.
- **Componentes visuais**: a biblioteca oficial de componentes e os tokens de tema já existentes no
  projeto serão reutilizados (ver constitution, Princípio V).
