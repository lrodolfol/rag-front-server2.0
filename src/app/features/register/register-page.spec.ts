import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { AUTH_API_URL } from '../../core/config/auth-api-url.token';
import { GENERIC_ERROR_TEXT } from './register-content';
import { RegisterPage } from './register-page';
import { RegistrationStore } from './state/registration.store';

const BASE_URL = 'http://api.test/api/v1/auth';
const REGISTER_URL = `${BASE_URL}/register`;
const PASSWORD = 'senhaSegura1';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterPage, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_API_URL, useValue: BASE_URL },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function input(field: 'name' | 'email' | 'password'): HTMLInputElement {
    return element.querySelector(`input[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  function fieldError(field: 'name' | 'email' | 'password'): string | undefined {
    return input(field).closest('mat-form-field')?.querySelector('mat-error')?.textContent?.trim();
  }

  async function type(field: 'name' | 'email' | 'password', value: string): Promise<void> {
    input(field).value = value;
    input(field).dispatchEvent(new Event('input'));
    input(field).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function submitValidForm(): Promise<TestRequest> {
    await type('name', '  Maria da Silva ');
    await type('email', ' Maria@Example.COM');
    await type('password', PASSWORD);
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    return httpTesting.expectOne(REGISTER_URL);
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function expectNothingStoredOrInUrl(): void {
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(TestBed.inject(Router).url).not.toContain(PASSWORD);
    expect(element.textContent).not.toContain(PASSWORD);
  }

  it('should show the header with a single "início" link and the brand pointing home', () => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('app-site-header a[mat-button]'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual(['início']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/']);
    expect(links[0]?.querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe('home');
    const brand = element.querySelector<HTMLAnchorElement>('app-site-header a.brand');
    expect(brand?.textContent).toContain('AchaLocal');
    expect(brand?.getAttribute('href')).toBe('/');
  });

  it('should provide its own registration store', () => {
    expect(fixture.debugElement.injector.get(RegistrationStore)).toBeInstanceOf(RegistrationStore);
  });

  it('should register a client end to end and clear the form', async () => {
    const request = await submitValidForm();
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      Name: 'Maria da Silva',
      Email: 'maria@example.com',
      Password: PASSWORD,
    });
    expect(input('name').disabled).toBe(true);

    request.flush(
      {
        statusCode: 201,
        success: true,
        message: 'Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail',
        data: {
          clientId: 2,
          accessCode: 'sE1CMP8iqfYV',
          name: 'Maria da Silva',
          email: 'maria@example.com',
          createdAt: '2026-11-22T19:27:48.2031803+00:00',
        },
        error: null,
      },
      { status: 201, statusText: 'Created' },
    );
    await settle();

    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      'Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail',
    );
    expect(input('name').value).toBe('');
    expect(input('email').value).toBe('');
    expect(input('password').value).toBe('');
    expect(element.textContent).not.toContain('sE1CMP8iqfYV');
    expectNothingStoredOrInUrl();
  });

  it('should not send anything while a field is invalid', async () => {
    await type('name', 'Maria');
    await type('email', 'maria@');
    await type('password', 'abcdefgh');
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    httpTesting.expectNone(REGISTER_URL);
  });

  describe('falhas', () => {
    it('should show the 409 message on the e-mail field', async () => {
      const request = await submitValidForm();
      request.flush(
        {
          statusCode: 409,
          success: false,
          message: 'Já existe uma conta cadastrada com este e-mail.',
          data: null,
          error: {
            title: 'Conflito',
            status: 409,
            detail: 'Já existe uma conta cadastrada com este e-mail.',
            instance: '/api/v1/auth/register',
            correlationId: '14a5a141-061f-4d10-a0bf-3fb0ee60dc8d',
          },
        },
        { status: 409, statusText: 'Conflict' },
      );
      await settle();
      expect(fieldError('email')).toBe('Já existe uma conta cadastrada com este e-mail.');
      // `type="email"` já descarta os espaços das pontas no próprio input (sanitização do HTML).
      expect(input('email').value).toBe('Maria@Example.COM');
      expect(input('name').value).toBe('  Maria da Silva ');
      expect(element.textContent).not.toContain('Conflito');
      expect(element.textContent).not.toContain('14a5a141');
      expectNothingStoredOrInUrl();
    });

    it('should spread a 400 over the fields and show the general alert', async () => {
      const request = await submitValidForm();
      request.flush(
        {
          statusCode: 400,
          success: false,
          message: 'Um ou mais campos são inválidos.',
          data: null,
          error: {
            title: 'Um ou mais campos são inválidos.',
            status: 400,
            instance: '/api/v1/auth/register',
            errors: { password: ['Informe a senha.'] },
            correlationId: '72e74af4-de35-4248-9c8e-f3fca71ae9f1',
          },
        },
        { status: 400, statusText: 'Bad Request' },
      );
      await settle();
      expect(fieldError('password')).toBe('Informe a senha.');
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Um ou mais campos são inválidos.',
      );
      expect(input('password').disabled).toBe(false);
    });

    it('should show the generic text on a network failure and release the form', async () => {
      const request = await submitValidForm();
      request.error(new ProgressEvent('error'));
      await settle();
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        GENERIC_ERROR_TEXT,
      );
      expect(input('name').disabled).toBe(false);
      expect(input('name').value).toBe('  Maria da Silva ');
      expectNothingStoredOrInUrl();
    });
  });
});
