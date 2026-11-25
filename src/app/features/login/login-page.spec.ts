import { provideHttpClient } from '@angular/common/http';
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
import { AUTH_SESSION_STORAGE_KEY } from '../../core/auth/auth-session.service';
import { AUTH_API_URL } from '../../core/config/auth-api-url.token';
import { LoginPage } from './login-page';

const BASE_URL = 'http://api.test/api/v1/auth';
const LOGIN_URL = `${BASE_URL}/login`;
const PASSWORD = 'NovaSenha123';
const TOKEN = 'eyJhbGciOi.token.assinatura';

@Component({ template: '<p>dashboard</p>' })
class DashboardStub {}

@Component({ template: '<p>home</p>' })
class HomeStub {}

describe('LoginPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter([
          { path: '', component: HomeStub },
          { path: 'login', component: LoginPage },
          { path: 'dashboard', component: DashboardStub },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_API_URL, useValue: BASE_URL },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');
    element = harness.routeNativeElement as HTMLElement;
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    httpTesting.verify();
    sessionStorage.clear();
  });

  function input(field: 'email' | 'password'): HTMLInputElement {
    return element.querySelector(`input[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  async function type(field: 'email' | 'password', value: string): Promise<void> {
    input(field).value = value;
    input(field).dispatchEvent(new Event('input', { bubbles: true }));
    input(field).dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable();
  }

  async function submitValidForm(): Promise<TestRequest> {
    await type('email', ' Maria@Example.COM ');
    await type('password', PASSWORD);
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    return httpTesting.expectOne(LOGIN_URL);
  }

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  function alert(): HTMLElement | null {
    return element.querySelector('[role="alert"]');
  }

  it('should show the header with "início" and the brand pointing home (US4)', () => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('app-site-header a[mat-button]'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual(['início']);
    expect(links[0]?.getAttribute('href')).toBe('/');
    const brand = element.querySelector<HTMLAnchorElement>('app-site-header a.brand');
    expect(brand?.textContent).toContain('AchaLocal');
    expect(brand?.getAttribute('href')).toBe('/');
  });

  it('should show the heading, subtitle, fields and button', () => {
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Acesse sua conta');
    expect(element.textContent).toContain('Gerencie seus negócios no AchaLocal.');
    expect(input('email')).not.toBeNull();
    expect(input('password')).not.toBeNull();
    expect(element.querySelector('button[type="submit"]')?.textContent?.trim()).toBe('entrar');
  });

  it('should log in end to end, save the session and go to /dashboard (US1)', async () => {
    const request = await submitValidForm();
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ Email: 'maria@example.com', Password: PASSWORD });
    expect(input('email').disabled).toBe(true);
    expect(element.querySelector('mat-progress-spinner')).not.toBeNull();

    request.flush({
      statusCode: 200,
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        accessToken: TOKEN,
        tokenType: 'Bearer',
        expiresAt: '2999-01-01T00:00:00Z',
        clientId: 2,
        accessCode: 'sE1CMP8iqfYV',
        business: null,
      },
      error: null,
    });
    await settle();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    const stored = JSON.parse(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? 'null') as unknown;
    expect(stored).toEqual({
      accessToken: TOKEN,
      tokenType: 'Bearer',
      expiresAt: '2999-01-01T00:00:00Z',
      clientId: 2,
    });
    expect(localStorage.length).toBe(0);
    expect(harness.routeNativeElement?.textContent).not.toContain('Login realizado');
  });

  it('should show the 401 message and release the form (US2)', async () => {
    const request = await submitValidForm();
    request.flush(
      { success: false, message: 'E-mail ou senha inválidos.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    await settle();

    expect(alert()?.textContent?.trim()).toBe('E-mail ou senha inválidos.');
    expect(input('email').value).toBe('Maria@Example.COM');
    expect(input('password').value).toBe('');
    expect(input('email').disabled).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(TestBed.inject(Router).url).not.toContain(PASSWORD);

    await type('email', 'outra@example.com');
    harness.detectChanges();
    expect(alert()).toBeNull();
  });

  it('should cancel the request when leaving the page before the answer (US2)', async () => {
    const request = await submitValidForm();
    await harness.navigateByUrl('/');
    expect(request.cancelled).toBe(true);
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });
});
