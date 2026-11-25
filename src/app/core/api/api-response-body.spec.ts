import {
  isApiResponse,
  isRecord,
  parseApiResponseBody,
  readableMessage,
} from './api-response-body';

describe('api-response-body', () => {
  describe('isRecord', () => {
    it('should accept plain objects', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ a: 1 })).toBe(true);
    });

    it('should reject null, arrays and primitives', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord([])).toBe(false);
      expect(isRecord('text')).toBe(false);
    });
  });

  describe('isApiResponse', () => {
    it('should recognize an object with message, error or success', () => {
      expect(isApiResponse({ message: 'x' })).toBe(true);
      expect(isApiResponse({ error: null })).toBe(true);
      expect(isApiResponse({ success: false })).toBe(true);
    });

    it('should reject an object without any envelope key', () => {
      expect(isApiResponse({ foo: 'bar' })).toBe(false);
    });
  });

  describe('parseApiResponseBody', () => {
    it('should return an envelope object as is', () => {
      const body = { message: 'Olá' };
      expect(parseApiResponseBody(body)).toBe(body);
    });

    it('should parse a JSON string envelope', () => {
      expect(parseApiResponseBody('{"message":"Olá"}')).toEqual({ message: 'Olá' });
    });

    it('should return null for non-JSON text', () => {
      expect(parseApiResponseBody('<html>erro</html>')).toBeNull();
    });

    it('should return null for JSON that is not an envelope', () => {
      expect(parseApiResponseBody('{"foo":1}')).toBeNull();
      expect(parseApiResponseBody('[1,2]')).toBeNull();
    });

    it('should return null for null and undefined', () => {
      expect(parseApiResponseBody(null)).toBeNull();
      expect(parseApiResponseBody(undefined)).toBeNull();
    });
  });

  describe('readableMessage', () => {
    it('should trim a string with content', () => {
      expect(readableMessage('  Olá  ')).toBe('Olá');
    });

    it('should return null for blank strings and non-strings', () => {
      expect(readableMessage('')).toBeNull();
      expect(readableMessage('   ')).toBeNull();
      expect(readableMessage(42)).toBeNull();
      expect(readableMessage(null)).toBeNull();
    });
  });
});
