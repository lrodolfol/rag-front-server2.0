/** Corpo do `POST /register` (PascalCase = contrato do serviço de autenticação). */
export interface RegisterRequestDto {
  readonly Name: string;
  readonly Email: string;
  readonly Password: string;
}
