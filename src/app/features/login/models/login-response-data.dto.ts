/** `data` do envelope de sucesso do login. `business` ainda não tem formato definido. */
export interface LoginResponseDataDto {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresAt: string;
  readonly clientId: number;
  readonly accessCode: string;
  readonly business: unknown;
}
