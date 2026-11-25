import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { GENERIC_ERROR_TEXT } from '../login-content';
import { mapLoginError } from './login-error.mapper';

function httpError(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('mapLoginError', () => {
  it('should use the generic text for non-HTTP errors', () => {
    expect(mapLoginError(new Error('boom'))).toBe(GENERIC_ERROR_TEXT);
    expect(mapLoginError(new TimeoutError())).toBe(GENERIC_ERROR_TEXT);
    expect(mapLoginError('oops')).toBe(GENERIC_ERROR_TEXT);
  });

  it('should use the generic text for a network error (status 0)', () => {
    expect(mapLoginError(httpError(0, null))).toBe(GENERIC_ERROR_TEXT);
  });

  it('should show the service message on 401 and 403', () => {
    expect(mapLoginError(httpError(401, { message: 'E-mail ou senha inválidos.' }))).toBe(
      'E-mail ou senha inválidos.',
    );
    expect(mapLoginError(httpError(403, { message: 'Confirme seu e-mail.' }))).toBe(
      'Confirme seu e-mail.',
    );
  });

  it('should fall back to error.detail when the message is blank', () => {
    expect(mapLoginError(httpError(500, { message: '   ', error: { detail: 'Detalhe' } }))).toBe(
      'Detalhe',
    );
  });

  it('should read an envelope sent as a JSON string', () => {
    expect(mapLoginError(httpError(429, '{"message":"Muitas tentativas."}'))).toBe(
      'Muitas tentativas.',
    );
  });

  it('should use the generic text for a non-JSON body', () => {
    expect(mapLoginError(httpError(502, '<html>Bad Gateway</html>'))).toBe(GENERIC_ERROR_TEXT);
  });

  it('should never expose title, status, instance or correlationId', () => {
    const body = {
      success: false,
      error: {
        title: 'Unauthorized',
        status: 401,
        instance: '/api/v1/auth/login',
        correlationId: '14a5a141-061f-4d10-a0bf-3fb0ee60dc8d',
      },
    };
    expect(mapLoginError(httpError(401, body))).toBe(GENERIC_ERROR_TEXT);
  });
});
