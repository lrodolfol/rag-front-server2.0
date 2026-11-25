import { ValidationErrors } from '@angular/forms';
import { INVALID_EMAIL_TEXT, REQUIRED_TEXT } from '../login-content';

/** Erro de validação → texto pt-BR exibido no `mat-error` (prioridade: obrigatório, e-mail). */
export function toLoginFieldErrorMessage(errors: ValidationErrors | null): string | null {
  if (errors?.['required']) {
    return REQUIRED_TEXT;
  }
  if (errors?.['email']) {
    return INVALID_EMAIL_TEXT;
  }
  return null;
}
