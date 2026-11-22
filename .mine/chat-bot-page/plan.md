# Componente de chat online


## Decisões de design
- Tela inicial deve dar boas-vindas para o usuário
- Tela inicial deve sugerir ideias para o usuário
- Quando o cliente enviar 1 mensagem o botão e text-box para ele preencher outra mensagem deve ser desabilitado.
- Mostre cada resposta do backend em uma resposta (como se fosse um chat real)
- Aguarde todas respostas do backend para liberar o usuario digitar novamente.
- Matenha o design visual do projeto
- Veja design de exemplo em `@./tela-chat.excalidraw`

### Cores e estilos
- Cor do fundo da página: #FCFAF1
- Cor do fundo da tela flutuante de chat: #F3F2E9
- Cor do cabeçalho da tela flutuante de chat: #00A35C
- Cor do fundo de cada mensagem recebida ou enviada: #FFFFFF
- Cor do texto das mensagens: #07150E


## Decisões de arquitetura

### Comunicação com backend

Mensagem do cliente que será enviado ao backend
```json
{
  "message": "procuro restaurantes para comer com a familia", -- mensagem do cliente
  "user_code": "rodolfo1234", -- um valor aleatório unico gerado ao carregar a página e enviado toda vez que o usuário mandar mensagem
}
```
Mensagem de resposta do backend. Essas mensagens são recebidas em streaming a cada x segundos
```json
data: {"message": "Localizei certas respostas relacionadas à sua busca."}
data: {"message": "O Sabor da Roça oferece refeições caseiras e comida típica mineira. Fica na Rua das Flores, 120, e também atende pedidos para retirada e entrega."}
```


#### Dados do backend
- PROD: deixe qualquer coisa, ainda nao possui
- UAT: http://127.0.0.1:8000/chat
- Method: POST

> Esse endereço esta exposto e aberto atualmente para testes. Use o exemplo abaixo para testes:
```json
{
  "message": "procuro restaurantes para comer com a familia",
  "user_code": "rodolfo1234"
}
```

Exemplo mensagens de erro
```json
{
  "status_code": 429,
  "message": "Você atingiu o limite de mensagens no chat online. Experimente nosso serviço no whatsapp ou tente novamente mais tarde.",
  "errors": [
    "rate_limit_exceeded"
  ]
}
```
```json
{
  "status_code": 500,
  "message": "An unexpected error occurred.",
  "errors": [
    "internal_error"
  ]
}
```


#### Limite de mensagens
- Em algum momento, o backend retornará HttpCode 429(to many request), quando isso ocorrer, informe para o usuário a mensagem original da API
- Não faça requisições para o backend novamente se já houve respota 429. Evite reprocessamento desnecessário


## Tratamento de erros

- O backend pode retornar erros e seu código HTTP. A aplicação deve tratar esse erro e exibir a mensagem original (em linguagem natural) que veio do backend.
- Códigos, stackTrace, httpCode não devem ser enviadas para o usuário.
- **Não printe nenhuma mensagem no console do navegador**


## Monitoramento
- Não mostre logs no console do navegador nem na tela para o usuário. Todo monitoramento estará no backend
