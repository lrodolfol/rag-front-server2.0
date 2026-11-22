import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthSession } from '../../../core/auth/auth-session';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AUTH_API_URL } from '../../../core/config/auth-api-url.token';
import { GENERIC_ERROR_TEXT, LOGIN_TIMEOUT_MS } from '../login-content';
import { LoginStore } from './login.store';

const LOGIN_URL = 'http://auth.test/login';
const INPUT = { email: 'maria@example.com', password: 'NovaSenha123' };
const DATA = {
  accessToken: 'token-novo',
  tokenType: 'Bearer',
  expiresAt: '2999-01-01T00:00:00Z',
  clientId: 2,
  accessCode: 'sE1CMP8iqfYV',
  business: null,
};
const SESSION: AuthSession = {
  accessToken: DATA.accessToken,
  tokenType: DATA.tokenType,
  expiresAt: DATA.expiresAt,
  clientId: DATA.clientId,
};
const PREVIOUS_SESSION: AuthSession = { ...SESSION, accessToken: 'token-antigo', clientId: 1 };

function successBody(data: object | null = DATA, success = true): object {
  return { statusCode: 200, success, message: 'ok', data, error: null };
}

describe('LoginStore', () => {
  let store: LoginStore;
  let httpTesting: HttpTestingController;
  let sessionService: AuthSessionService;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        LoginStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AUTH_API_URL, useValue: 'http://auth.test' },
      ],
    });
    store = TestBed.inject(LoginStore);
    httpTesting = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(AuthSessionService);
    vi.spyOn(sessionService, 'save');
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
    }
    httpTesting.verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  function submit(): TestRequest {
    store.submit(INPUT);
    return httpTesting.expectOne(LOGIN_URL);
  }

  describe('sucesso (US1)', () => {
    it('should start idle without message', () => {
      expect(store.status()).toBe('idle');
      expect(store.errorMessage()).toBeNull();
      expect(store.isSubmitting()).toBe(false);
    });

    it('should POST the DTO and become submitting', () => {
      const request = submit();
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ Email: INPUT.email, Password: INPUT.password });
      expect(store.status()).toBe('submitting');
      expect(store.isSubmitting()).toBe(true);
      request.flush(successBody());
    });

    it('should ignore a second submit while submitting', () => {
      const request = submit();
      store.submit(INPUT);
      httpTesting.expectNone(LOGIN_URL);
      request.flush(successBody());
    });

    it('should save the session and go to /dashboard on success', () => {
      submit().flush(successBody());
      expect(store.status()).toBe('succeeded');
      expect(sessionService.save).toHaveBeenCalledWith(SESSION);
      expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should replace a previous session', () => {
      sessionService.save(PREVIOUS_SESSION);
      submit().flush(successBody());
      expect(sessionService.read()).toEqual(SESSION);
    });

    it('should cancel the request without saving when destroyed', () => {
      const injector = createEnvironmentInjector(
        [LoginStore],
        TestBed.inject(EnvironmentInjector),
      );
      injector.get(LoginStore).submit(INPUT);
      const request = httpTesting.expectOne(LOGIN_URL);
      injector.destroy();
      expect(request.cancelled).toBe(true);
      expect(sessionService.save).not.toHaveBeenCalled();
    });
  });

  describe('falhas (US2)', () => {
    function expectNothingSavedNorNavigated(): void {
      expect(sessionService.save).not.toHaveBeenCalled();
      expect(navigateByUrl).not.toHaveBeenCalled();
    }

    it('should show the service message on 401', () => {
      submit().flush(
        { success: false, message: 'E-mail ou senha inválidos.' },
        { status: 401, statusText: 'Unauthorized' },
      );
      expect(store.status()).toBe('failed');
      expect(store.errorMessage()).toBe('E-mail ou senha inválidos.');
      expectNothingSavedNorNavigated();
    });

    it('should show the generic text on a network error', () => {
      submit().error(new ProgressEvent('error'));
      expect(store.status()).toBe('failed');
      expect(store.errorMessage()).toBe(GENERIC_ERROR_TEXT);
      expectNothingSavedNorNavigated();
    });

    it('should fail with the generic text after the timeout and cancel the request', () => {
      vi.useFakeTimers();
      const request = submit();
      vi.advanceTimersByTime(LOGIN_TIMEOUT_MS - 1);
      expect(store.status()).toBe('submitting');
      vi.advanceTimersByTime(1);
      expect(store.status()).toBe('failed');
      expect(store.errorMessage()).toBe(GENERIC_ERROR_TEXT);
      expect(request.cancelled).toBe(true);
      expectNothingSavedNorNavigated();
    });

    for (const [description, body] of [
      ['success: false', successBody(DATA, false)],
      ['data: null', successBody(null)],
    ] as const) {
      it(`should fail with the generic text on a 200 with ${description}`, () => {
        submit().flush(body);
        expect(store.status()).toBe('failed');
        expect(store.errorMessage()).toBe(GENERIC_ERROR_TEXT);
        expectNothingSavedNorNavigated();
      });
    }

    it('should keep a previous session after a failure', () => {
      sessionService.save(PREVIOUS_SESSION);
      vi.mocked(sessionService.save).mockClear();
      submit().flush(null, { status: 401, statusText: 'Unauthorized' });
      expect(sessionService.read()).toEqual(PREVIOUS_SESSION);
    });

    it('should clear the message and retry from failed', () => {
      submit().error(new ProgressEvent('error'));
      const retry = submit();
      expect(store.errorMessage()).toBeNull();
      expect(store.status()).toBe('submitting');
      retry.flush(successBody());
    });

    it('should dismiss the error', () => {
      submit().error(new ProgressEvent('error'));
      store.dismissError();
      expect(store.errorMessage()).toBeNull();
    });
  });
});
