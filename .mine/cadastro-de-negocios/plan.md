# Plano para nova tela de cadastro de negócios


## Decisões de design
- Siga o exemplo de design em `@./cadastro-page.excalidraw`
- O botão de cadastro deve ser fixo e não sair da tela principal mesmo com a barra de rolagem


## Comunicação com API backend

- Endereço da API local: http://localhost:5170/api/v1/1/business (reutilize o path principal):
- Endereço da API produção: http://{endereço}/api/v1/1/business (ainda não há endereço de produção) (reutilize o path principal):
- Payload de exemplo para ser enviado ao backend:
```json
{
    "name": "pet_amigo",
    "description": "pet shop e cuidados para animais",
    "email": "atendimento@petamigo.com.br",
    "address": "avenida das acacias - 310",
    "telephone": "35 9 95678901",
    "detalhes": "O Pet Amigo oferece banho e tosa, produtos para cães e gatos, rações, brinquedos, acessórios e itens de higiene animal. Também realizamos agendamentos para cuidados estéticos e orientamos os clientes sobre os produtos disponíveis. Atendimento via WhatsApp."
}
```


## Mapeamento dos campos
| campo no frontend | campo do payload para backend | obrigatorio |
| --- | --- | --- |
| Nome do negócio | name | sim |
| Descrição rápida | description | não |
| Descrição completa | detalhes | sim |
| Endereço completo | address | sim |
| email | email | não |
| Telefone | telephone | não |

