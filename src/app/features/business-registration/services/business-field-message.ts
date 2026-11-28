import { ValidationErrors } from '@angular/forms';
import { isRecord } from '../../../core/api/api-response-body';
import {
  INVALID_EMAIL_TEXT,
  INVALID_PHONE_TEXT,
  MAX_LENGTH_TEXT,
  MIN_LENGTH_TEXT,
  REQUIRED_FIELD_TEXT,
} from '../business-registration-content';

type MessageFactory = (detail: unknown) => string;

/** Chaves de erro em ordem de prioridade (data-model.md §1): uma mensagem por vez. */
const MESSAGE_BY_ERROR_KEY: readonly (readonly [string, MessageFactory])[] = [
  ['required', () => REQUIRED_FIELD_TEXT],
  ['blank', () => REQUIRED_FIELD_TEXT],
  ['trimmedMinLength', (detail) => MIN_LENGTH_TEXT(requiredLength(detail))],
  ['maxlength', (detail) => MAX_LENGTH_TEXT(requiredLength(detail))],
  ['email', () => INVALID_EMAIL_TEXT],
  ['phone', () => INVALID_PHONE_TEXT],
];

/** Texto pt-BR para os erros de um campo, ou `null` sem erros conhecidos. */
export function businessFieldMessage(errors: ValidationErrors | null): string | null {
  if (errors === null) {
    return null;
  }
  const match = MESSAGE_BY_ERROR_KEY.find(([key]) => key in errors);
  return match === undefined ? null : match[1](errors[match[0]]);
}

function requiredLength(detail: unknown): number {
  const value = isRecord(detail) ? detail['requiredLength'] : undefined;
  return typeof value === 'number' ? value : 0;
}
