import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { GENERIC_ERROR_TEXT, RATE_LIMIT_FALLBACK_TEXT } from '../chatbot-content';
import { mapChatError } from './chat-error.mapper';

const URL = 'http://test/chat';

function httpError(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error, url: URL, statusText: 'Http Failure' });
}

describe('mapChatError', () => {
  it('should map 429 with a "message" body to rate-limited with the body text', () => {
    expect(mapChatError(httpError(429, '{"message": "Limite atingido."}'))).toEqual({
      kind: 'rate-limited',
      text: 'Limite atingido.',
    });
  });

  it('should map 429 with a "detail" body to rate-limited with the detail text', () => {
    expect(mapChatError(httpError(429, '{"detail": "Muitas perguntas."}'))).toEqual({
      kind: 'rate-limited',
      text: 'Muitas perguntas.',
    });
  });

  it('should accept an already parsed object body', () => {
    expect(mapChatError(httpError(429, { message: 'Já parseado.' }))).toEqual({
      kind: 'rate-limited',
      text: 'Já parseado.',
    });
  });

  it('should use the fallback text for 429 with an unreadable or empty body', () => {
    for (const body of ['', null, '<html>erro</html>', '{"other": 1}']) {
      expect(mapChatError(httpError(429, body))).toEqual({
        kind: 'rate-limited',
        text: RATE_LIMIT_FALLBACK_TEXT,
      });
    }
  });

  it('should map 500 with a "detail" body to server-message', () => {
    expect(mapChatError(httpError(500, '{"detail": "Serviço em manutenção."}'))).toEqual({
      kind: 'server-message',
      text: 'Serviço em manutenção.',
    });
  });

  it('should map a short plain text body to server-message', () => {
    expect(mapChatError(httpError(400, 'Pergunta inválida.'))).toEqual({
      kind: 'server-message',
      text: 'Pergunta inválida.',
    });
  });

  it('should map a plain text body longer than 300 characters to generic', () => {
    expect(mapChatError(httpError(500, 'a'.repeat(301)))).toEqual({
      kind: 'generic',
      text: GENERIC_ERROR_TEXT,
    });
  });

  it('should map an HTML body to generic', () => {
    expect(mapChatError(httpError(502, '<html><body>Bad gateway</body></html>'))).toEqual({
      kind: 'generic',
      text: GENERIC_ERROR_TEXT,
    });
  });

  it('should map status 0 (network) to generic', () => {
    expect(mapChatError(httpError(0, 'qualquer coisa'))).toEqual({
      kind: 'generic',
      text: GENERIC_ERROR_TEXT,
    });
  });

  it('should map non-HTTP errors to generic', () => {
    for (const error of [new TimeoutError(), new Error('x'), undefined]) {
      expect(mapChatError(error)).toEqual({ kind: 'generic', text: GENERIC_ERROR_TEXT });
    }
  });

  it('should never expose the status, the URL or technical names', () => {
    const errors = [
      httpError(429, ''),
      httpError(500, ''),
      httpError(503, null),
      httpError(0, null),
      httpError(404, '<html></html>'),
    ];
    for (const error of errors) {
      const { text } = mapChatError(error);
      expect(text).not.toMatch(/\d{3}/);
      expect(text).not.toContain(URL);
      expect(text).not.toContain('Http');
    }
  });
});
