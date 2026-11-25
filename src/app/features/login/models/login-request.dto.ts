/** Corpo do `POST {authApiUrl}/login` (PascalCase, como o cadastro — research R-02). */
export interface LoginRequestDto {
  readonly Email: string;
  readonly Password: string;
}
