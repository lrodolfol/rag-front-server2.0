# Feature Specification: Fundação Visual da Aplicação (Tema e Tokens de Cor)

**Feature Branch**: `feat/install-specify`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Configurar a fundação visual da aplicação usando Angular Material como biblioteca oficial de componentes, garantindo que toda tela futura use automaticamente a identidade visual do produto (paleta verde #00A35C / off-white #FCFAF1 / verde claro #E8F3EA, cores de status, tipografia padronizada, responsividade e contraste WCAG AA), sem que desenvolvedores precisem definir cores manualmente." (fonte: `.mine/create-project/specify.md`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Componentes padrão já nascem com a identidade da marca (Priority: P1)

Como desenvolvedor de uma tela nova, eu adiciono componentes padrão da biblioteca oficial (botões,
campos de formulário, cards, diálogos, snackbars e barras de progresso) sem escrever nenhum estilo
de cor, e eles já aparecem com as cores da marca. Como usuário final, vejo uma aplicação visualmente
consistente em qualquer tela.

**Why this priority**: É o objetivo central da feature: eliminar estilização manual de cores e
garantir consistência visual desde a primeira tela de negócio.

**Independent Test**: Criar uma página de demonstração contendo cada tipo de componente listado,
sem nenhuma regra de estilo própria, e verificar visualmente e por inspeção que as cores exibidas
são as da paleta oficial.

**Acceptance Scenarios**:

1. **Given** uma tela sem estilos próprios, **When** um botão de ação principal é exibido, **Then** ele usa a cor primária verde da marca.
2. **Given** uma tela sem estilos próprios, **When** a página é carregada, **Then** o fundo da aplicação e de superfícies (cards, diálogos) usa o off-white da marca.
3. **Given** um campo de formulário sem estilos próprios, **When** o usuário foca o campo, **Then** o contorno/indicador de foco usa a cor primária da marca e o rótulo usa a cor de texto escura padrão (FR-009).
4. **Given** um campo de formulário com erro de validação, **When** o erro é exibido, **Then** a mensagem, a borda e o rótulo usam o vermelho escuro de erro `#991B1B`, sem o vermelho padrão da biblioteca.
5. **Given** uma barra de progresso sem estilos próprios, **When** ela é exibida, **Then** o indicador usa a cor primária e o trilho usa o tom de destaque (verde claro).
6. **Given** um diálogo ou snackbar aberto, **When** ele é exibido, **Then** suas cores seguem a paleta oficial, sem cores herdadas do tema padrão da biblioteca.

---

### User Story 2 - Tokens centralizados para componentes próprios (Priority: P2)

Como desenvolvedor criando um componente visual próprio (que não existe na biblioteca oficial), eu
referencio as cores da marca e de status por nomes semânticos centralizados (ex.: "primária",
"superfície", "destaque", "erro-fundo"), sem escrever valores hexadecimais.

**Why this priority**: Garante que a consistência se estenda a componentes próprios e que uma
eventual mudança de paleta seja feita em um único lugar.

**Independent Test**: Criar um componente de exemplo que usa apenas os tokens nomeados; alterar o
valor de um token na fonte central e verificar que o componente reflete a mudança sem edição local.

**Acceptance Scenarios**:

1. **Given** os tokens centralizados disponíveis, **When** um componente próprio usa o token de cor primária, **Then** ele exibe exatamente a mesma cor primária dos componentes da biblioteca.
2. **Given** o valor de um token alterado na fonte central, **When** a aplicação é recarregada, **Then** todos os componentes que usam aquele token refletem o novo valor.
3. **Given** a base de código de componentes, **When** uma verificação automática procura valores hexadecimais em estilos de componentes, **Then** nenhuma ocorrência é encontrada.

---

### User Story 3 - Mensagens de status com cores semânticas acessíveis (Priority: P2)

Como usuário final, ao receber um feedback de erro, sucesso, informação ou alerta, eu reconheço
imediatamente o tipo da mensagem pela cor e consigo ler o texto com conforto.

**Why this priority**: Feedback claro é essencial para usabilidade e acessibilidade; as cores de
status serão reutilizadas por todas as telas de negócio.

**Independent Test**: Disparar na página de demonstração um snackbar de cada tipo (erro, sucesso,
info, alerta) e medir o contraste entre texto e fundo.

**Acceptance Scenarios**:

1. **Given** um snackbar de erro, **When** exibido, **Then** usa fundo `#FEE2E2` e texto `#991B1B`.
2. **Given** um snackbar de sucesso, **When** exibido, **Then** usa fundo `#DCFCE7` e texto `#166534`.
3. **Given** um snackbar informativo, **When** exibido, **Then** usa fundo `#DBEAFE` e texto `#1D4ED8`.
4. **Given** um snackbar de alerta, **When** exibido, **Then** usa fundo `#FEF3C7` e texto `#92400E`.
5. **Given** um desenvolvedor exibindo um snackbar, **When** ele indica apenas o tipo (erro, sucesso, info ou alerta), **Then** as cores corretas são aplicadas sem estilização própria.

---

### User Story 4 - Tipografia padronizada e aparência responsiva (Priority: P3)

Como usuário final, acesso a aplicação no desktop, tablet ou smartphone e encontro a mesma família
tipográfica, hierarquia de títulos/textos consistente e componentes legíveis e utilizáveis em
qualquer largura de tela.

**Why this priority**: Complementa a identidade visual; depende da base de cores, mas é necessária
antes das telas de negócio.

**Independent Test**: Abrir a página de demonstração em larguras de 360px, 768px e 1280px e
verificar que a tipografia é a mesma, sem rolagem horizontal e com componentes utilizáveis.

**Acceptance Scenarios**:

1. **Given** qualquer tela, **When** textos são exibidos (títulos, corpo, rótulos, botões), **Then** todos usam a família tipográfica oficial (Roboto) e a escala tipográfica padronizada.
2. **Given** um smartphone (largura ≥ 360px), **When** a página de demonstração é aberta, **Then** não há rolagem horizontal e todos os componentes são legíveis e acionáveis.
3. **Given** a fonte oficial indisponível (falha de rede), **When** a página carrega, **Then** o texto é exibido com uma fonte de fallback legível, sem texto invisível.

---

### Edge Cases

- **Texto sobre a cor primária**: texto branco sobre `#00A35C` tem contraste 3,28:1 — atende WCAG AA somente como texto grande (≥ 24px, ou ≥ 18,66px em negrito). Por isso, todo texto branco sobre a primária (ex.: rótulos de botão preenchido) MUST ser texto grande. Ver FR-009.
- **Primária usada como cor de texto**: `#00A35C` sobre `#FCFAF1` tem 3,14:1 — permitido apenas em texto grande. Sobre `#E8F3EA` tem 2,88:1 e MUST NOT ser usada como cor de texto nesse fundo. Ver FR-009.
- **Botões compactos/densos**: um botão preenchido com a primária não pode ter rótulo menor que o limite de texto grande; quando o espaço não comportar, deve-se usar uma variante de botão sem preenchimento primário.
- **Cores de status originais**: info `#2563EB` (4,24:1) e alerta `#D97706` (2,86:1, tom próximo do laranja proibido) foram substituídas por `#1D4ED8` e `#92400E`. Ver FR-010.
- **Estados desabilitado, hover e foco**: componentes nesses estados MUST continuar derivados da paleta (sem cores padrão de fábrica da biblioteca); estados desabilitados são isentos de contraste pela WCAG, mas devem permanecer distinguíveis.
- **Cores proibidas por herança**: o tema padrão da biblioteca não pode vazar cores proibidas (ex.: roxo/rosa padrões) em nenhum componente ou estado.
- **Preferência de modo escuro do sistema**: a aplicação permanece no tema claro mesmo que o sistema operacional esteja em modo escuro (modo escuro fora do escopo).
- **Cor adicional necessária**: quando uma tela precisar de uma cor fora da paleta (permitido pela descrição), ela deve ser adicionada como token central, nunca como valor local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST aplicar a identidade visual a todos os componentes padrão da biblioteca oficial (botões, campos de formulário, cards, diálogos, snackbars, barras de progresso) sem estilização individual nos componentes.
- **FR-002**: O sistema MUST usar `#00A35C` como cor primária da marca, `#FCFAF1` como cor de fundo/superfície e `#E8F3EA` como cor de detalhes/destaques.
- **FR-003**: O sistema MUST disponibilizar todas as cores (marca, status e quaisquer cores complementares) como tokens nomeados semanticamente em uma única fonte central.
- **FR-004**: Componentes MUST NOT definir cores por valor hexadecimal próprio; toda cor MUST vir do tema ou dos tokens centrais.
- **FR-005**: O sistema MUST disponibilizar tokens de status em pares fundo/texto: erro (`#FEE2E2` / `#991B1B`), sucesso (`#DCFCE7` / `#166534`), info (`#DBEAFE` / `#1D4ED8`) e alerta (`#FEF3C7` / `#92400E`).
- **FR-005a**: O sistema MUST oferecer variantes de snackbar para os tipos erro, sucesso, info e alerta, que aplicam automaticamente os pares de cor de FR-005 (incluindo o botão de ação do snackbar, com contraste AA). Um componente próprio de aviso fixo na página (caixa de alerta inline) está fora do escopo desta feature.
- **FR-006**: O sistema MUST NOT usar as cores `#FF0000`, `#0000FF`, `#FF00FF`, `#800080`, `#FF1493`, `#FF8000`, `#FFFF00` nem variações próximas delas (tons saturados de vermelho puro, azul puro, magenta, roxo, rosa-choque, laranja puro e amarelo puro), incluindo cores herdadas do tema padrão da biblioteca.
- **FR-007**: Cores complementares fora da paleta principal MAY ser adicionadas para evitar uma visualização engessada, desde que registradas como tokens centrais, harmônicas com a paleta e em conformidade com FR-006 e FR-008.
- **FR-006a**: Campos de formulário em estado de erro de validação MUST usar a cor de texto de erro `#991B1B` (token erro-texto; 7,95:1 sobre `#FCFAF1`) para a mensagem de erro, a borda e o rótulo, substituindo a cor de erro padrão da biblioteca.
- **FR-008**: Todo par texto/fundo definido pelo tema e pelos tokens MUST atender WCAG 2.1 nível AA: contraste ≥ 4,5:1 para texto normal e ≥ 3:1 para texto grande e componentes de interface (bordas de campo, indicadores de foco).
- **FR-009**: A cor primária `#00A35C` MUST ser mantida sem tons alternativos para texto. Texto branco sobre a primária (ex.: rótulos de botões preenchidos) e a primária usada como cor de texto sobre o off-white MUST ocorrer somente em texto grande (≥ 24px regular ou ≥ 18,66px em negrito), garantindo o mínimo AA de 3:1. Em tamanhos normais, a primária MUST NOT ser usada como cor de texto; links e textos de ação em tamanho normal MUST usar a cor de texto padrão escura com sublinhado ou outro indicador não cromático. Isso inclui rótulos de botões de texto e contornados e o rótulo de campos de formulário em foco.
- **FR-010**: As cores de texto de info e alerta MUST ser `#1D4ED8` (5,49:1 sobre `#DBEAFE`) e `#92400E` (6,37:1 sobre `#FEF3C7`), substituindo `#2563EB` e `#D97706`, que não atingem AA.
- **FR-011**: O sistema MUST padronizar a tipografia em toda a aplicação com uma única família tipográfica principal e uma escala tipográfica (títulos, subtítulos, corpo, rótulos, botões) aplicada automaticamente aos componentes. A família principal MUST ser Roboto, distribuída junto com a própria aplicação (sem requisição a serviços de fontes externos) e contendo apenas os pesos utilizados pela escala tipográfica.
- **FR-012**: O sistema MUST definir uma fonte de fallback legível (fontes sem serifa do sistema), de modo que o texto seja exibido mesmo se a fonte principal não carregar.
- **FR-013**: A aparência MUST funcionar em desktop (≥ 1280px), tablet (768px–1279px) e smartphone (360px–767px), sem rolagem horizontal e com áreas de toque de no mínimo 44×44px em componentes interativos.
- **FR-014**: Estados de interação (hover, foco, ativo, desabilitado) dos componentes MUST ser derivados da paleta oficial, e o indicador de foco MUST ser visível com contraste ≥ 3:1.
- **FR-015**: A aplicação MUST permanecer no tema claro independentemente da preferência de modo escuro do sistema operacional.
- **FR-016**: O sistema MUST incluir uma página/tela de demonstração interna (não de negócio) que exibe todos os componentes listados em FR-001 e um snackbar de cada variante de FR-005a, usada para validar os critérios de aceite. A página MUST estar disponível apenas no ambiente de desenvolvimento (execução local) e MUST NOT estar acessível na versão publicada (produção).

### Key Entities

- **Token de cor**: valor de cor nomeado semanticamente (ex.: primária, superfície, destaque, erro-fundo, erro-texto). Atributos: nome, valor, papel (marca, status, complementar) e par de contraste associado, quando aplicável.
- **Tema visual**: conjunto de tokens de cor e tipografia aplicado globalmente aos componentes da biblioteca oficial.
- **Escala tipográfica**: níveis de texto (título, subtítulo, corpo, rótulo, botão) com família, tamanho, peso e altura de linha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos tipos de componente listados em FR-001 exibem as cores da marca na página de demonstração sem nenhuma regra de estilo própria.
- **SC-002**: 0 ocorrências de valores hexadecimais de cor em estilos de componentes (excetuando a fonte central de tokens/tema), verificável por busca automática.
- **SC-003**: 100% dos pares texto/fundo definidos no tema e nos tokens atingem contraste ≥ 4,5:1 (texto normal) ou ≥ 3:1 (texto grande/componentes de interface), medidos por ferramenta de contraste WCAG.
- **SC-004**: A alteração de uma cor da marca exige edição em exatamente 1 local e se reflete em 100% dos componentes que a utilizam.
- **SC-005**: A página de demonstração é exibida sem rolagem horizontal e com todos os componentes acionáveis nas larguras de 360px, 768px e 1280px.
- **SC-006**: 0 ocorrências das cores proibidas (FR-006) em qualquer componente ou estado da página de demonstração.
- **SC-007**: 100% dos textos da página de demonstração usam a família tipográfica oficial (ou o fallback definido quando ela não carrega).
- **SC-008**: Na versão publicada (produção), o endereço da página de demonstração não exibe a página (0 componentes de demonstração acessíveis).
- **SC-009**: Ao carregar a aplicação, 0 requisições são feitas a serviços externos de fontes.

## Clarifications

### Session 2026-11-15

- Q: Como garantir AA com a primária `#00A35C` e texto? → A: Manter `#00A35C`; texto branco sobre ela e a primária como cor de texto apenas em texto grande (≥ 24px ou ≥ 18,66px negrito).
- Q: Ajustar os textos de info e alerta? → A: Sim — info `#1D4ED8`, alerta `#92400E`; fundos mantidos.
- Q: Qual família tipográfica? → A: Roboto.
- Q: Como as mensagens de erro, sucesso, informação e alerta devem aparecer na tela? → A: Tokens de status + variantes de snackbar (erro, sucesso, info, alerta); sem componente próprio de aviso fixo nesta feature.
- Q: Quem deve conseguir abrir a página de demonstração e em qual ambiente? → A: Só em desenvolvimento (execução local); excluída da versão publicada.
- Q: Qual cor usar em campos de formulário com erro de validação? → A: `#991B1B` (texto de erro) para mensagem, borda e rótulo do campo.
- Q: A Roboto deve vir de serviço externo ou ser distribuída com a aplicação? → A: Distribuída com a aplicação (auto-hospedada), apenas com os pesos usados.
- Q: (via `/speckit-analyze`, I1) No campo em foco, o rótulo usa a primária (US1-3) ou a cor escura (FR-009)? → A: Contorno/indicador de foco na primária (componente de interface, 3,14:1 ≥ 3:1); rótulo em foco na cor de texto escura padrão, pois é texto de tamanho normal.
- Q: (via `/speckit-analyze`, C1) Rótulos de botões de texto e contornados podem usar a primária? → A: Não; em tamanho normal usam a cor de texto escura padrão (FR-009).

## Assumptions

- Angular Material (e CDK) é a biblioteca oficial de componentes, conforme a constitution (Princípio V); sua instalação faz parte desta feature, pois ainda não consta nas dependências do projeto.
- Os tokens centrais serão expostos como propriedades customizadas de CSS, conforme exige a constitution; estilos globais se limitam ao tema, aos tokens e a resets mínimos.
- A cor de texto padrão sobre o fundo off-white será um tom escuro quase preto (contraste > 15:1), derivado do tema e registrado como token.
- A página de demonstração (FR-016) é uma ferramenta de validação interna, não uma tela de negócio, disponível apenas em desenvolvimento.
- Cores de status seguem os pares informados pelo usuário, exceto os textos de info e alerta, ajustados para atingir AA (FR-010).
- Como a primária só pode receber texto branco em tamanho grande (FR-009), os rótulos de botões preenchidos com a primária serão maiores/mais pesados que o padrão da biblioteca; links de tamanho normal usam a cor de texto escura com sublinhado.
- Fora do escopo: telas de negócio, layout/menu de navegação, autenticação, modo escuro e componente próprio de aviso fixo na página (inline).
- Todo texto visível ao usuário na página de demonstração estará em português (Princípio V).
