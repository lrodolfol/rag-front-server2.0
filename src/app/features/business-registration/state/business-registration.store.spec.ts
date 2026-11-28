import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { FeedbackSnackbarService } from '../../../core/feedback/feedback-snackbar.service';
import { BUSINESS_REGISTRATION_TIMEOUT_MS } from '../business-registration-content';
import { BusinessRegistrationInput } from '../models/business-registration-input';
import { BusinessRegistrationStore } from './business-registration.store';

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
const CREATED_BODY = { ...FOUND_BODY, statusCode: 201, message: 'Criado.' };
const INPUT: BusinessRegistrationInput = {
  name: 'pet_amigo',
  description: null,
  details: 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.',
  address: 'avenida das acacias - 310',
  email: 'atendimento@petamigo.com.br',
  telephone: '35995678901',
};
const GENERIC_TEXT = 'Não foi possível cadastrar seu negócio agora. Tente novamente em instantes.';
const INVALID_DATA_TEXT = 'Verifique os dados informados e tente novamente.';

describe('BusinessRegistrationStore', () => {
  let httpTesting: HttpTestingController;
  let redirect: { redirectToLogin: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn> };
  let snackbar: { open: ReturnType<typeof vi.fn> };
  let navigate: ReturnType<typeof vi.spyOn>;
  let injector: EnvironmentInjector;
  let store: BusinessRegistrationStore;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    sessionStorage.clear();
    redirect = { redirectToLogin: vi.fn(), signOut: vi.fn() };
    snackbar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: AuthRedirectService, useValue: redirect },
        { provide: FeedbackSnackbarService, useValue: snackbar },
      ],
    });
    TestBed.inject(AuthSessionService).save(VALID_SESSION);
    httpTesting = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    injector = createEnvironmentInjector(
      [BusinessRegistrationStore],
      TestBed.inject(EnvironmentInjector),
    );
    store = injector.get(BusinessRegistrationStore);
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
    injector.destroy();
    httpTesting.verify({ ignoreCancelled: true });
    sessionStorage.clear();
  });

  function respond(method: 'GET' | 'POST', body: object, status = 200): void {
    httpTesting
      .expectOne({ method, url: BUSINESS_URL })
      .flush(body, { status, statusText: status < 400 ? 'OK' : 'Erro' });
  }

  function checkAndRespond(body: object, status = 200): void {
    store.check();
    respond('GET', body, status);
  }

  function goReady(): void {
    checkAndRespond({ success: false, data: null }, 404);
    expect(store.status()).toBe('ready');
  }

  describe('check()', () => {
    it('should start checking, without form nor failure', () => {
      expect(store.status()).toBe('checking');
      expect(store.showForm()).toBe(false);
      expect(store.failureMessage()).toBeNull();
    });

    it('should go to ready on 404', () => {
      goReady();
      expect(store.showForm()).toBe(true);
    });

    it('should go to ready on 200 with data null', () => {
      checkAndRespond(NO_BUSINESS_BODY);
      expect(store.status()).toBe('ready');
    });

    it('should navigate to /dashboard replacing the URL when the client has a business', () => {
      checkAndRespond(FOUND_BODY);
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
      expect(store.status()).not.toBe('ready');
      expect(store.showForm()).toBe(false);
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    const failures: readonly [string, object, number][] = [
      ['invalid data', { ...FOUND_BODY, data: { client: { id: 42 }, business: { name: '  ' } } }, 200],
      ['HTTP 500', {}, 500],
      ['HTTP 403', {}, 403],
    ];
    for (const [label, body, status] of failures) {
      it(`should go to check-failed on ${label}`, () => {
        checkAndRespond(body, status);
        expect(store.status()).toBe('check-failed');
        expect(store.showForm()).toBe(false);
      });
    }

    it('should go to check-failed on a network error', () => {
      store.check();
      httpTesting.expectOne(BUSINESS_URL).error(new ProgressEvent('error'), { status: 0 });
      expect(store.status()).toBe('check-failed');
    });

    it('should go to check-failed after 30 s without an answer', () => {
      vi.useFakeTimers();
      store.check();
      const request = httpTesting.expectOne(BUSINESS_URL);
      vi.advanceTimersByTime(BUSINESS_REGISTRATION_TIMEOUT_MS - 1);
      expect(store.status()).toBe('checking');
      vi.advanceTimersByTime(1);
      expect(store.status()).toBe('check-failed');
      expect(request.cancelled).toBe(true);
    });

    it('should retry from check-failed and reach ready', () => {
      checkAndRespond({}, 500);
      store.check();
      expect(store.status()).toBe('checking');
      respond('GET', { success: false, data: null }, 404);
      expect(store.status()).toBe('ready');
    });

    it('should ignore check() while a request is in flight or once ready', () => {
      store.check();
      store.check();
      const requests = httpTesting.match(BUSINESS_URL);
      expect(requests.length).toBe(1);
      requests[0].flush({ success: false, data: null }, { status: 404, statusText: 'Not Found' });

      store.check();
      httpTesting.expectNone(BUSINESS_URL);
    });

    it('should redirect to /login without a request when the session is gone', () => {
      TestBed.inject(AuthSessionService).clear();
      store.check();
      expect(redirect.redirectToLogin).toHaveBeenCalledTimes(1);
      httpTesting.expectNone(BUSINESS_URL);
    });
  });

  describe('submit()', () => {
    it('should POST the mapped DTO while submitting', () => {
      goReady();
      store.submit(INPUT);
      expect(store.status()).toBe('submitting');
      expect(store.isSubmitting()).toBe(true);
      expect(store.showForm()).toBe(true);

      const request = httpTesting.expectOne({ method: 'POST', url: BUSINESS_URL });
      expect(request.request.body).toEqual({
        name: 'pet_amigo',
        descricao: null,
        email: 'atendimento@petamigo.com.br',
        address: 'avenida das acacias - 310',
        telephone: '35995678901',
        detalhes: 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.',
      });
      request.flush(CREATED_BODY, { status: 201, statusText: 'Created' });
    });

    it('should go to /dashboard with the success snackbar after 2xx', () => {
      goReady();
      store.submit(INPUT);
      respond('POST', CREATED_BODY, 201);
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
      expect(snackbar.open).toHaveBeenCalledWith(
        'Negócio cadastrado com sucesso.',
        'success',
        'Fechar',
      );
    });

    it('should send a single request on double submit (SC-007)', () => {
      goReady();
      store.submit(INPUT);
      store.submit(INPUT);
      const requests = httpTesting.match({ method: 'POST', url: BUSINESS_URL });
      expect(requests.length).toBe(1);
      requests[0].flush(CREATED_BODY, { status: 201, statusText: 'Created' });
    });

    it('should ignore submit() outside ready and submit-failed', () => {
      store.submit(INPUT);
      httpTesting.expectNone({ method: 'POST', url: BUSINESS_URL });
      checkAndRespond({}, 500);
      store.submit(INPUT);
      httpTesting.expectNone({ method: 'POST', url: BUSINESS_URL });
    });

    it('should fail generically on 2xx with success false', () => {
      goReady();
      store.submit(INPUT);
      respond('POST', { ...CREATED_BODY, success: false }, 200);
      expect(store.status()).toBe('submit-failed');
      expect(store.failureMessage()).toBe(GENERIC_TEXT);
      expect(navigate).not.toHaveBeenCalled();
    });

    for (const status of [400, 422]) {
      it(`should ask to review the data on ${status}`, () => {
        goReady();
        store.submit(INPUT);
        respond('POST', { message: 'Detalhe técnico', error: { errors: { name: ['x'] } } }, status);
        expect(store.status()).toBe('submit-failed');
        expect(store.failureMessage()).toBe(INVALID_DATA_TEXT);
      });
    }

    it('should fail generically on 500 and on a network error', () => {
      goReady();
      store.submit(INPUT);
      respond('POST', { message: 'Erro interno' }, 500);
      expect(store.failureMessage()).toBe(GENERIC_TEXT);

      store.submit(INPUT);
      httpTesting
        .expectOne({ method: 'POST', url: BUSINESS_URL })
        .error(new ProgressEvent('error'), { status: 0 });
      expect(store.status()).toBe('submit-failed');
      expect(store.failureMessage()).toBe(GENERIC_TEXT);
    });

    it('should fail generically after 30 s without an answer', () => {
      goReady();
      vi.useFakeTimers();
      store.submit(INPUT);
      const request = httpTesting.expectOne({ method: 'POST', url: BUSINESS_URL });
      vi.advanceTimersByTime(BUSINESS_REGISTRATION_TIMEOUT_MS);
      expect(store.status()).toBe('submit-failed');
      expect(store.failureMessage()).toBe(GENERIC_TEXT);
      expect(request.cancelled).toBe(true);
    });

    it('should warn and go to /dashboard on 409', () => {
      goReady();
      store.submit(INPUT);
      respond('POST', { message: 'Já existe' }, 409);
      expect(snackbar.open).toHaveBeenCalledWith(
        'Você já possui um negócio cadastrado.',
        'warning',
        'Fechar',
      );
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
      expect(store.failureMessage()).toBeNull();
    });

    it('should accept a new submit after a failure and clear the message', () => {
      goReady();
      store.submit(INPUT);
      respond('POST', {}, 500);
      expect(store.failureMessage()).toBe(GENERIC_TEXT);

      store.submit(INPUT);
      expect(store.status()).toBe('submitting');
      expect(store.failureMessage()).toBeNull();
      respond('POST', CREATED_BODY, 201);
    });
  });
});
