# Projeto front-end com Angular v22.2.7 e TypeScript

## Princípios para fixar e usar em todo projeto

- Utilize a versão estável mais recente do Angular compatível com o projeto.
- Utilize TypeScript com `strict: true`, evitando o uso de `any`. Prefira tipagem explícita e interfaces bem definidas.
- Utilize componentes Standalone. Não utilize NgModules em novos desenvolvimentos.
- Mantenha o código segregado, cada componente, serviço e classe deve possuir uma única responsabilidade.
- Componentes devem ser responsáveis pela apresentação e interação com o usuário. Não devem conter regras de negócio complexas.
- Regras de negócio devem permanecer em serviços ou classes específicas, nunca diretamente nos componentes.
- Mantenha uma separação clara entre componentes, serviços, models, interfaces, guards, interceptors e demais responsabilidades.
- Organize os módulos funcionais por domínio ou funcionalidade (Feature-Based Architecture), evitando uma estrutura baseada exclusivamente no tipo de arquivo.
- Nomes de classes, métodos, propriedades e variáveis devem ser autoexplicativos. Não economize palavras.
- Utilize nomes em inglês para classes, métodos, propriedades e variáveis. Textos apresentados ao usuário devem estar em português.
- Mensagens de erro, validação e feedback para o usuário devem ser escritas em português.
- Componentes devem ser pequenos e possuir responsabilidades bem definidas. Quando um componente crescer excessivamente, divida-o em componentes menores e reutilizáveis.
- Prefira componentes reutilizáveis quando houver necessidade real de compartilhamento. Evite abstrações prematuras.
- Utilize `@Input()` e `@Output()` ou a API moderna de `input()` e `output()` para comunicação entre componentes.
- Prefira Angular Signals (`signal`, `computed` e `effect`) para gerenciamento de estado local e reatividade.
- Utilize RxJS quando houver necessidade de trabalhar com fluxos assíncronos, eventos ou operações complexas.
- Evite utilizar `subscribe()` diretamente nos componentes sempre que possível. Prefira `async pipe`, Signals e mecanismos de gerenciamento de ciclo de vida.
- Utilize serviços para centralizar comunicação com APIs HTTP e compartilhamento de funcionalidades.
- Componentes nunca devem realizar chamadas HTTP diretamente. Toda comunicação com APIs deve ser realizada por meio de serviços específicos.
- Utilize DTOs e interfaces para tipar os dados recebidos e enviados para APIs. **Evite utilizar objetos sem tipagem**.
- Nunca misture modelos de resposta da API com modelos específicos de apresentação quando houver diferenças entre eles. Utilize mapeadores quando necessário.
- Rotas autenticadas precisam passar por uma Route Guards
- Utilize Interceptors para funcionalidades transversais de HTTP, como autenticação, inclusão de tokens e tratamento global de erros.
- Utilize Guards para proteger rotas e controlar acesso a funcionalidades.
- **Não armazene tokens, credenciais ou informações sensíveis em locais inseguros**.
- Utilize Reactive Forms para formulários complexos, com validações bem definidas e mensagens de erro amigáveis.
- Evite duplicação de código. Extraia funcionalidades compartilhadas somente quando existir uma necessidade real.
- Priorize responsividade. Toda interface deve funcionar adequadamente em dispositivos desktop, tablets e smartphones.
- Utilize CSS/SCSS com escopo por componente. Evite estilos globais desnecessários.
- **Não utilize manipulação direta do DOM. Prefira os mecanismos nativos do Angular**.
- Trate estados de carregamento, sucesso, erro e ausência de dados nas interfaces.
- Evite lógica complexa diretamente nos templates. Mantenha expressões simples e legíveis.
- Métodos e funções devem ser pequenos e possuir uma única responsabilidade. Prefira métodos com no máximo 20 linhas; caso ultrapassem esse limite, avalie a possibilidade de dividi-los.
- Toda regra de negócio deve possuir testes unitários.
- Componentes devem possuir testes para seus principais comportamentos e interações.
- Serviços responsáveis por comunicação HTTP devem possuir testes unitários utilizando HttpTestingController.
- Fluxos críticos da aplicação devem possuir testes de integração ou testes end-to-end.
- Busque manter pelo menos 70% de cobertura de testes unitários nas regras de negócio. Não crie testes artificiais apenas para atingir métricas.
- **NENHUMA NOVA DEPENDÊNCIA DEVE SER ADICIONADA SEM JUSTIFICATIVA.**
- Antes de criar qualquer abstração, biblioteca, componente genérico ou serviço compartilhado, avalie se a complexidade adicional realmente se justifica.

## Desenvolvimento orientado a especificações (Specification-Driven Development)

- Toda nova funcionalidade deve possuir uma especificação antes de iniciar sua implementação.
- A especificação deve descrever claramente o objetivo, comportamento esperado, regras de negócio, requisitos funcionais e critérios de aceite.
- O plano de implementação deve respeitar integralmente os requisitos e princípios desta Constitution.
- Antes de implementar, analise a arquitetura existente e identifique os componentes, serviços e funcionalidades que podem ser reutilizados.
- Não implemente funcionalidades que não estejam previstas na especificação ou que não sejam necessárias para atender aos requisitos.
- Não tome decisões de negócio por conta própria. Quando houver ambiguidade na especificação, solicite esclarecimentos.
- A implementação deve respeitar os padrões existentes no projeto, evitando introduzir novas abordagens sem justificativa.
- Atualize a documentação técnica quando houver mudanças relevantes na arquitetura ou no comportamento da aplicação.

## Princípio fundamental

Se o plano de implementação contradisser qualquer princípio desta Constitution, quem muda é o plano.

Se uma especificação contradisser algum princípio desta Constitution, a inconsistência deve ser identificada e resolvida antes do desenvolvimento.

## Guia de melhores práticas
Se necessário, consulte os guias de melhores práticas:

https://angular.dev/style-guide
https://angular.dev/guide/signals
https://angular.dev/guide/templates
https://angular.dev/guide/components
https://angular.dev/guide/di
