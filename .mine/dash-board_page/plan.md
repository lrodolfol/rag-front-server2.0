# Componente de dashboard


## Decisões de design
- Matenha o design visual do projeto
- baseie-se em `@dash/.excalidraw` quando o cliente nao tiver negocio cadastrado
- baseie-se em `@dash02/.excalidraw` quando o cliente tiver negocio cadastrado


## Decisões de arquitetura
1:1 - ou seja, um cliente pode ter 1 e somente 1 negócio

Ao carregar a tela, o front deve fazer uma requisição GET para a API para buscar o negócio do cliente. Exemplo:
GET
http://localhost:5170/api/v1/{client-id}/business
Authorization: Bearer <jwt>

```json
 200 OK
 {
   "statusCode": 200,
   "success": true,
   "message": "Negócio encontrado com sucesso.",
   "data": {
     "name": "Padaria Pão Quente",
     "description": "Padaria artesanal com pães de fermentação natural.",
     "email": "contato@paoquente.com.br",
     "telephone": "(11) 98765-4321",
     "address": "Rua das Flores, 123 - Centro, São Paulo - SP",
     "details": "Aberto de seg. a sáb., 6h às 20h.",
     "createdAt": "2026-11-01T14:32:10+00:00",
     "updatedAt": "2026-11-20T09:15:44+00:00"
   },
   "error": null
 }
```
