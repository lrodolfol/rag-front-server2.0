# Contract: Sessão do cliente (`AuthSessionService`)

**Feature**: [../spec.md](../spec.md) | Decisão: [research R-03](../research.md)

Serviço `core/auth/auth-session.service.ts`, `providedIn: 'root'`. Ponto único de acesso à sessão;
a feature de dashboard (guard e interceptor de `Authorization`) consumirá esta API.

## API

```ts
interface AuthSession {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresAt: string; // ISO 8601
  readonly clientId: number;
}

class AuthSessionService {
  save(session: AuthSession): void;
  read(): AuthSession | null; // null se ausente, inválida ou expirada
  clear(): void;
}
```

## Garantias

| # | Garantia | Requisito |
|---|----------|-----------|
| 1 | Persistência apenas em `sessionStorage`, chave `achalocal.auth-session`; nunca `localStorage`, cookie, URL | FR-015, FR-021 |
| 2 | `save` sobrescreve qualquer sessão anterior | Edge case "novo login" |
| 3 | `read` devolve `null` (e limpa) quando `expiresAt <= Date.now()`, JSON inválido ou campo faltando | FR-015 |
| 4 | Falhas do storage (indisponível, cota, modo privado) são engolidas; a sessão continua em memória pela vida da aba | FR-022 |
| 5 | Nenhum método escreve no console nem expõe o token fora do valor de retorno | FR-021, FR-022 |

## Testes (`auth-session.service.spec.ts`)

Salvar/ler; sobrescrever; expirada → `null` e removida; JSON corrompido → `null`; storage lançando
exceção → funciona só em memória sem erro; `clear` remove memória e storage; nada em `localStorage`.
