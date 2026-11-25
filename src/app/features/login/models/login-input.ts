/** Credenciais já normalizadas, prontas para virar `LoginRequestDto`. */
export interface LoginInput {
  readonly email: string;
  readonly password: string;
}
