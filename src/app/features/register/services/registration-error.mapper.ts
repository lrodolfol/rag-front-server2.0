import { HttpErrorResponse } from '@angular/common/http';
import {
  isRecord,
  parseApiResponseBody,
  readableMessage,
  UnknownRecord,
} from '../../../core/api/api-response-body';
import { RegistrationFailure } from '../models/registration-failure';
import { RegistrationField } from '../models/registration-field';
import { EMAIL_TAKEN_FALLBACK_TEXT, GENERIC_ERROR_TEXT } from '../register-content';

type FieldErrors = Partial<Record<RegistrationField, string>>;

const BAD_REQUEST = 400;
const CONFLICT = 409;
const REGISTRATION_FIELDS: readonly RegistrationField[] = ['name', 'email', 'password'];

const GENERIC_FAILURE: RegistrationFailure = {
  kind: 'generic',
  message: GENERIC_ERROR_TEXT,
  fieldErrors: {},
};

/**
 * Converte qualquer erro do cadastro em textos legíveis (R-04, `contracts/auth-register-api.md`).
 * Nunca repassa `statusCode`, `error.status`, `error.title` técnico, `instance` nem `correlationId`.
 */
export function mapRegistrationError(error: unknown): RegistrationFailure {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) {
    return GENERIC_FAILURE;
  }
  return mapHttpError(error.status, parseApiResponseBody(error.error));
}

/** Converte uma chave de `error.errors` no campo do formulário, sem diferenciar maiúsculas. */
export function toFieldName(key: string): RegistrationField | null {
  const normalized = key.toLowerCase();
  return REGISTRATION_FIELDS.find((field) => field === normalized) ?? null;
}

function mapHttpError(status: number, body: UnknownRecord | null): RegistrationFailure {
  const errorValue = body?.['error'];
  const errorBody = isRecord(errorValue) ? errorValue : null;
  const serviceText = readableMessage(body?.['message']) ?? readableMessage(errorBody?.['detail']);
  if (status === CONFLICT) {
    const email = serviceText ?? EMAIL_TAKEN_FALLBACK_TEXT;
    return { kind: 'email-taken', message: null, fieldErrors: { email } };
  }
  if (status === BAD_REQUEST && errorBody !== null && isRecord(errorBody['errors'])) {
    const generalText = readableMessage(body?.['message']) ?? readableMessage(errorBody['title']);
    return mapFieldErrors(errorBody['errors'], generalText);
  }
  return serviceText === null
    ? GENERIC_FAILURE
    : { kind: 'server-message', message: serviceText, fieldErrors: {} };
}

function mapFieldErrors(errors: UnknownRecord, generalText: string | null): RegistrationFailure {
  const fieldErrors: FieldErrors = {};
  let firstMessage: string | null = null;
  for (const [key, messages] of Object.entries(errors)) {
    const text = Array.isArray(messages) ? readableMessage(messages[0]) : null;
    const field = toFieldName(key);
    firstMessage ??= text;
    if (text !== null && field !== null && fieldErrors[field] === undefined) {
      fieldErrors[field] = text;
    }
  }
  // Sem nenhuma chave reconhecida, a 1ª mensagem de `errors` substitui o aviso geral.
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const preferredText = hasFieldErrors ? generalText : (firstMessage ?? generalText);
  const message = preferredText ?? GENERIC_ERROR_TEXT;
  return { kind: 'invalid-fields', message, fieldErrors };
}

