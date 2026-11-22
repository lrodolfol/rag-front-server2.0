import { ValidationErrors } from '@angular/forms';
import {
  INVALID_EMAIL_TEXT,
  PASSWORD_MISSING_LETTER_TEXT,
  PASSWORD_MISSING_NUMBER_TEXT,
  PASSWORD_TOO_SHORT_TEXT,
  REQUIRED_FIELD_TEXT,
} from '../register-content';

/** Chaves de erro em ordem de prioridade: uma mensagem por vez, a mais importante primeiro. */
const MESSAGE_BY_ERROR_KEY: readonly (readonly [string, string])[] = [
  ['required', REQUIRED_FIELD_TEXT],
  ['blank', REQUIRED_FIELD_TEXT],
  ['email', INVALID_EMAIL_TEXT],
  ['minLength', PASSWORD_TOO_SHORT_TEXT],
  ['missingLetter', PASSWORD_MISSING_LETTER_TEXT],
  ['missingNumber', PASSWORD_MISSING_NUMBER_TEXT],
];

/**
 * Escolhe a mensagem a exibir para os erros de um campo. O erro `server` (texto do serviço) tem
 * prioridade sobre todos. A chave `maxlength` (de `Validators.maxLength`) devolve `null` de
 * propósito: é inalcançável pela interface, porque o atributo `maxlength` do `<input>` impede
 * digitar ou colar além do limite.
 */
export function toFieldErrorMessage(errors: ValidationErrors | null): string | null {
  if (errors === null) {
    return null;
  }
  const serverMessage: unknown = errors['server'];
  if (typeof serverMessage === 'string') {
    return serverMessage;
  }
  const match = MESSAGE_BY_ERROR_KEY.find(([key]) => key in errors);
  return match === undefined ? null : match[1];
}
