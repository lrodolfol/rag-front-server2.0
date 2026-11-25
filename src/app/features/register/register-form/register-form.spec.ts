import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Subject } from 'rxjs';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { RegisterResponseDataDto } from '../models/register-response-data.dto';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { RegistrationStore } from '../state/registration.store';
import { RegisterForm } from './register-form';

type RegisterResponse = ApiResponseDto<RegisterResponseDataDto>;
type FieldName = 'name' | 'email' | 'password';

describe('RegisterForm', () => {
  let fixture: ComponentFixture<RegisterForm>;
  let element: HTMLElement;
  let responses: Subject<RegisterResponse>;
  let store: RegistrationStore;

  beforeEach(async () => {
    responses = new Subject<RegisterResponse>();
    await TestBed.configureTestingModule({
      imports: [RegisterForm, MatIconTestingModule],
      providers: [
        RegistrationStore,
        { provide: AuthApiService, useValue: { register: () => responses.asObservable() } },
      ],
    }).compileComponents();
    store = TestBed.inject(RegistrationStore);
    vi.spyOn(store, 'submit');
    fixture = TestBed.createComponent(RegisterForm);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function input(field: FieldName): HTMLInputElement {
    return element.querySelector(`input[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  function fieldError(field: FieldName): string | undefined {
    return input(field)
      .closest('mat-form-field')
      ?.querySelector('mat-error')
      ?.textContent?.trim();
  }

  function submitButton(): HTMLButtonElement {
    return element.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  function toggleButton(): HTMLButtonElement {
    return element.querySelector('button[type="button"]') as HTMLButtonElement;
  }

  async function type(field: FieldName, value: string): Promise<void> {
    input(field).value = value;
    input(field).dispatchEvent(new Event('input'));
    input(field).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function fillValid(): Promise<void> {
    await type('name', '  Maria  ');
    await type('email', ' Maria@Example.COM ');
    await type('password', 'senha123');
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('apresentação e envio (US1)', () => {
    it('should render the title, subtitle, labelled fields, hint and button', () => {
      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Crie sua conta');
      expect(element.textContent).toContain('Cadastre e gerencie seus negócios no AchaLocal.');
      const labels = Array.from(element.querySelectorAll('mat-label')).map((label) =>
        label.textContent?.trim(),
      );
      expect(labels).toEqual(['Seu nome', 'E-mail', 'Senha']);
      expect(element.textContent).toContain('Mínimo de 8 caracteres, com letras e números');
      expect(submitButton().textContent?.trim()).toBe('criar minha conta');
    });

    it('should configure autocomplete, type and maxlength of each field', () => {
      expect(input('name').getAttribute('autocomplete')).toBe('name');
      expect(input('email').getAttribute('autocomplete')).toBe('email');
      expect(input('password').getAttribute('autocomplete')).toBe('new-password');
      expect(input('name').getAttribute('maxlength')).toBe('100');
      expect(input('email').getAttribute('maxlength')).toBe('254');
      expect(input('password').getAttribute('maxlength')).toBe('64');
      expect(input('email').type).toBe('email');
      expect(input('password').type).toBe('password');
    });

    it('should submit the normalized value', async () => {
      await fillValid();
      await submit();
      expect(store.submit).toHaveBeenCalledWith({
        name: 'Maria',
        email: 'maria@example.com',
        password: 'senha123',
      });
    });

    it('should lock the fields and show the spinner while submitting', async () => {
      await fillValid();
      await submit();
      for (const field of ['name', 'email', 'password'] as const) {
        expect(input(field).disabled).toBe(true);
      }
      expect(submitButton().disabled).toBe(true);
      expect(toggleButton().disabled).toBe(true);
      const spinner = element.querySelector('mat-progress-spinner');
      expect(spinner?.getAttribute('aria-label')).toBe('Enviando cadastro');
    });

    it('should clear the form and show the success notice after success', async () => {
      await fillValid();
      await submit();
      responses.next({ statusCode: 201, success: true, message: 'Tudo certo!', data: null, error: null });
      await settle();

      for (const field of ['name', 'email', 'password'] as const) {
        expect(input(field).disabled).toBe(false);
        expect(input(field).value).toBe('');
        expect(input(field).classList).toContain('ng-pristine');
        expect(input(field).classList).toContain('ng-untouched');
        expect(fieldError(field)).toBeUndefined();
      }
      expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe('Tudo certo!');
      expect(element.querySelector('mat-progress-spinner')).toBeNull();
    });
  });

  describe('validação no cliente (US2)', () => {
    it('should flag every empty field, not submit and focus the name', async () => {
      await submit();
      expect(fieldError('name')).toBe('Campo obrigatório');
      expect(fieldError('email')).toBe('Campo obrigatório');
      expect(fieldError('password')).toBe('Campo obrigatório');
      expect(store.submit).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input('name'));
    });

    it('should focus the first invalid field in order', async () => {
      await type('name', 'Maria');
      await submit();
      expect(document.activeElement).toBe(input('email'));
    });

    it('should flag an invalid e-mail after leaving the field', async () => {
      await type('email', 'maria@');
      expect(fieldError('email')).toBe('Informe um e-mail válido');
    });

    it('should flag a name made only of spaces as required', async () => {
      await type('name', '   ');
      expect(fieldError('name')).toBe('Campo obrigatório');
    });

    for (const [password, message] of [
      ['abcdefgh', 'A senha deve conter pelo menos um número'],
      ['1234567', 'A senha deve ter pelo menos 8 caracteres'],
      ['12345678', 'A senha deve conter pelo menos uma letra'],
    ] as const) {
      it(`should explain why "${password}" is not accepted`, async () => {
        await type('password', password);
        expect(fieldError('password')).toBe(message);
      });
    }

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

  describe('falhas do serviço (US3)', () => {
    async function failWith(status: number, body: unknown): Promise<void> {
      await fillValid();
      await submit();
      responses.error(new HttpErrorResponse({ status, error: body }));
      await settle();
    }

    it('should show the 409 message on the e-mail field and focus it', async () => {
      await failWith(409, { message: 'Já existe uma conta cadastrada com este e-mail.' });
      expect(fieldError('email')).toBe('Já existe uma conta cadastrada com este e-mail.');
      expect(document.activeElement).toBe(input('email'));
      expect(input('name').value).toBe('  Maria  ');
      // `type="email"` já descarta os espaços das pontas no próprio input (sanitização do HTML).
      expect(input('email').value).toBe('Maria@Example.COM');
      expect(input('email').disabled).toBe(false);
      expect(element.querySelector('[role="alert"]')).toBeNull();
    });

    it('should show the general alert only when there is a general message', async () => {
      await failWith(500, { message: 'Serviço em manutenção.' });
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Serviço em manutenção.',
      );
    });

    it('should spread a 400 over the fields and show the general alert', async () => {
      await failWith(400, {
        message: 'Um ou mais campos são inválidos.',
        error: { errors: { password: ['Informe a senha.'] } },
      });
      expect(fieldError('password')).toBe('Informe a senha.');
      expect(document.activeElement).toBe(input('password'));
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Um ou mais campos são inválidos.',
      );
    });

    it('should remove the server error when the field is edited', async () => {
      await failWith(409, { message: 'Em uso.' });
      await type('email', 'outra@example.com');
      expect(fieldError('email')).toBeUndefined();
    });
  });
});
