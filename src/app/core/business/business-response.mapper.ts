import { HttpErrorResponse } from '@angular/common/http';
import { isRecord, readableMessage } from '../api/api-response-body';
import { ApiResponseDto } from '../api/api-response.dto';
import { BusinessLoadResult } from './business-load-result';
import { ClientBusinessResponseDataDto } from './business-response-data.dto';

const NOT_FOUND: BusinessLoadResult = { kind: 'not-found' };
const INVALID: BusinessLoadResult = { kind: 'invalid' };

/**
 * Converte a resposta de sucesso em `BusinessLoadResult` (contracts/business-api.md, "Mapeamento").
 * A tipagem descreve o contrato, mas o servidor pode mandar qualquer coisa: a validação é defensiva.
 * O negócio vem em `data.business`; `business: null` significa cliente sem negócio cadastrado.
 */
export function toBusinessLoadResult(
  response: ApiResponseDto<ClientBusinessResponseDataDto>,
): BusinessLoadResult {
  const body: unknown = response;
  if (!isRecord(body) || body['success'] === false) {
    return INVALID;
  }
  const data = body['data'];
  if (!isRecord(data)) {
    return INVALID;
  }
  const business = data['business'];
  if (business === null) {
    return NOT_FOUND;
  }
  const name = isRecord(business) ? readableMessage(business['name']) : null;
  return name === null ? INVALID : { kind: 'found', business: { name } };
}

/** Converte um erro da requisição (HTTP, timeout ou outro) em `BusinessLoadResult`. */
export function errorToBusinessLoadResult(error: unknown): BusinessLoadResult {
  // PENDENTE (R-04): ramo 404 mantido junto com `data: null` até a confirmação do backend.
  return error instanceof HttpErrorResponse && error.status === 404 ? NOT_FOUND : INVALID;
}
