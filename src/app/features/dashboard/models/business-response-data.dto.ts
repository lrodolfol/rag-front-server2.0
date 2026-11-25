/**
 * `data` da resposta de `GET {API_BASE_URL}/{clientId}/business` (contracts/business-api.md).
 * Tipado completo para documentar o contrato; nesta feature só `name` é lido.
 */
export interface BusinessResponseDataDto {
  /** Obrigatório para considerar a resposta válida. */
  readonly name: string;
  readonly description: string;
  readonly email: string;
  readonly telephone: string;
  readonly address: string;
  readonly details: string;
  /** ISO 8601. */
  readonly createdAt: string;
  /** ISO 8601. */
  readonly updatedAt: string;
}
