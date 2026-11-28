/**
 * Negócio do cliente (contracts/business-api.md).
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

/** Cliente dono do negócio, devolvido junto em `GET {API_BASE_URL}/{clientId}/business`. Não é lido. */
export interface BusinessOwnerClientDto {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly emailConfirmed: boolean;
  /** ISO 8601. */
  readonly createdAt: string;
  /** ISO 8601. */
  readonly updatedAt: string;
}

/**
 * `data` da resposta de `GET {API_BASE_URL}/{clientId}/business`.
 * `business: null` (HTTP 200) significa que o cliente ainda não cadastrou negócio.
 */
export interface ClientBusinessResponseDataDto {
  readonly client: BusinessOwnerClientDto;
  readonly business: BusinessResponseDataDto | null;
}
