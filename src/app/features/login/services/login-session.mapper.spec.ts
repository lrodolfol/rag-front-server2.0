import { toAuthSession } from './login-session.mapper';

const DATA = {
  accessToken: 'eyJhbGciOi.token.assinatura',
  tokenType: 'Bearer',
  expiresAt: '2026-11-22T21:27:48+00:00',
  clientId: 2,
  accessCode: 'sE1CMP8iqfYV',
  business: null,
};
const SESSION = {
  accessToken: DATA.accessToken,
  tokenType: DATA.tokenType,
  expiresAt: DATA.expiresAt,
  clientId: DATA.clientId,
};

function envelope(data: unknown, success: boolean | undefined = true): unknown {
  return { statusCode: 200, success, message: 'ok', data, error: null };
}

describe('toAuthSession', () => {
  it('should keep only the four session fields', () => {
    const session = toAuthSession(envelope(DATA));
    expect(session).toEqual(SESSION);
    expect(session).not.toHaveProperty('accessCode');
    expect(session).not.toHaveProperty('business');
  });

  it('should accept an envelope without success', () => {
    expect(toAuthSession({ message: 'ok', data: DATA })).toEqual(SESSION);
  });

  it('should reject success: false and data: null', () => {
    expect(toAuthSession(envelope(DATA, false))).toBeNull();
    expect(toAuthSession(envelope(null))).toBeNull();
  });

  for (const [description, patch] of [
    ['missing accessToken', { accessToken: undefined }],
    ['empty accessToken', { accessToken: '' }],
    ['missing tokenType', { tokenType: undefined }],
    ['empty tokenType', { tokenType: '' }],
    ['unparseable expiresAt', { expiresAt: 'amanhã' }],
    ['string clientId', { clientId: '2' }],
    ['NaN clientId', { clientId: Number.NaN }],
  ] as const) {
    it(`should reject data with ${description}`, () => {
      expect(toAuthSession(envelope({ ...DATA, ...patch }))).toBeNull();
    });
  }

  it('should accept an expiresAt already in the past (checked on read)', () => {
    const past = { ...DATA, expiresAt: '2000-01-01T00:00:00Z' };
    expect(toAuthSession(envelope(past))?.expiresAt).toBe('2000-01-01T00:00:00Z');
  });

  it('should reject non-object input', () => {
    expect(toAuthSession(null)).toBeNull();
    expect(toAuthSession('ok')).toBeNull();
  });
});
