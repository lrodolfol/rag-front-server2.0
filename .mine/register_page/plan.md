# Componente de registro de cliente


## Decisões de design
- Tela simples e direto ao foco
- Quando o cliente clicar em registar, bloqueie todos os campos e deixe um loader ao lado do botao de cadastro
- Matenha o design visual do projeto
- Veja design de exemplo em `@./register-page.excalidraw`

Mensagens de sucesso:
- Exiba uma mensagem de 'cadastro realizado!' na tela sem poluir a tela. (use cores de sucesso)

Mensagens de erro:
- Exiba uma mensagem com o erro do backend na tela sem poluir a tela. (use cores de erro)


## Decisões de arquitetura

### Comunicação com backend

Mensagem do cliente que será enviado ao backend
```json
{
  "Name": "Rodolfo de jesus silva",
  "Email": "rodolfo0ti@gmail.com",
  "Password": "#Sojesussalva1"
}
```
Mensagem de resposta do backend quando for sucesso
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail",
  "data": {
    "clientId": 2,
    "accessCode": "sE1CMP8iqfYV",
    "name": "Rodolfo de jesus silva",
    "email": "rodolfo0ti@gmail1.com",
    "createdAt": "2026-11-22T19:27:48.2031803+00:00"
  },
  "error": null
}
```
Mensagem de resposta do backend quando for erro
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Já existe uma conta cadastrada com este e-mail.",
  "data": null,
  "error": {
    "title": "Conflito",
    "status": 409,
    "detail": "Já existe uma conta cadastrada com este e-mail.",
    "instance": "/api/v1/auth/register",
    "correlationId": "14a5a141-061f-4d10-a0bf-3fb0ee60dc8d"
  }
}
```
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Um ou mais campos são inválidos.",
  "data": null,
  "error": {
    "title": "Um ou mais campos são inválidos.",
    "status": 400,
    "instance": "/api/v1/auth/register",
    "errors": {
      "password": [
        "Informe a senha."
      ]
    },
    "correlationId": "72e74af4-de35-4248-9c8e-f3fca71ae9f1"
  }
}
```


#### Dados do backend
- PROD: deixe qualquer coisa, ainda nao possui
- UAT: http://localhost:5170/api/v1/auth/register
- Method: POST

> Esse endereço esta exposto e aberto atualmente para testes. 


### Monitoramento
- Não mostre logs no console do navegador nem na tela para o usuário. Todo monitoramento estará no backend
