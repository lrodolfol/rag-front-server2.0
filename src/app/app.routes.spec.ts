import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import {
  AUTH_SESSION_STORAGE_KEY,
  AuthSessionService,
} from './core/auth/auth-session.service';
import { API_BASE_URL } from './core/config/api-base-url.token';
import { AUTH_API_URL } from './core/config/auth-api-url.token';
import { CHAT_API_URL } from './core/config/chat-api-url.token';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  // Pré-carrega os chunks lazy para que o primeiro teste não estoure o timeout em execução a frio.
  beforeAll(async () => {
    await import('./features/coming-soon/coming-soon-page');
    await import('./features/chatbot/chatbot-page');
    await import('./features/register/register-page');
    await import('./features/login/login-page');
    await import('./features/dashboard/dashboard-page');
    await import('./features/business-registration/business-registration-page');
  }, 30000);

  beforeEach(async () => {
    sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CHAT_API_URL, useValue: 'http://test/chat' },
        { provide: AUTH_API_URL, useValue: 'http://test/api/v1/auth' },
        { provide: API_BASE_URL, useValue: 'http://test/api/v1' },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  function saveValidSession(): void {
    TestBed.inject(AuthSessionService).save({
      accessToken: 'eyJhbGciOi.token.assinatura',
      tokenType: 'Bearer',
      expiresAt: '2999-01-01T00:00:00Z',
      clientId: 42,
    });
  }

  function currentUrl(): string {
    return TestBed.inject(Router).url;
  }

  function routeTag(): string | undefined {
    return harness.routeNativeElement?.tagName.toLowerCase();
  }

  describe('protected routes', () => {
    const deniedSessions: readonly [string, string | null][] = [
      ['without a session', null],
      [
        'with an expired session',
        JSON.stringify({
          accessToken: 't',
          tokenType: 'Bearer',
          expiresAt: '2000-01-01T00:00:00Z',
          clientId: 42,
        }),
      ],
      ['with a malformed session', '{não é json'],
    ];

    for (const [label, stored] of deniedSessions) {
      it(`should send /dashboard to /login ${label} (FR-001–003)`, async () => {
        if (stored !== null) {
          sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, stored);
        }
        await harness.navigateByUrl('/dashboard');
        expect(currentUrl()).toBe('/login');
        expect(routeTag()).toBe('app-login-page');
        expect((harness.fixture.nativeElement as HTMLElement).querySelector('app-dashboard-page')).toBeNull();
        expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
      });
    }

    it('should open the client area at /dashboard with a valid session', async () => {
      saveValidSession();
      await harness.navigateByUrl('/dashboard');
      expect(routeTag()).toBe('app-dashboard-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Meus negócios — AchaLocal');
    });

    const comingSoon: readonly [string, string, string][] = [
      ['/editar-negocio', 'Edição de negócio', 'Edição de negócio — em breve'],
      ['/excluir-negocio', 'Exclusão de negócio', 'Exclusão de negócio — em breve'],
    ];
    for (const [url, featureName, title] of comingSoon) {
      it(`should render the coming soon page at ${url} with a valid session`, async () => {
        saveValidSession();
        await harness.navigateByUrl(url);
        expect(routeTag()).toBe('app-coming-soon-page');
        expect(harness.routeNativeElement?.textContent).toContain(featureName);
        expect(TestBed.inject(Title).getTitle()).toBe(title);
      });

      it(`should send ${url} to /login without a session`, async () => {
        await harness.navigateByUrl(url);
        expect(currentUrl()).toBe('/login');
        expect(routeTag()).toBe('app-login-page');
      });
    }
  });

  describe('critical flow: login → dashboard → sign out (FR-017, SC-004)', () => {
    async function settleNavigation(): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve));
      await harness.fixture.whenStable();
    }

    it('should never reach /dashboard again after "Sair", by back button or by URL', async () => {
      // No app real isso ocorre no bootstrap; no TestBed o router precisa ouvir o "voltar" explicitamente.
      TestBed.inject(Router).setUpLocationChangeListener();
      saveValidSession();
      await harness.navigateByUrl('/dashboard');
      await harness.navigateByUrl('/chatbot');
      await harness.navigateByUrl('/dashboard');
      expect(routeTag()).toBe('app-dashboard-page');

      const signOut = Array.from(
        harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((button) => button.textContent?.trim() === 'Sair');
      signOut?.click();
      await settleNavigation();
      expect(currentUrl()).toBe('/');
      expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();

      // "Sair" substituiu a entrada atual: voltar duas vezes alcança a /dashboard anterior.
      const location = TestBed.inject(Location) as SpyLocation;
      location.back();
      await settleNavigation();
      expect(currentUrl()).toBe('/chatbot');
      location.back();
      await settleNavigation();
      expect(currentUrl()).toBe('/login');
      expect((harness.fixture.nativeElement as HTMLElement).querySelector('app-dashboard-page')).toBeNull();

      await harness.navigateByUrl('/dashboard');
      expect(currentUrl()).toBe('/login');
    });
  });

  function routeHeading(): string | undefined {
    return harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();
  }

  it('should render the landing page at the root', async () => {
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-landing-page');
    expect(TestBed.inject(Title).getTitle()).toBe('AchaLocal — diretório local com IA');
  });

  describe('business registration (/dashboard/new)', () => {
    const deniedSessions: readonly [string, string | null][] = [
      ['without a session', null],
      [
        'with an expired session',
        JSON.stringify({
          accessToken: 't',
          tokenType: 'Bearer',
          expiresAt: '2000-01-01T00:00:00Z',
          clientId: 42,
        }),
      ],
      ['with a malformed session', '{não é json'],
    ];

    for (const [label, stored] of deniedSessions) {
      it(`should send /dashboard/new to /login ${label}`, async () => {
        if (stored !== null) {
          sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, stored);
        }
        await harness.navigateByUrl('/dashboard/new');
        expect(currentUrl()).toBe('/login');
        expect(routeTag()).toBe('app-login-page');
        expect(
          (harness.fixture.nativeElement as HTMLElement).querySelector(
            'app-business-registration-page',
          ),
        ).toBeNull();
        expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
      });
    }

    it('should open the registration page with a valid session and set the title', async () => {
      saveValidSession();
      await harness.navigateByUrl('/dashboard/new');
      expect(routeTag()).toBe('app-business-registration-page');
      expect(routeHeading()).toBe('Novo negócio');
      expect(TestBed.inject(Title).getTitle()).toBe('Novo negócio — AchaLocal');
    });

    it('should redirect /cadastrar-negocio to /dashboard/new', async () => {
      saveValidSession();
      await harness.navigateByUrl('/cadastrar-negocio');
      expect(currentUrl()).toBe('/dashboard/new');
      expect(routeTag()).toBe('app-business-registration-page');
    });

    it('should send /cadastrar-negocio to /login without a session', async () => {
      await harness.navigateByUrl('/cadastrar-negocio');
      expect(currentUrl()).toBe('/login');
      expect(routeTag()).toBe('app-login-page');
    });
  });

  it('should render the chatbot page at /chatbot (FR-001)', async () => {
    await harness.navigateByUrl('/chatbot');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-chatbot-page');
    expect(harness.routeNativeElement?.querySelector('app-chat-window')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Chatbot — AchaLocal');
  });

  function findLink(text: string): HTMLAnchorElement | undefined {
    return Array.from(
      harness.routeNativeElement?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
    ).find((candidate) => candidate.textContent?.includes(text));
  }

  it('should lazy load the register page at /register (FR-003)', async () => {
    await harness.navigateByUrl('/register');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-register-page');
    expect(harness.routeNativeElement?.querySelector('app-register-form')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Cadastro — AchaLocal');
  });

  it('should open /register from the landing "registrar" link', async () => {
    await harness.navigateByUrl('/');
    findLink('registrar')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/register');
  });

  it('should go back home from /register through "início"', async () => {
    await harness.navigateByUrl('/register');
    findLink('início')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('should lazy load the login page at /login (FR-003)', async () => {
    await harness.navigateByUrl('/login');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-login-page');
    expect(harness.routeNativeElement?.querySelector('app-login-form')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Login — AchaLocal');
  });

  it('should open /login from the landing "login" link', async () => {
    await harness.navigateByUrl('/');
    findLink('login')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('should go back home from /login through "início"', async () => {
    await harness.navigateByUrl('/login');
    findLink('início')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  for (const trigger of ['testar chatbot', 'testar o chat online', 'testar agora']) {
    it(`should open the working chatbot from the landing "${trigger}" link (FR-025)`, async () => {
      await harness.navigateByUrl('/');
      const link = Array.from(
        harness.routeNativeElement?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((candidate) => candidate.textContent?.includes(trigger));
      expect(link).toBeDefined();
      link?.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/chatbot');
      expect(harness.routeNativeElement?.querySelector('app-chat-window')).not.toBeNull();
      expect(harness.routeNativeElement?.querySelector('app-coming-soon-page')).toBeNull();
    });
  }
});
