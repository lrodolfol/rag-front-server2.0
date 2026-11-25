import { HttpErrorResponse } from '@angular/common/http';
import {
  isRecord,
  parseApiResponseBody,
  readableMessage,
} from '../../../core/api/api-response-body';
import { GENERIC_ERROR_TEXT } from '../login-content';

/**
 * Converte qualquer falha do login em texto legível (research R-05): `message` do envelope, senão
 * `error.detail`, senão o texto genérico. Nunca usa `title`, `status`, `instance` nem `correlationId`.
 */
export function mapLoginError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) {
    return GENERIC_ERROR_TEXT;
  }
  const body = parseApiResponseBody(error.error);
  const errorValue = body?.['error'];
  const errorBody = isRecord(errorValue) ? errorValue : null;
  return (
    readableMessage(body?.['message']) ??
    readableMessage(errorBody?.['detail']) ??
    GENERIC_ERROR_TEXT
  );
}
