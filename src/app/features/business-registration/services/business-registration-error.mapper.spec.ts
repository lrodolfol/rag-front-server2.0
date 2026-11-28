import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { failureMessage, mapBusinessRegistrationError } from './business-registration-error.mapper';

function httpError(status: number, error: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('mapBusinessRegistrationError', () => {
  it('should map 409 to already-registered', () => {
    expect(mapBusinessRegistrationError(httpError(409))).toEqual({ kind: 'already-registered' });
  });

  for (const status of [400, 422]) {
    it(`should map ${status} to invalid-data even with field errors`, () => {
      const error = httpError(status, { error: { errors: { name: ['Obrigatório.'] } } });
      expect(mapBusinessRegistrationError(error)).toEqual({ kind: 'invalid-data' });
    });
  }

  for (const status of [0, 403, 404, 500, 503]) {
    it(`should map ${status} to generic`, () => {
      expect(mapBusinessRegistrationError(httpError(status))).toEqual({ kind: 'generic' });
    });
  }

  it('should map a timeout and non-HTTP values to generic', () => {
    expect(mapBusinessRegistrationError(new TimeoutError())).toEqual({ kind: 'generic' });
    expect(mapBusinessRegistrationError(new Error('x'))).toEqual({ kind: 'generic' });
    expect(mapBusinessRegistrationError('x')).toEqual({ kind: 'generic' });
  });
});

describe('failureMessage', () => {
  it('should give the pt-BR text of each failure', () => {
    expect(failureMessage({ kind: 'generic' })).toBe(
      'Não foi possível cadastrar seu negócio agora. Tente novamente em instantes.',
    );
    expect(failureMessage({ kind: 'invalid-data' })).toBe(
      'Verifique os dados informados e tente novamente.',
    );
    expect(failureMessage({ kind: 'already-registered' })).toBe(
      'Você já possui um negócio cadastrado.',
    );
  });
});
