<!--
Sync Impact Report
- Version change: template (não ratificado) → 1.0.0
- Modified principles: n/a (ratificação inicial)
- Added principles:
  - I. Angular Moderno e TypeScript Estrito
  - II. Responsabilidade Única e Arquitetura por Feature
  - III. Comunicação HTTP Tipada
  - IV. Segurança e Controle de Acesso (NÃO NEGOCIÁVEL)
  - V. Experiência do Usuário e Identidade Visual
  - VI. Testes como Requisito de Qualidade
  - VII. Simplicidade e Dependências Mínimas
- Added sections: Stack e Restrições Técnicas; Desenvolvimento Orientado a Especificações;
  Governance
- Removed sections: nenhuma
- Templates: nenhum template alterado (leem a constitution em tempo de execução)
- Follow-up TODOs: nenhum placeholder adiado.
  Observação: Angular Material ainda não consta em package.json (instalação = feature futura).
-->

# RAG Front Constitution

## Core Principles

### I. Angular Moderno e TypeScript Estrito

- O projeto MUST usar a versão estável mais recente do Angular compatível (atualmente v22.x).
- TypeScript MUST operar com `strict: true`. O uso de `any` é proibido; usar tipagem explícita e
  interfaces bem definidas.
- Todo novo desenvolvimento MUST usar componentes Standalone. NgModules MUST NOT ser criados.
- A comunicação entre componentes MUST usar `input()`/`output()` (preferencial) ou
  `@Input()`/`@Output()`.
- Estado local e reatividade SHOULD usar Signals (`signal`, `computed`, `effect`).
- RxJS MUST ser usado para fluxos assíncronos, eventos ou operações complexas.
- Componentes SHOULD NOT chamar `subscribe()` diretamente; preferir `async` pipe, Signals
  (ex.: `toSignal`) e mecanismos de ciclo de vida (ex.: `takeUntilDestroyed`).

**Racional**: APIs modernas do Angular e tipagem estrita reduzem erros em tempo de execução,
vazamentos de memória e código legado.

### II. Responsabilidade Única e Arquitetura por Feature

- Cada componente, serviço e classe MUST ter uma única responsabilidade.
- Componentes MUST cuidar apenas de apresentação e interação com o usuário. Regras de negócio MUST
  residir em serviços ou classes específicas, nunca nos componentes.
- Componentes, serviços, models, interfaces, guards, interceptors e mappers MUST ficar em arquivos
  separados e claramente identificáveis.
- O código MUST ser organizado por domínio/funcionalidade (Feature-Based Architecture), não apenas
  por tipo de arquivo.
- Componentes MUST ser pequenos; ao crescerem demais, MUST ser divididos em componentes menores.
- Métodos e funções SHOULD ter no máximo 20 linhas; acima disso, avaliar a divisão.
- Templates MUST NOT conter lógica complexa; expressões devem ser simples (usar `computed` ou
  métodos do componente/serviço).
- Nomes de classes, métodos, propriedades e variáveis MUST estar em inglês e ser autoexplicativos,
  sem abreviações.

**Racional**: separação clara facilita testes, manutenção e evolução independente das features.

### III. Comunicação HTTP Tipada

- Componentes MUST NOT realizar chamadas HTTP. Toda comunicação com APIs MUST passar por serviços
  específicos.
- Dados enviados e recebidos MUST ser tipados com DTOs/interfaces. Objetos sem tipagem são
  proibidos.
- Quando o modelo da API diferir do modelo de apresentação, MUST existir um mapper entre eles; os
  dois modelos MUST NOT ser misturados.
- Preocupações transversais de HTTP (autenticação, inclusão de tokens, tratamento global de erros)
  MUST ser implementadas via Interceptors.

**Racional**: contratos tipados e isolados protegem a UI de mudanças na API e centralizam o
tratamento de falhas.

### IV. Segurança e Controle de Acesso (NÃO NEGOCIÁVEL)

- Toda rota autenticada MUST ser protegida por Route Guard.
- Guards MUST ser usados para controlar acesso a rotas e funcionalidades.
- Tokens, credenciais e informações sensíveis MUST NOT ser armazenados em locais inseguros
  (ex.: `localStorage`, código-fonte, query strings, logs).
- Manipulação direta do DOM MUST NOT ser usada; usar os mecanismos nativos do Angular (bindings,
  diretivas, Renderer quando estritamente necessário).

**Racional**: falhas de controle de acesso e vazamento de credenciais têm impacto direto no
negócio e não admitem exceção.

### V. Experiência do Usuário e Identidade Visual

- Todo texto exibido ao usuário — incluindo mensagens de erro, validação e feedback — MUST estar em
  português.
- Toda interface MUST funcionar adequadamente em desktop, tablet e smartphone.
- Toda tela que carrega dados MUST tratar os estados de carregamento, sucesso, erro e ausência de
  dados.
- Formulários complexos MUST usar Reactive Forms, com validações definidas e mensagens amigáveis.
- **Angular Material é a biblioteca oficial de componentes visuais.** Seus componentes MUST ser
  usados antes de criar equivalentes próprios. Nenhuma outra biblioteca de UI pode ser adotada sem
  emenda a esta constitution.
- Paleta padrão:
  - Primária: `#00A35C` (verde)
  - Fundo/superfície: `#FCFAF1` (off-white)
  - Detalhes/destaques: `#E8F3EA` (verde claro)
- Cores MUST ser aplicadas por meio do tema do Angular Material e de tokens centralizados (CSS
  custom properties). Valores hexadecimais MUST NOT ser espalhados nos estilos dos componentes.
- Estilos MUST usar CSS/SCSS com escopo por componente. Estilos globais MUST se limitar ao tema e
  aos tokens (exceção justificada) e a resets mínimos.

**Racional**: uma biblioteca de UI única e uma paleta centralizada garantem consistência visual,
acessibilidade e menor custo de manutenção.

### VI. Testes como Requisito de Qualidade

- Toda regra de negócio MUST possuir testes unitários.
- Componentes MUST possuir testes para seus principais comportamentos e interações.
- Serviços de comunicação HTTP MUST possuir testes unitários com `HttpTestingController`.
- Fluxos críticos da aplicação MUST possuir testes de integração ou end-to-end.
- A cobertura de testes unitários das regras de negócio SHOULD ser de pelo menos 70%. Testes
  artificiais criados apenas para atingir métricas MUST NOT ser escritos.

**Racional**: testes significativos permitem evoluir o código com segurança e validam os
critérios de aceite das especificações.

### VII. Simplicidade e Dependências Mínimas

- **Nenhuma nova dependência MUST ser adicionada sem justificativa** documentada no plano de
  implementação.
- Abstrações, bibliotecas, componentes genéricos ou serviços compartilhados MUST ser criados
  somente quando houver necessidade real e a complexidade adicional se justificar (YAGNI).
- Duplicação de código SHOULD ser evitada; a extração para código compartilhado ocorre somente
  quando o compartilhamento é real.

**Racional**: menos dependências e abstrações reduzem superfície de ataque, custo de atualização e
complexidade cognitiva.

## Stack e Restrições Técnicas

- Framework: Angular 22.x (Standalone, Signals, novo control flow).
- Biblioteca de UI: Angular Material (+ Angular CDK) — oficial e exclusiva.
- Linguagem: TypeScript ~6.x com `strict: true`.
- Reatividade assíncrona: RxJS 7.x.
- Testes: Vitest + jsdom (unitários/componentes); ferramenta E2E a definir em especificação própria
  com justificativa (Princípio VII).
- Formatação: Prettier.
- Guias de referência:
  - https://angular.dev/style-guide
  - https://angular.dev/guide/signals
  - https://angular.dev/guide/templates
  - https://angular.dev/guide/components
  - https://angular.dev/guide/di

## Desenvolvimento Orientado a Especificações

- Toda nova funcionalidade MUST possuir uma especificação antes do início da implementação.
- A especificação MUST descrever objetivo, comportamento esperado, regras de negócio, requisitos
  funcionais e critérios de aceite.
- O plano de implementação MUST respeitar integralmente esta constitution.
- Antes de implementar, a arquitetura existente MUST ser analisada para identificar componentes,
  serviços e funcionalidades reutilizáveis.
- Funcionalidades não previstas na especificação ou desnecessárias para os requisitos MUST NOT ser
  implementadas.
- Decisões de negócio MUST NOT ser tomadas por conta própria; ambiguidades MUST ser esclarecidas
  (ex.: `/speckit-clarify`) antes da implementação.
- A implementação MUST seguir os padrões existentes no projeto; novas abordagens exigem
  justificativa.
- A documentação técnica MUST ser atualizada quando houver mudanças relevantes de arquitetura ou
  comportamento.

## Governance

- Esta constitution prevalece sobre quaisquer outras práticas do projeto.
- Se um plano de implementação contradisser esta constitution, quem muda é o plano.
- Se uma especificação contradisser esta constitution, a inconsistência MUST ser identificada e
  resolvida antes do desenvolvimento.
- Emendas MUST ser feitas via pull request, com Sync Impact Report e incremento de versão
  semântica:
  - MAJOR: remoção ou redefinição incompatível de princípios ou regras de governança.
  - MINOR: novo princípio/seção ou expansão material de orientação.
  - PATCH: esclarecimentos, redação e correções sem mudança semântica.
- Toda revisão de PR e todo plano (`/speckit-plan`, seção Constitution Check) MUST verificar a
  conformidade; `/speckit-analyze` SHOULD ser executado antes da implementação.
- Qualquer complexidade ou exceção MUST ser justificada explicitamente no plano de implementação.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15
