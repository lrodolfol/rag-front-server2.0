import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { BusinessResponseDataDto } from '../models/business-response-data.dto';
import { errorToBusinessLoadResult, toBusinessLoadResult } from './business-response.mapper';

const DATA: BusinessResponseDataDto = {
  name: '  Padaria Pão Quente  ',
  description: 'Padaria artesanal.',
  email: 'contato@paoquente.com.br',
  telephone: '(11) 98765-4321',
  address: 'Rua das Flores, 123',
  details: 'Aberto de seg. a sáb.',
  createdAt: '2026-11-01T14:32:10+00:00',
  updatedAt: '2026-11-20T09:15:44+00:00',
};

function envelope(overrides: Record<string, unknown>): ApiResponseDto<BusinessResponseDataDto> {
  // O servidor pode mandar qualquer coisa: o cast simula respostas fora do contrato.
  return {
    statusCode: 200,
    success: true,
    message: 'Negócio encontrado com sucesso.',
    data: DATA,
    error: null,
    ...overrides,
  } as unknown as ApiResponseDto<BusinessResponseDataDto>;
}

function httpError(status: number): HttpErrorResponse {
  return new HttpErrorResponse({ status, statusText: 'erro' });
}

describe('toBusinessLoadResult', () => {
  it('should return found with the trimmed name', () => {
    expect(toBusinessLoadResult(envelope({}))).toEqual({
      kind: 'found',
      business: { name: 'Padaria Pão Quente' },
    });
  });

  it('should return not-found when data is null', () => {
    expect(toBusinessLoadResult(envelope({ data: null }))).toEqual({ kind: 'not-found' });
  });

  const invalidCases: readonly [string, Record<string, unknown>][] = [
    ['success: false', { success: false }],
    ['data as string', { data: 'Padaria' }],
    ['data as array', { data: [DATA] }],
    ['data without name', { data: { ...DATA, name: undefined } }],
    ['empty name', { data: { ...DATA, name: '' } }],
    ['blank name', { data: { ...DATA, name: '   ' } }],
    ['non-string name', { data: { ...DATA, name: 123 } }],
  ];
  for (const [label, overrides] of invalidCases) {
    it(`should return invalid for ${label}`, () => {
      expect(toBusinessLoadResult(envelope(overrides))).toEqual({ kind: 'invalid' });
    });
  }

  it('should return invalid for a body that is not an envelope', () => {
    const body = null as unknown as ApiResponseDto<BusinessResponseDataDto>;
    expect(toBusinessLoadResult(body)).toEqual({ kind: 'invalid' });
  });
});

describe('errorToBusinessLoadResult', () => {
  it('should return not-found for HTTP 404', () => {
    expect(errorToBusinessLoadResult(httpError(404))).toEqual({ kind: 'not-found' });
  });

  for (const status of [0, 400, 403, 500, 503]) {
    it(`should return invalid for HTTP ${status}`, () => {
      expect(errorToBusinessLoadResult(httpError(status))).toEqual({ kind: 'invalid' });
    });
  }

  it('should return invalid for a timeout', () => {
    expect(errorToBusinessLoadResult(new TimeoutError())).toEqual({ kind: 'invalid' });
  });

  it('should return invalid for any other error', () => {
    expect(errorToBusinessLoadResult(new Error('qualquer'))).toEqual({ kind: 'invalid' });
    expect(errorToBusinessLoadResult('texto')).toEqual({ kind: 'invalid' });
  });
});
