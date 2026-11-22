import { TestBed } from '@angular/core/testing';
import { AuthSession } from './auth-session';
import { AUTH_SESSION_STORAGE_KEY, AuthSessionService } from './auth-session.service';

const NOW = new Date('2026-11-22T20:00:00Z');
const SESSION: AuthSession = {
  accessToken: 'token-1',
  tokenType: 'Bearer',
  expiresAt: '2026-11-22T22:00:00Z',
  clientId: 2,
};

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionService);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    expect(localStorage.length).toBe(0);
    vi.restoreAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  /** Simula outra instância (recarga da aba): sem cópia em memória. */
  function freshService(): AuthSessionService {
    return TestBed.runInInjectionContext(() => new AuthSessionService());
  }

  it('should save and read the session', () => {
    service.save(SESSION);
    expect(service.read()).toEqual(SESSION);
  });

  it('should store the session as JSON under the session key', () => {
    service.save(SESSION);
    expect(JSON.parse(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? 'null')).toEqual(SESSION);
    expect(freshService().read()).toEqual(SESSION);
  });

  it('should overwrite a previous session', () => {
    service.save(SESSION);
    const next = { ...SESSION, accessToken: 'token-2', clientId: 3 };
    service.save(next);
    expect(service.read()).toEqual(next);
    expect(freshService().read()).toEqual(next);
  });

  it('should drop an expired session', () => {
    service.save(SESSION);
    vi.setSystemTime(new Date(SESSION.expiresAt));
    expect(service.read()).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should drop corrupted JSON', () => {
    sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, '{not json');
    expect(freshService().read()).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  for (const [description, patch] of [
    ['empty accessToken', { accessToken: '' }],
    ['empty tokenType', { tokenType: '' }],
    ['unparseable expiresAt', { expiresAt: 'amanhã' }],
    ['non numeric clientId', { clientId: '2' }],
    ['non finite clientId', { clientId: null }],
  ] as const) {
    it(`should drop a stored session with ${description}`, () => {
      sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({ ...SESSION, ...patch }));
      expect(freshService().read()).toBeNull();
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    });
  }

  it('should keep working in memory when the storage throws', () => {
    for (const method of ['setItem', 'getItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('storage indisponível');
      });
    }
    expect(() => service.save(SESSION)).not.toThrow();
    expect(service.read()).toEqual(SESSION);
    expect(() => service.clear()).not.toThrow();
    expect(service.read()).toBeNull();
  });

  it('should clear memory and storage', () => {
    service.save(SESSION);
    service.clear();
    expect(service.read()).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });
});
