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
import { DASHBOARD_TIMEOUT_MS } from './dashboard-content';
import { DashboardPage } from './dashboard-page';

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
  data: { name: 'Padaria Pão Quente' },
  error: null,
};
const LOAD_ERROR = 'Não foi possível carregar seus dados agora. Tente novamente em instantes.';
const SERVICE_MESSAGE = 'Mensagem técnica do serviço';

@Component({ template: '<p>stub</p>' })
class Stub {}

describe('DashboardPage', () => {
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
          { path: 'cadastrar-negocio', component: Stub },
          { path: 'dashboard', component: DashboardPage },
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
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    httpTesting.verify();
    sessionStorage.clear();
  });

  async function open(): Promise<TestRequest> {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');
    element = harness.routeNativeElement as HTMLElement;
    return httpTesting.expectOne(BUSINESS_URL);
  }

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  async function respond(request: TestRequest, body: object, status = 200): Promise<void> {
    request.flush(body, { status, statusText: status === 200 ? 'OK' : 'Erro' });
    await settle();
  }

  function spinner(): HTMLElement | null {
    return element.querySelector('[role="status"] mat-progress-spinner');
  }

  function alert(): HTMLElement | null {
    return element.querySelector('[role="alert"]');
  }

  function findByText(selector: string, text: string): HTMLElement | undefined {
    return Array.from(element.querySelectorAll<HTMLElement>(selector)).find(
      (candidate) => candidate.textContent?.trim() === text,
    );
  }

  function newBusinessButton(): HTMLAnchorElement | undefined {
    return findByText('a', 'Novo negócio') as HTMLAnchorElement | undefined;
  }

  function retryButton(): HTMLButtonElement | undefined {
    return findByText('button', 'Tentar novamente') as HTMLButtonElement | undefined;
  }

  describe('skeleton', () => {
    it('should show the heading, subtitle and the loading state with one request', async () => {
      const request = await open();

      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Meus negócios');
      expect(element.querySelector('.subtitle')?.textContent?.trim()).toBe(
        'Gerencie os negócios que você cadastrou no diretório.',
      );
      expect(spinner()).not.toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe(
        'Carregando seus dados',
      );
      expect(request.request.method).toBe('GET');
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
      await respond(request, FOUND_BODY);
    });
  });

  describe('US1 — session not accepted', () => {
    it('should drop the session and go to /login on 401 without an error message', async () => {
      const request = await open();
      await respond(request, { success: false, message: SERVICE_MESSAGE }, 401);

      expect(TestBed.inject(Router).url).toBe('/login');
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
      expect(harness.routeNativeElement?.textContent).not.toContain(LOAD_ERROR);
    });

    it('should go to /login without a new request when retrying after the session expired', async () => {
      const request = await open();
      await respond(request, {}, 500);
      expect(retryButton()).toBeDefined();

      TestBed.inject(AuthSessionService).save({
        ...VALID_SESSION,
        expiresAt: '2000-01-01T00:00:00Z',
      });
      retryButton()?.click();
      await settle();

      httpTesting.expectNone(BUSINESS_URL);
      expect(TestBed.inject(Router).url).toBe('/login');
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    });
  });

  describe('US2 — business found', () => {
    it('should replace the spinner with the business card and hide "Novo negócio"', async () => {
      const request = await open();
      expect(spinner()).not.toBeNull();

      await respond(request, FOUND_BODY);

      expect(spinner()).toBeNull();
      expect(element.querySelector('app-business-card h2')?.textContent?.trim()).toBe(
        'Padaria Pão Quente',
      );
      expect(newBusinessButton()).toBeUndefined();
    });
  });

  describe('US3 — no business yet', () => {
    const emptyAnswers: readonly [string, object, number][] = [
      ['HTTP 404', { success: false, data: null }, 404],
      ['200 with data null', { ...FOUND_BODY, data: null }, 200],
    ];
    for (const [label, body, status] of emptyAnswers) {
      it(`should show the empty state and "Novo negócio" on ${label}`, async () => {
        const request = await open();
        expect(newBusinessButton()).toBeUndefined();

        await respond(request, body, status);

        const empty = element.querySelector('app-business-empty-state');
        expect(empty?.querySelector('h2')?.textContent?.trim()).toBe('Nenhum negócio ainda');
        expect(empty?.textContent).toContain(
          'Cadastre seu primeiro negócio para aparecer no chatbot.',
        );
        expect(findByText('a', 'Cadastrar agora')?.getAttribute('href')).toBe(
          '/cadastrar-negocio',
        );
        expect(newBusinessButton()?.getAttribute('href')).toBe('/cadastrar-negocio');
      });
    }

    it('should not show "Novo negócio" when the load failed', async () => {
      const request = await open();
      await respond(request, {}, 500);
      expect(newBusinessButton()).toBeUndefined();
    });
  });

  describe('US4 — load failure', () => {
    const failures: readonly [string, object, number][] = [
      ['HTTP 500', { success: false, message: SERVICE_MESSAGE }, 500],
      ['HTTP 503', { success: false, message: SERVICE_MESSAGE }, 503],
      ['HTTP 403', { success: false, message: SERVICE_MESSAGE }, 403],
      ['invalid data', { ...FOUND_BODY, message: SERVICE_MESSAGE, data: { email: 'x' } }, 200],
    ];
    for (const [label, body, status] of failures) {
      it(`should show the fixed message and "Tentar novamente" on ${label}`, async () => {
        const request = await open();
        await respond(request, body, status);

        expect(alert()?.querySelector('p')?.textContent?.trim()).toBe(LOAD_ERROR);
        expect(alert()?.contains(retryButton() ?? null)).toBe(true);
        expect(element.textContent).not.toContain(SERVICE_MESSAGE);
        expect(spinner()).toBeNull();
      });
    }

    it('should show the fixed message on a network error', async () => {
      const request = await open();
      request.error(new ProgressEvent('error'), { status: 0 });
      await settle();
      expect(alert()?.textContent).toContain(LOAD_ERROR);
    });

    it('should fail after 30 s without an answer and drop the spinner', async () => {
      // O `timeout` do RxJS agenda com setInterval: só ele é falsificado, o resto do Angular segue real.
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      const request = await open();

      vi.advanceTimersByTime(DASHBOARD_TIMEOUT_MS);
      await settle();

      expect(request.cancelled).toBe(true);
      expect(alert()?.textContent).toContain(LOAD_ERROR);
      expect(spinner()).toBeNull();
    });

    it('should retry once with the spinner visible and then show the card', async () => {
      const request = await open();
      await respond(request, {}, 500);

      const retry = retryButton();
      retry?.click();
      retry?.click();
      await settle();

      expect(spinner()).not.toBeNull();
      const retried = httpTesting.match(BUSINESS_URL);
      expect(retried.length).toBe(1);
      await respond(retried[0], FOUND_BODY);
      expect(element.querySelector('app-business-card')).not.toBeNull();
      expect(alert()).toBeNull();
    });
  });

  describe('US5 — navigation and sign out', () => {
    it('should show the brand, the client items and "Sair" in the header', async () => {
      await respond(await open(), FOUND_BODY);

      const header = element.querySelector('app-site-header') as HTMLElement;
      const brand = header.querySelector<HTMLAnchorElement>('a.brand');
      expect(brand?.textContent).toContain('AchaLocal');
      expect(brand?.getAttribute('href')).toBe('/');

      const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('a[mat-button]'));
      expect(links.map((link) => link.textContent?.trim())).toEqual([
        'Testar Chatbot',
        'Meus negócios',
      ]);
      expect(links.map((link) => link.getAttribute('href'))).toEqual(['/chatbot', '/dashboard']);
      expect(links[0].querySelector('mat-icon[data-mat-icon-name="chat"]')).not.toBeNull();
      expect(links[1].querySelector('mat-icon[data-mat-icon-name="grid_view"]')).not.toBeNull();

      const signOut = header.querySelector<HTMLButtonElement>('button[mat-button]');
      expect(signOut?.textContent?.trim()).toBe('Sair');
      expect(signOut?.querySelector('mat-icon[data-mat-icon-name="logout"]')).not.toBeNull();
    });

    it('should drop the session and go home on "Sair"', async () => {
      await respond(await open(), FOUND_BODY);

      element.querySelector<HTMLButtonElement>('app-site-header button[mat-button]')?.click();
      await settle();

      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
      expect(TestBed.inject(Router).url).toBe('/');
    });

    function expectChatbotCard(): void {
      const card = element.querySelector('app-chatbot-preview-card');
      expect(card).not.toBeNull();
      const openChat = Array.from(card?.querySelectorAll('a') ?? []).find(
        (link) => link.textContent?.trim() === 'Abrir o chat',
      );
      expect(openChat?.getAttribute('href')).toBe('/chatbot');
    }

    it('should show the chatbot card in every state', async () => {
      const request = await open();
      expectChatbotCard();
      await respond(request, {}, 500);
      expectChatbotCard();

      retryButton()?.click();
      await settle();
      await respond(httpTesting.expectOne(BUSINESS_URL), { ...FOUND_BODY, data: null });
      expectChatbotCard();
    });

    it('should show the chatbot card with the business loaded', async () => {
      await respond(await open(), FOUND_BODY);
      expectChatbotCard();
    });
  });
});
