# Quickstart: validar o payload com `descricao`

## Pré-requisitos

- Dependências instaladas (`npm install`).
- Backend local em `http://localhost:5170/api/v1` (para a validação manual).
- Um cliente sem negócio cadastrado.

## 1. Testes automatizados

```bash
npm test
```

Esperado: todos passam, incluindo os cenários descritos em
[contracts/business-registration-api.md](./contracts/business-registration-api.md#testes).

## 2. Validação manual

1. `npm start` e entrar com um cliente sem negócio.
2. Em `/dashboard`, acionar "Novo negócio" (`/dashboard/new`).
3. Preencher com os valores do exemplo (telefone `(35) 99567-8902`) e acionar "Cadastrar negócio".
4. Nas DevTools (Network), abrir o `POST .../{clientId}/business` e conferir o corpo:
   - tem `descricao` com "pet shop e cuidados para animais";
   - não tem `description` nem `details`;
   - `telephone` = `35995678902`.
5. Esperado: redirecionamento para `/dashboard` com "Negócio cadastrado com sucesso.".

## 3. Descrição rápida vazia

Repetir com a Descrição rápida em branco (com outro cliente sem negócio). Esperado: `"descricao": null`
no corpo e cadastro concluído.
