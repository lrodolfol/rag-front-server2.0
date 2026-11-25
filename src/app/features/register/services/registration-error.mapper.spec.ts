import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { EMAIL_TAKEN_FALLBACK_TEXT, GENERIC_ERROR_TEXT } from '../register-content';
import { RegistrationFailure } from '../models/registration-failure';
import { mapRegistrationError, toFieldName } from './registration-error.mapper';

const GENERIC: RegistrationFailure = {
  kind: 'generic',
  message: GENERIC_ERROR_TEXT,
  fieldErrors: {},
};

function httpError(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

function conflictBody(message: string, detail?: string) {
  return {
    statusCode: 409,
    success: false,
    message,
    data: null,
    error: {
      title: 'Conflito',
      status: 409,
      detail,
      instance: '/api/v1/auth/register',
      correlationId: '14a5a141-061f-4d10-a0bf-3fb0ee60dc8d',
    },
  };
}

function badRequestBody(errors: Record<string, string[]>, message = 'Um ou mais campos são inválidos.') {
  return {
    statusCode: 400,
    success: false,
    message,
    data: null,
    error: {
      title: 'Um ou mais campos são inválidos.',
      status: 400,
      instance: '/api/v1/auth/register',
      errors,
      correlationId: '72e74af4-de35-4248-9c8e-f3fca71ae9f1',
    },
  };
}

describe('mapRegistrationError', () => {
  it('should map timeouts, plain errors and network failures to the generic text', () => {
    expect(mapRegistrationError(new TimeoutError())).toEqual(GENERIC);
    expect(mapRegistrationError(new Error('boom'))).toEqual(GENERIC);
    expect(mapRegistrationError(httpError(0, new ProgressEvent('error')))).toEqual(GENERIC);
  });

  it('should put the 409 service message on the e-mail field without a general notice', () => {
    const text = 'Já existe uma conta cadastrada com este e-mail.';
    expect(mapRegistrationError(httpError(409, conflictBody(text, text)))).toEqual({
      kind: 'email-taken',
      message: null,
      fieldErrors: { email: text },
    });
  });

  it('should fall back to error.detail and then to the default text on a 409', () => {
    expect(mapRegistrationError(httpError(409, conflictBody('', 'Detalhe'))).fieldErrors).toEqual({
      email: 'Detalhe',
    });
    expect(mapRegistrationError(httpError(409, conflictBody(''))).fieldErrors).toEqual({
      email: EMAIL_TAKEN_FALLBACK_TEXT,
    });
    expect(mapRegistrationError(httpError(409, null)).fieldErrors).toEqual({
      email: EMAIL_TAKEN_FALLBACK_TEXT,
    });
  });

  it('should spread a 400 over the fields and keep the general message', () => {
    expect(
      mapRegistrationError(httpError(400, badRequestBody({ password: ['Informe a senha.'] }))),
    ).toEqual({
      kind: 'invalid-fields',
      message: 'Um ou mais campos são inválidos.',
      fieldErrors: { password: 'Informe a senha.' },
    });
  });

  it('should recognize PascalCase keys and keep only the first message of each key', () => {
    const failure = mapRegistrationError(
      httpError(400, badRequestBody({ Password: ['Primeira.', 'Segunda.'], Email: ['E-mail.'] })),
    );
    expect(failure.fieldErrors).toEqual({ password: 'Primeira.', email: 'E-mail.' });
  });

  it('should use the first message of unknown keys as the general message', () => {
    expect(
      mapRegistrationError(httpError(400, badRequestBody({ document: ['Documento inválido.'] }))),
    ).toEqual({ kind: 'invalid-fields', message: 'Documento inválido.', fieldErrors: {} });
  });

  it('should show the service message for other statuses', () => {
    const body = { statusCode: 500, success: false, message: 'Serviço em manutenção.' };
    expect(mapRegistrationError(httpError(500, body))).toEqual({
      kind: 'server-message',
      message: 'Serviço em manutenção.',
      fieldErrors: {},
    });
  });

  it('should read a JSON body that arrived as text', () => {
    const body = JSON.stringify({ message: 'Serviço em manutenção.' });
    expect(mapRegistrationError(httpError(500, body)).message).toBe('Serviço em manutenção.');
  });

  it('should use the generic text for HTML, plain string or empty bodies', () => {
    expect(mapRegistrationError(httpError(502, '<html>Bad Gateway</html>'))).toEqual(GENERIC);
    expect(mapRegistrationError(httpError(500, 'erro'))).toEqual(GENERIC);
    expect(mapRegistrationError(httpError(500, ''))).toEqual(GENERIC);
    expect(mapRegistrationError(httpError(500, null))).toEqual(GENERIC);
  });

  it('should never expose technical details', () => {
    const failures = [
      mapRegistrationError(httpError(409, conflictBody(''))),
      mapRegistrationError(httpError(400, badRequestBody({ password: ['Informe a senha.'] }))),
      mapRegistrationError(httpError(500, { error: { title: 'Conflito', status: 500 } })),
    ];
    const output = JSON.stringify(failures);
    for (const forbidden of ['correlationId', '14a5a141', '72e74af4', 'instance', '/api/v1', 'Conflito', '409', '500']) {
      expect(output).not.toContain(forbidden);
    }
  });
});

describe('toFieldName', () => {
  it('should map keys to fields regardless of case', () => {
    expect(toFieldName('name')).toBe('name');
    expect(toFieldName('Email')).toBe('email');
    expect(toFieldName('PASSWORD')).toBe('password');
    expect(toFieldName('document')).toBeNull();
  });
});
