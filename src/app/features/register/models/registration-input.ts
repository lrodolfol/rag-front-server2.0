/** Dados do cadastro já normalizados, prontos para virar o DTO da API. */
export interface RegistrationInput {
  /** trim; 1–100 caracteres; não pode ser só espaços. */
  readonly name: string;
  /** trim + minúsculas; formato usuário@domínio; ≤ 254 caracteres. */
  readonly email: string;
  /** Sem alteração; 8–64 caracteres; ≥ 1 letra e ≥ 1 número. */
  readonly password: string;
}
