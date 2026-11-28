# Contract delta: `POST {API_BASE_URL}/{clientId}/business`

Substitui somente a seção "Corpo" de
[`specs/007-business-registration/contracts/business-registration-api.md`](../../007-business-registration/contracts/business-registration-api.md).
URL, cabeçalhos, timeout e mapeamento de respostas não mudam.

## Corpo (`RegisterBusinessRequestDto`)

```json
{
  "name": "pet_amigo",
  "descricao": "pet shop e cuidados para animais",
  "email": "atendimento@petamigo.com.br",
  "address": "avenida das acacias - 310",
  "telephone": "35995678902",
  "detalhes": "O Pet Amigo oferece banho e tosa, produtos para cães e gatos, ..."
}
```

- Todos os textos com `trim`.
- Opcionais vazios (`descricao`, `email`, `telephone`) → `null`.
- `telephone` somente com dígitos.
- Chaves `descricao` e `detalhes` em português; `description` e `details` **não** são enviadas.

## Testes

- `toRegisterBusinessRequestDto`: `description` → `descricao`, `details` → `detalhes`; o
  resultado não tem as chaves `description` nem `details`.
- `registerBusiness` (`HttpTestingController`): corpo do `POST` igual ao exemplo acima.
- Store e página: corpo enviado contém `descricao` (valor ou `null`).
