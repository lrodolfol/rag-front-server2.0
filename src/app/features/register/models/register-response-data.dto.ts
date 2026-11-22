/** `data` do 201 do cadastro. Tipado por completude: nunca é guardado nem exibido. */
export interface RegisterResponseDataDto {
  readonly clientId: number;
  readonly accessCode: string;
  readonly name: string;
  readonly email: string;
  /** ISO 8601. */
  readonly createdAt: string;
}
