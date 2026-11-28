import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  ALREADY_REGISTERED_TEXT,
  GENERIC_FAILURE_TEXT,
  INVALID_DATA_FAILURE_TEXT,
} from '../business-registration-content';
import { BusinessRegistrationFailure } from '../models/business-registration-failure';

const GENERIC: BusinessRegistrationFailure = { kind: 'generic' };
const INVALID_DATA: BusinessRegistrationFailure = { kind: 'invalid-data' };
const ALREADY_REGISTERED: BusinessRegistrationFailure = { kind: 'already-registered' };

const FAILURE_TEXT: Readonly<Record<BusinessRegistrationFailure['kind'], string>> = {
  generic: GENERIC_FAILURE_TEXT,
  'invalid-data': INVALID_DATA_FAILURE_TEXT,
  'already-registered': ALREADY_REGISTERED_TEXT,
};

/**
 * Erro do envio (HTTP, timeout ou outro) → falha (contracts/business-registration-api.md). O corpo
 * da resposta nunca é lido: nenhuma mensagem do serviço chega à tela.
 */
export function mapBusinessRegistrationError(error: unknown): BusinessRegistrationFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC;
  }
  switch (error.status) {
    case HttpStatusCode.Conflict:
      return ALREADY_REGISTERED;
    case HttpStatusCode.BadRequest:
    case HttpStatusCode.UnprocessableEntity:
      return INVALID_DATA;
    default:
      return GENERIC;
  }
}

/** Texto pt-BR exibido para a falha. */
export function failureMessage(failure: BusinessRegistrationFailure): string {
  return FAILURE_TEXT[failure.kind];
}
