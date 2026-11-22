import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { LoginField } from '../models/login-field';
import { LoginStore } from '../state/login.store';
import { LoginForm } from './login-form';

const SUCCESS = {
  statusCode: 200,
  success: true,
  message: 'ok',
  data: {
    accessToken: 'token',
    tokenType: 'Bearer',
    expiresAt: '2999-01-01T00:00:00Z',
    clientId: 2,
    accessCode: 'abc',
    business: null,
  },
  error: null,
};

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let element: HTMLElement;
  let responses: Subject<unknown>;
  let store: LoginStore;

  beforeEach(async () => {
    sessionStorage.clear();
    responses = new Subject<unknown>();
    await TestBed.configureTestingModule({
      imports: [LoginForm, MatIconTestingModule],
      providers: [
        LoginStore,
        provideRouter([]),
        { provide: AuthApiService, useValue: { login: () => responses.asObservable() } },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    store = TestBed.inject(LoginStore);
    vi.spyOn(store, 'submit');
    vi.spyOn(store, 'dismissError');
    fixture = TestBed.createComponent(LoginForm);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  function input(field: LoginField): HTMLInputElement {
    return element.querySelector(`input[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  function fieldError(field: LoginField): string | undefined {
    return input(field).closest('mat-form-field')?.querySelector('mat-error')?.textContent?.trim();
  }

  function submitButton(): HTMLButtonElement {
    return element.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  function toggleButton(): HTMLButtonElement {
    return element.querySelector('button[type="button"]') as HTMLButtonElement;
  }

  function alert(): HTMLElement | null {
    return element.querySelector('[role="alert"]');
  }

  function spinner(): HTMLElement | null {
    return element.querySelector('mat-progress-spinner');
  }

  async function type(field: LoginField, value: string): Promise<void> {
    input(field).value = value;
    input(field).dispatchEvent(new Event('input', { bubbles: true }));
    input(field).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function fillValid(): Promise<void> {
    await type('email', ' Maria@Example.COM ');
    await type('password', 'NovaSenha123');
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('apresentação e envio (US1)', () => {
    it('should render the heading, labelled fields and button', () => {
      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Acesse sua conta');
      expect(element.textContent).toContain('Gerencie seus negócios no AchaLocal.');
      expect(element.querySelector('mat-icon.heading-icon')?.getAttribute('data-mat-icon-name')).toBe(
        'login',
      );
      const labels = Array.from(element.querySelectorAll('mat-label')).map((label) =>
        label.textContent?.trim(),
      );
      expect(labels).toEqual(['E-mail', 'Senha']);
      expect(submitButton().textContent?.trim()).toBe('entrar');
    });

    it('should configure autocomplete, type and maxlength of each field', () => {
      expect(input('email').getAttribute('autocomplete')).toBe('email');
      expect(input('email').type).toBe('email');
      expect(input('email').getAttribute('maxlength')).toBe('254');
      expect(input('password').getAttribute('autocomplete')).toBe('current-password');
      expect(input('password').type).toBe('password');
      expect(input('password').getAttribute('maxlength')).toBe('64');
    });

    it('should submit the normalized value once', async () => {
      await fillValid();
      await submit();
      expect(store.submit).toHaveBeenCalledTimes(1);
      expect(store.submit).toHaveBeenCalledWith({
        email: 'maria@example.com',
        password: 'NovaSenha123',
      });
    });

    it('should lock everything and show the spinner while submitting', async () => {
      await fillValid();
      await submit();
      expect(input('email').disabled).toBe(true);
      expect(input('password').disabled).toBe(true);
      expect(toggleButton().disabled).toBe(true);
      expect(submitButton().disabled).toBe(true);
      expect(spinner()?.getAttribute('aria-label')).toBe('Entrando');
    });

    it('should stay locked without spinner after success', async () => {
      await fillValid();
      await submit();
      responses.next(SUCCESS);
      await settle();
      expect(store.status()).toBe('succeeded');
      expect(input('email').disabled).toBe(true);
      expect(submitButton().disabled).toBe(true);
      expect(spinner()).toBeNull();
    });
  });

  describe('falhas (US2)', () => {
    async function failWith(status: number, body: unknown): Promise<void> {
      await fillValid();
      await submit();
      // Só interessa o que acontece a partir da falha (a digitação acima já chamou `dismissError`).
      vi.mocked(store.dismissError).mockClear();
      responses.error(new HttpErrorResponse({ status, error: body }));
      await settle();
    }

    it('should show the alert, release the form, keep the e-mail and clear the password', async () => {
      await failWith(401, { message: 'E-mail ou senha inválidos.' });
      expect(alert()?.textContent?.trim()).toBe('E-mail ou senha inválidos.');
      expect(input('email').disabled).toBe(false);
      expect(input('password').disabled).toBe(false);
      expect(toggleButton().disabled).toBe(false);
      expect(submitButton().disabled).toBe(false);
      // `type="email"` já descarta os espaços das pontas no próprio input (sanitização do HTML).
      expect(input('email').value).toBe('Maria@Example.COM');
      expect(input('password').value).toBe('');
      expect(input('password').classList).toContain('ng-pristine');
      expect(input('password').classList).toContain('ng-untouched');
      expect(fieldError('password')).toBeUndefined();
      expect(store.dismissError).not.toHaveBeenCalled();
    });

    it('should dismiss the alert when a field is edited', async () => {
      await failWith(401, { message: 'E-mail ou senha inválidos.' });
      await type('password', 'x');
      fixture.detectChanges();
      expect(store.dismissError).toHaveBeenCalled();
      expect(alert()).toBeNull();
    });

    it('should hide the alert while idle and submitting', async () => {
      expect(alert()).toBeNull();
      await fillValid();
      await submit();
      expect(alert()).toBeNull();
    });
  });

  describe('validação no cliente (US3)', () => {
    it('should flag every empty field, not submit and focus the e-mail', async () => {
      await submit();
      expect(fieldError('email')).toBe('Campo obrigatório');
      expect(fieldError('password')).toBe('Campo obrigatório');
      expect(store.submit).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input('email'));
    });

    it('should focus the password when only it is invalid', async () => {
      await type('email', 'maria@example.com');
      await submit();
      expect(document.activeElement).toBe(input('password'));
    });

    it('should flag an invalid e-mail after leaving the field', async () => {
      await type('email', 'maria@');
      expect(fieldError('email')).toBe('Informe um e-mail válido');
    });

    it('should not show errors before the field is touched', () => {
      expect(fieldError('email')).toBeUndefined();
      expect(fieldError('password')).toBeUndefined();
    });

    it('should accept any non-empty password', async () => {
      await type('email', 'maria@example.com');
      await type('password', 'a');
      await submit();
      expect(store.submit).toHaveBeenCalledWith({ email: 'maria@example.com', password: 'a' });
    });

    it('should toggle the password visibility', async () => {
      expect(toggleButton().getAttribute('aria-label')).toBe('Mostrar senha');
      expect(toggleButton().getAttribute('aria-pressed')).toBe('false');

      toggleButton().click();
      await fixture.whenStable();
      expect(input('password').type).toBe('text');
      expect(toggleButton().getAttribute('aria-label')).toBe('Ocultar senha');
      expect(toggleButton().getAttribute('aria-pressed')).toBe('true');

      toggleButton().click();
      await fixture.whenStable();
      expect(input('password').type).toBe('password');
    });
  });
});
