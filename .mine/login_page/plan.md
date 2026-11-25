# Componente de registro de cliente


## Decisões de design
- Quando o cliente clicar em 'entrar', bloqueie todos os campos e deixe um loader ao lado do botao de cadastro
- Matenha o design visual do projeto
- baseie-se em `@./register-page/register-page.excalidraw`

> Em caso de login com sucesso: Não necessidade de exeibir mensagem de sucesso, redirecione o usuário para '/dashboard' (essa página será feita mais tarde)

> Em caso de falha no login: Exiba uma mensagem com o erro do backend na tela sem poluir a tela. (use cores de erro)


## Decisões de arquitetura

### Comunicação com backend

Mensagem do cliente que será enviado ao backend
```json
{
  "Email": "rodolfo0ti@gmail.com",
  "password": "NovaSenha123"
}
```
Mensagem de resposta do backend quando for sucesso (atenção no token que deve ser guardado para futuras requisições)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJyYWctYXBpIiwiaXNzIjoicmFnLWF1dGgiLCJleHAiOjE3OTUzODA5NDcsImlhdCI6MTc5NTM3NzM0NywibmJmIjoxNzk1Mzc3MzQ3LCJzdWIiOiJqNmZwN0dJMzZnM1EiLCJjbGllbnRfaWQiOjEsImp0aSI6Ijc0ODk4ODM3LTdmYzktNDNhYS04NDFiLTFlZGVmNGM1OTQ0NyJ9.nwkTf81imTsoNWFxZKvVTTuWBm7rZpoRuKYCF2Tx6Ls",
    "tokenType": "Bearer",
    "expiresAt": "2026-11-22T20:55:47+00:00",
    "clientId": 1,
    "accessCode": "j6fp7GI36g3Q",
    "business": null
  },
  "error": null
}
```
Mensagem de resposta do backend quando for erro
```json
{
  "statusCode": 401,
  "success": false,
  "message": "E-mail ou senha inválidos.",
  "data": null,
  "error": {
    "title": "Não autenticado",
    "status": 401,
    "detail": "E-mail ou senha inválidos.",
    "instance": "/api/v1/auth/login",
    "correlationId": "17ac564e-772e-42c7-8b99-81c95b5122d9"
  }
}
```
```json
{
  "statusCode": 403,
  "success": false,
  "message": "O e-mail ainda não foi confirmado. Confirme seu e-mail pelo link enviado ou solicite um novo link para acessar a aplicação.",
  "data": null,
  "error": {
    "title": "Acesso negado",
    "status": 403,
    "detail": "O e-mail ainda não foi confirmado. Confirme seu e-mail pelo link enviado ou solicite um novo link para acessar a aplicação.",
    "instance": "/api/v1/auth/login",
    "correlationId": "33a1315c-002e-4e98-b7c8-348f5c540fe7"
  }
}
```


#### Dados do backend
- PROD: deixe qualquer coisa, ainda nao possui
- UAT: http://localhost:5170/api/v1/auth/login
- Method: POST

> Esse endereço esta exposto e aberto atualmente para testes.


### Monitoramento
- Não mostre logs no console do navegador nem na tela para o usuário. Todo monitoramento estará no backend
