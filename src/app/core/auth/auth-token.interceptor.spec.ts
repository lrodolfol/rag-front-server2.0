import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api-base-url.token';
import { AUTH_API_URL } from '../config/auth-api-url.token';
import { CHAT_API_URL } from '../config/chat-api-url.token';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthRedirectService } from './auth-redirect.service';
import { AuthSessionService } from './auth-session.service';

const API_URL = 'http://api.test/api/v1';
const AUTH_URL = 'http://api.test/api/v1/auth';
const CHAT_URL = 'http://chat.test/chat';
const BUSINESS_URL = `${API_URL}/42/business`;
const TOKEN = 'eyJhbGciOi.token.assinatura';
const VALID_SESSION = {
  accessToken: TOKEN,
  tokenType: 'Bearer',
  expiresAt: '2999-01-01T00:00:00Z',
  clientId: 42,
};

interface Outcome {
  value?: unknown;
  error?: unknown;
  completed: boolean;
}

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let session: AuthSessionService;
  let redirect: { redirectToLogin: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn> };
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    sessionStorage.clear();
    redirect = { redirectToLogin: vi.fn(), signOut: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_URL },
        { provide: AUTH_API_URL, useValue: AUTH_URL },
        { provide: CHAT_API_URL, useValue: CHAT_URL },
        { provide: AuthRedirectService, useValue: redirect },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSessionService);
    consoleSpies = (['error', 'warn', 'log', 'info', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    httpTesting.verify();
    sessionStorage.clear();
  });

  function get(url: string): Outcome {
    const outcome: Outcome = { completed: false };
    http.get(url).subscribe({
      next: (value) => (outcome.value = value),
      error: (error: unknown) => (outcome.error = error),
      complete: () => (outcome.completed = true),
    });
    return outcome;
  }

  it('should add the Bearer header to in-scope URLs with a valid session', () => {
    session.save(VALID_SESSION);
    const outcome = get(BUSINESS_URL);

    const request = httpTesting.expectOne(BUSINESS_URL);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    expect(request.request.urlWithParams).toBe(BUSINESS_URL);
    request.flush({ ok: true });
    expect(outcome.value).toEqual({ ok: true });
  });

  for (const url of [CHAT_URL, `${AUTH_URL}/login`, 'http://api.test/api/v10/x']) {
    it(`should leave ${url} untouched and not redirect on its 401`, () => {
      session.save(VALID_SESSION);
      const outcome = get(url);

      const request = httpTesting.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(redirect.redirectToLogin).not.toHaveBeenCalled();
      expect((outcome.error as HttpErrorResponse).status).toBe(401);
    });
  }

  it('should redirect without sending when there is no valid session', () => {
    const outcome = get(BUSINESS_URL);

    httpTesting.expectNone(BUSINESS_URL);
    expect(redirect.redirectToLogin).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({ completed: true });
  });

  it('should redirect and complete silently on 401', () => {
    session.save(VALID_SESSION);
    const outcome = get(BUSINESS_URL);

    httpTesting.expectOne(BUSINESS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(redirect.redirectToLogin).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({ completed: true });
  });

  for (const status of [403, 404, 500]) {
    it(`should pass HTTP ${status} through without redirecting`, () => {
      session.save(VALID_SESSION);
      const outcome = get(BUSINESS_URL);

      httpTesting.expectOne(BUSINESS_URL).flush(null, { status, statusText: 'Erro' });

      expect(redirect.redirectToLogin).not.toHaveBeenCalled();
      expect((outcome.error as HttpErrorResponse).status).toBe(status);
    });
  }
});
