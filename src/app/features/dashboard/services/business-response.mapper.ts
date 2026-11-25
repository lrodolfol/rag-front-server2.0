import { HttpErrorResponse } from '@angular/common/http';
import { isRecord, readableMessage } from '../../../core/api/api-response-body';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { BusinessLoadResult } from '../models/business-load-result';
import { BusinessResponseDataDto } from '../models/business-response-data.dto';

const NOT_FOUND: BusinessLoadResult = { kind: 'not-found' };
const INVALID: BusinessLoadResult = { kind: 'invalid' };

/**
 * Converte a resposta de sucesso em `BusinessLoadResult` (contracts/business-api.md, "Mapeamento").
 * A tipagem descreve o contrato, mas o servidor pode mandar qualquer coisa: a validação é defensiva.
 */
export function toBusinessLoadResult(
  response: ApiResponseDto<BusinessResponseDataDto>,
): BusinessLoadResult {
  const body: unknown = response;
  if (!isRecord(body) || body['success'] === false) {
    return INVALID;
  }
  const data = body['data'];
  // PENDENTE (R-04): o backend ainda não confirmou se "sem negócio" é 404 ou 200 + `data: null`.
  if (data === null) {
    return NOT_FOUND;
  }
  const name = isRecord(data) ? readableMessage(data['name']) : null;
  return name === null ? INVALID : { kind: 'found', business: { name } };
}

/** Converte um erro da requisição (HTTP, timeout ou outro) em `BusinessLoadResult`. */
export function errorToBusinessLoadResult(error: unknown): BusinessLoadResult {
  // PENDENTE (R-04): ramo 404 mantido junto com `data: null` até a confirmação do backend.
  return error instanceof HttpErrorResponse && error.status === 404 ? NOT_FOUND : INVALID;
}
