import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authTokenInterceptor } from '../../core/auth/auth-token.interceptor';
import {
  AUTH_SESSION_STORAGE_KEY,
  AuthSessionService,
} from '../../core/auth/auth-session.service';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import { AUTH_API_URL } from '../../core/config/auth-api-url.token';
import { BusinessRegistrationPage } from './business-registration-page';

const BASE_URL = 'http://api.test/api/v1';
const BUSINESS_URL = `${BASE_URL}/42/business`;
const TOKEN = 'eyJhbGciOi.token.assinatura';
const VALID_SESSION = {
  accessToken: TOKEN,
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
const NOT_FOUND_BODY = { success: false, message: 'Negócio não encontrado.', data: null };
const CHECK_ERROR = 'Não foi possível carregar seus dados agora. Tente novamente em instantes.';
const SERVICE_MESSAGE = 'Mensagem técnica do serviço';

@Component({ template: '<p>stub</p>' })
class Stub {}

describe('BusinessRegistrationPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(async () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter([
          { path: '', component: Stub },
          { path: 'login', component: Stub },
          { path: 'chatbot', component: Stub },
          { path: 'dashboard', component: Stub },
          { path: 'dashboard/new', component: BusinessRegistrationPage },
        ]),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: AUTH_API_URL, useValue: `${BASE_URL}/auth` },
      ],
    });
    TestBed.inject(AuthSessionService).save(VALID_SESSION);
    httpTesting = TestBed.inject(HttpTestingController);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    httpTesting.verify({ ignoreCancelled: true });
    document.querySelector('.cdk-overlay-container')?.replaceChildren();
    sessionStorage.clear();
  });

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
  }

  async function open(): Promise<TestRequest> {
    await harness.navigateByUrl('/dashboard/new');
    element = harness.routeNativeElement as HTMLElement;
    return httpTesting.expectOne({ method: 'GET', url: BUSINESS_URL });
  }

  async function respond(request: TestRequest, body: object, status = 200): Promise<void> {
    request.flush(body, { status, statusText: status < 400 ? 'OK' : 'Erro' });
    await settle();
  }

  async function openReady(): Promise<void> {
    await respond(await open(), NOT_FOUND_BODY, 404);
  }

  function form(): HTMLFormElement | null {
    return element.querySelector('app-business-registration-form form');
  }

  function control(field: string): HTMLInputElement {
    return element.querySelector(`[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  async function type(field: string, value: string): Promise<void> {
    control(field).value = value;
    control(field).dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    control(field).dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable();
  }

  async function fillAndSubmit(): Promise<TestRequest> {
    await type('name', 'pet_amigo');
    await type('details', 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.');
    await type('address', 'avenida das acacias - 310');
    await type('telephone', '35995678901');
    form()?.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    return httpTesting.expectOne({ method: 'POST', url: BUSINESS_URL });
  }

  function currentUrl(): string {
    return TestBed.inject(Router).url;
  }

  function overlayText(): string {
    return document.querySelector('.cdk-overlay-container')?.textContent ?? '';
  }

  function submitButton(): HTMLButtonElement | null {
    return element.querySelector('button[type="submit"]');
  }

  describe('fluxo crítico (US1)', () => {
    it('should register the business and go back to /dashboard with a notice', async () => {
      await openReady();
      expect(form()).not.toBeNull();
      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Novo negócio');

      const request = await fillAndSubmit();
      expect(request.request.body).toEqual({
        name: 'pet_amigo',
        descricao: null,
        email: null,
        address: 'avenida das acacias - 310',
        telephone: '35995678901',
        detalhes: 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.',
      });
      await respond(request, { ...FOUND_BODY, statusCode: 201 }, 201);

      expect(currentUrl()).toBe('/dashboard');
      expect(overlayText()).toContain('Negócio cadastrado com sucesso.');
    });

    it('should go to /dashboard through "Voltar" when nothing was typed', async () => {
      await openReady();
      const back = Array.from(element.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Voltar'),
      );
      back?.click();
      await settle();
      expect(currentUrl()).toBe('/dashboard');
    });
  });

  describe('verificação (US3)', () => {
    it('should show the spinner while checking, without the form', async () => {
      const request = await open();
      const status = element.querySelector('[role="status"]');
      expect(status?.querySelector('mat-progress-spinner')).not.toBeNull();
      expect(status?.textContent).toContain('Verificando seus dados');
      expect(form()).toBeNull();
      await respond(request, NOT_FOUND_BODY, 404);
    });

    it('should send a client with a business to /dashboard without the form', async () => {
      await respond(await open(), FOUND_BODY);
      expect(currentUrl()).toBe('/dashboard');
      expect(form()).toBeNull();
    });

    it('should show the error and retry on "Tentar novamente"', async () => {
      await respond(await open(), { message: SERVICE_MESSAGE }, 500);
      const alert = element.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain(CHECK_ERROR);
      expect(element.textContent).not.toContain(SERVICE_MESSAGE);
      expect(form()).toBeNull();

      alert?.querySelector('button')?.click();
      await harness.fixture.whenStable();
      await respond(httpTesting.expectOne(BUSINESS_URL), NOT_FOUND_BODY, 404);
      expect(form()).not.toBeNull();
    });
  });

  describe('acesso (US4)', () => {
    it('should send to /login and drop the session on 401 while checking', async () => {
      await respond(await open(), {}, 401);
      expect(currentUrl()).toBe('/login');
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    });

    it('should send to /login and drop the session on 401 while submitting', async () => {
      await openReady();
      await respond(await fillAndSubmit(), {}, 401);
      expect(currentUrl()).toBe('/login');
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    });

    it('should send the token only in the Authorization header', async () => {
      const check = await open();
      expect(check.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
      expect(check.request.urlWithParams).not.toContain(TOKEN);
      await respond(check, NOT_FOUND_BODY, 404);

      const submit = await fillAndSubmit();
      expect(submit.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
      expect(submit.request.urlWithParams).not.toContain(TOKEN);
      expect(JSON.stringify(submit.request.body)).not.toContain(TOKEN);
      await respond(submit, FOUND_BODY, 201);
    });
  });

  describe('falha no envio (US5)', () => {
    it('should keep the data and show the generic alert on 500', async () => {
      await openReady();
      await respond(await fillAndSubmit(), { message: SERVICE_MESSAGE, error: { correlationId: 'abc-123' } }, 500);

      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Não foi possível cadastrar seu negócio agora. Tente novamente em instantes.',
      );
      expect(control('name').value).toBe('pet_amigo');
      expect(control('telephone').value).toBe('(35) 99567-8901');
      expect(submitButton()?.disabled).toBe(false);
      expect(element.textContent).not.toContain(SERVICE_MESSAGE);
      expect(element.textContent).not.toContain('abc-123');
      expect(currentUrl()).toBe('/dashboard/new');
    });

    it('should not highlight fields on 400 with field errors', async () => {
      await openReady();
      const body = {
        message: SERVICE_MESSAGE,
        error: { title: 'Bad Request', detail: 'detalhe', errors: { name: ['Nome inválido.'] } },
      };
      await respond(await fillAndSubmit(), body, 400);

      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Verifique os dados informados e tente novamente.',
      );
      expect(element.querySelectorAll('mat-error').length).toBe(0);
      expect(element.textContent).not.toContain('Nome inválido.');
      expect(element.textContent).not.toContain(SERVICE_MESSAGE);
    });

    it('should warn and go to /dashboard on 409', async () => {
      await openReady();
      await respond(await fillAndSubmit(), { message: SERVICE_MESSAGE }, 409);
      expect(currentUrl()).toBe('/dashboard');
      expect(overlayText()).toContain('Você já possui um negócio cadastrado.');
    });
  });
});
