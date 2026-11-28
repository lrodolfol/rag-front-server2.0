/** Corpo de `POST {API_BASE_URL}/{clientId}/business` (contracts/business-registration-api.md). */
export interface RegisterBusinessRequestDto {
  readonly name: string;
  /** Chave em português, exatamente como no payload do backend (feature 008). */
  readonly descricao: string | null;
  readonly email: string | null;
  readonly address: string;
  readonly telephone: string | null;
  /** Chave em português, exatamente como no payload do backend (research R-02). */
  readonly detalhes: string;
}
