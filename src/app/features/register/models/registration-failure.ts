import { RegistrationField } from './registration-field';

export type RegistrationFailureKind = 'email-taken' | 'invalid-fields' | 'server-message' | 'generic';

/** Falha do cadastro já em linguagem natural (R-04). */
export interface RegistrationFailure {
  readonly kind: RegistrationFailureKind;
  /** Aviso geral (vermelho); `null` quando o erro vai só para um campo (ex.: e-mail em uso). */
  readonly message: string | null;
  /** Mensagens por campo; vazio quando não há. */
  readonly fieldErrors: Partial<Record<RegistrationField, string>>;
}
