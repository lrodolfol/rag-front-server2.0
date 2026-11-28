import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { DASHBOARD_TIMEOUT_MS } from '../dashboard-content';
import { DashboardStore } from './dashboard.store';

const BASE_URL = 'http://api.test/api/v1';
const BUSINESS_URL = `${BASE_URL}/42/business`;
const VALID_SESSION = {
  accessToken: 'eyJhbGciOi.token.assinatura',
  tokenType: 'Bearer',
  expiresAt: '2999-01-01T00:00:00Z',
  clientId: 42,
};
const FOUND_BODY = {
  statusCode: 200,
  success: true,
  message: 'Negócio encontrado com sucesso.',
  data: { client: { id: 42 }, business: { name: 'Padaria Pão Quente' } },
  error: null,
};
const NO_BUSINESS_BODY = { ...FOUND_BODY, data: { client: { id: 42 }, business: null } };

describe('DashboardStore', () => {
  let httpTesting: HttpTestingController;
  let redirect: { redirectToLogin: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn> };
  let injector: EnvironmentInjector;
  let store: DashboardStore;
  let injectorDestroyed: boolean;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    sessionStorage.clear();
    redirect = { redirectToLogin: vi.fn(), signOut: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: AuthRedirectService, useValue: redirect },
      ],
    });
    TestBed.inject(AuthSessionService).save(VALID_SESSION);
    httpTesting = TestBed.inject(HttpTestingController);
    injector = createEnvironmentInjector([DashboardStore], TestBed.inject(EnvironmentInjector));
    store = injector.get(DashboardStore);
    injectorDestroyed = false;
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    if (!injectorDestroyed) {
      injector.destroy();
    }
    httpTesting.verify({ ignoreCancelled: true });
    sessionStorage.clear();
  });

  function loadAndFlush(body: object, status = 200): void {
    store.load();
    httpTesting
      .expectOne(BUSINESS_URL)
      .flush(body, { status, statusText: status === 200 ? 'OK' : 'Erro' });
  }

  it('should start in loading without a business', () => {
    expect(store.status()).toBe('loading');
    expect(store.business()).toBeNull();
  });

  it('should go to loaded with the business when found', () => {
    loadAndFlush(FOUND_BODY);
    expect(store.status()).toBe('loaded');
    expect(store.business()).toEqual({ name: 'Padaria Pão Quente' });
  });

  it('should go to empty on HTTP 404', () => {
    loadAndFlush({ success: false, data: null }, 404);
    expect(store.status()).toBe('empty');
    expect(store.business()).toBeNull();
  });

  it('should go to empty on 200 with data null', () => {
    loadAndFlush(NO_BUSINESS_BODY);
    expect(store.status()).toBe('empty');
    expect(store.business()).toBeNull();
  });

  it('should go to failed on HTTP 500', () => {
    loadAndFlush({ success: false, message: 'Erro interno' }, 500);
    expect(store.status()).toBe('failed');
  });

  it('should go to failed on a network error', () => {
    store.load();
    httpTesting.expectOne(BUSINESS_URL).error(new ProgressEvent('error'), { status: 0 });
    expect(store.status()).toBe('failed');
  });

  it('should go to failed on invalid data', () => {
    loadAndFlush({ ...FOUND_BODY, data: { client: { id: 42 }, business: { name: '   ' } } });
    expect(store.status()).toBe('failed');
  });

  it('should go to failed when there is no answer in 30 s', () => {
    vi.useFakeTimers();
    store.load();
    const request = httpTesting.expectOne(BUSINESS_URL);
    vi.advanceTimersByTime(DASHBOARD_TIMEOUT_MS - 1);
    expect(store.status()).toBe('loading');
    vi.advanceTimersByTime(1);
    expect(store.status()).toBe('failed');
    expect(request.cancelled).toBe(true);
  });

  it('should go back to loading and clear the business when retrying', () => {
    loadAndFlush({}, 500);
    expect(store.status()).toBe('failed');

    store.load();
    expect(store.status()).toBe('loading');
    expect(store.business()).toBeNull();
    httpTesting.expectOne(BUSINESS_URL).flush(FOUND_BODY);
    expect(store.status()).toBe('loaded');
  });

  it('should ignore load() while a request is in flight', () => {
    store.load();
    store.load();
    const requests = httpTesting.match(BUSINESS_URL);
    expect(requests.length).toBe(1);
    requests[0].flush(FOUND_BODY);
  });

  it('should redirect to /login without a request when the session is gone', () => {
    loadAndFlush({}, 500);
    TestBed.inject(AuthSessionService).clear();

    store.load();

    expect(redirect.redirectToLogin).toHaveBeenCalledTimes(1);
    httpTesting.expectNone(BUSINESS_URL);
    expect(store.status()).toBe('failed');
  });

  it('should cancel the pending request when destroyed', () => {
    store.load();
    const request = httpTesting.expectOne(BUSINESS_URL);
    injector.destroy();
    injectorDestroyed = true;
    expect(request.cancelled).toBe(true);
  });
});
