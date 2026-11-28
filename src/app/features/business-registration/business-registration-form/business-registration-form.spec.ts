import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';
import { BusinessRegistrationField } from '../models/business-registration-field';
import { BusinessRegistrationInput } from '../models/business-registration-input';
import { BusinessRegistrationForm } from './business-registration-form';

@Component({
  imports: [BusinessRegistrationForm],
  template: `
    <app-business-registration-form
      [submitting]="submitting()"
      [failureMessage]="failureMessage()"
      (submitted)="submitted.push($event)"
      (back)="backCount = backCount + 1"
    />
  `,
})
class TestHost {
  readonly submitting = signal(false);
  readonly failureMessage = signal<string | null>(null);
  readonly submitted: BusinessRegistrationInput[] = [];
  backCount = 0;
}

describe('BusinessRegistrationForm', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let element: HTMLElement;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let dialogResult: boolean | undefined;

  beforeEach(async () => {
    dialogResult = undefined;
    dialog = { open: vi.fn(() => ({ afterClosed: () => of(dialogResult) })) };
    await TestBed.configureTestingModule({
      imports: [TestHost, MatIconTestingModule],
      providers: [{ provide: MatDialog, useValue: dialog }],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function control(field: BusinessRegistrationField): HTMLInputElement | HTMLTextAreaElement {
    return element.querySelector(`[formcontrolname="${field}"]`) as HTMLInputElement;
  }

  function fieldError(field: BusinessRegistrationField): string | undefined {
    return control(field).closest('mat-form-field')?.querySelector('mat-error')?.textContent?.trim();
  }

  function fieldHints(field: BusinessRegistrationField): string[] {
    return Array.from(
      control(field).closest('mat-form-field')?.querySelectorAll('mat-hint') ?? [],
    ).map((hint) => hint.textContent?.trim() ?? '');
  }

  function button(text: string): HTMLButtonElement | undefined {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find((candidate) =>
      candidate.textContent?.includes(text),
    );
  }

  async function type(field: BusinessRegistrationField, value: string, inputType = 'insertText') {
    control(field).value = value;
    control(field).dispatchEvent(new InputEvent('input', { inputType }));
    control(field).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function fillValid(): Promise<void> {
    await type('name', '  pet_amigo ');
    await type('details', 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.');
    await type('address', 'avenida das acacias - 310');
    await type('telephone', '35995678901');
  }

  describe('apresentação e envio (US1)', () => {
    it('should render the three cards with headings and the six labels', () => {
      const headings = Array.from(element.querySelectorAll('mat-card h2')).map((heading) =>
        heading.textContent?.trim(),
      );
      expect(headings).toEqual(['Informações básicas', 'Endereço', 'Contato']);
      const labels = Array.from(element.querySelectorAll('mat-label')).map((label) =>
        label.textContent?.trim(),
      );
      expect(labels).toEqual([
        'Nome do negócio',
        'Descrição rápida',
        'Descrição completa',
        'Endereço completo',
        'E-mail',
        'Telefone',
      ]);
      expect(fieldHints('details')).toContain(
        'Esta descrição é usada pela IA para encontrar você quando alguém perguntar algo relacionado.',
      );
      expect(button('Cadastrar negócio')?.type).toBe('submit');
    });

    it('should configure the input attributes', () => {
      expect(control('name').getAttribute('maxlength')).toBe('100');
      expect(control('name').getAttribute('autocomplete')).toBe('organization');
      expect(control('name').required).toBe(true);
      expect(control('details').tagName).toBe('TEXTAREA');
      expect(control('details').getAttribute('maxlength')).toBe('1000');
      expect(control('address').getAttribute('autocomplete')).toBe('street-address');
      expect(control('email').getAttribute('type')).toBe('email');
      expect(control('telephone').getAttribute('type')).toBe('tel');
      expect(control('telephone').getAttribute('inputmode')).toBe('numeric');
      expect(control('telephone').getAttribute('maxlength')).toBeNull();
    });

    it('should emit the normalized input on a valid submit', async () => {
      await fillValid();
      await submit();
      expect(host.submitted).toEqual([
        {
          name: 'pet_amigo',
          description: null,
          details: 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.',
          address: 'avenida das acacias - 310',
          email: null,
          telephone: '35995678901',
        },
      ]);
    });

    it('should lock the form, the buttons and show the spinner while submitting', async () => {
      host.submitting.set(true);
      await fixture.whenStable();
      for (const field of ['name', 'details', 'telephone'] as const) {
        expect(control(field).disabled).toBe(true);
      }
      expect(button('Cadastrar negócio')?.disabled).toBe(true);
      expect(button('Voltar')?.disabled).toBe(true);
      expect(element.querySelector('mat-progress-spinner')?.getAttribute('aria-label')).toBe(
        'Cadastrando negócio',
      );
    });

    it('should emit back without a dialog when nothing was typed', async () => {
      await type('name', '   ');
      button('Voltar')?.click();
      await fixture.whenStable();
      expect(dialog.open).not.toHaveBeenCalled();
      expect(host.backCount).toBe(1);
    });

    it('should ask before discarding typed data', async () => {
      await type('address', 'Rua A');
      dialogResult = false;
      button('Voltar')?.click();
      await fixture.whenStable();
      expect(dialog.open).toHaveBeenCalledTimes(1);
      expect(host.backCount).toBe(0);

      dialogResult = true;
      button('Voltar')?.click();
      await fixture.whenStable();
      expect(host.backCount).toBe(1);
    });
  });

  describe('validação (US2)', () => {
    it('should flag the required fields, not emit and focus the name', async () => {
      await submit();
      expect(fieldError('name')).toBe('Campo obrigatório.');
      expect(fieldError('details')).toBe('Campo obrigatório.');
      expect(fieldError('address')).toBe('Campo obrigatório.');
      expect(fieldError('description')).toBeUndefined();
      expect(fieldError('email')).toBeUndefined();
      expect(fieldError('telephone')).toBeUndefined();
      expect(host.submitted).toEqual([]);
      expect(document.activeElement).toBe(control('name'));
    });

    it('should focus the first invalid field in order', async () => {
      await type('name', 'Pet Amigo');
      await submit();
      expect(document.activeElement).toBe(control('details'));
    });

    it('should treat spaces only as empty', async () => {
      await type('name', '    ');
      expect(fieldError('name')).toBe('Campo obrigatório.');
    });

    it('should explain the trimmed minimum length', async () => {
      await type('details', '  curto demais  ');
      expect(fieldError('details')).toBe('Informe pelo menos 20 caracteres.');
      await type('name', ' a ');
      expect(fieldError('name')).toBe('Informe pelo menos 2 caracteres.');
    });

    it('should flag an invalid e-mail after leaving the field', async () => {
      await type('email', 'abc');
      expect(fieldError('email')).toBe('Informe um e-mail válido.');
    });

    it('should mask the phone while typing and stop at 11 digits', async () => {
      await type('telephone', '11987654321');
      expect(control('telephone').value).toBe('(11) 98765-4321');
      expect(fieldError('telephone')).toBeUndefined();

      await type('telephone', '(11) 98765-43219');
      expect(control('telephone').value).toBe('(11) 98765-4321');
    });

    it('should keep a pasted phone longer than 11 digits and flag it', async () => {
      await type('telephone', '+55 11 98765-4321', 'insertFromPaste');
      expect(control('telephone').value).toBe('5511987654321');
      expect(fieldError('telephone')).toBe('Informe um telefone válido com DDD.');
    });

    it('should flag an incomplete phone', async () => {
      await type('telephone', '1198765');
      expect(control('telephone').value).toBe('(11) 9876-5');
      expect(fieldError('telephone')).toBe('Informe um telefone válido com DDD.');
    });

    it('should count the characters of both descriptions', async () => {
      expect(fieldHints('description')).toContain('0/150');
      expect(fieldHints('details')).toContain('0/1000');
      await type('description', 'Você bem alimentado');
      expect(fieldHints('description')).toContain('19/150');
    });
  });

  describe('falha no envio (US5)', () => {
    it('should keep the values, re-enable and show the alert after a failure', async () => {
      await fillValid();
      host.submitting.set(true);
      await fixture.whenStable();
      host.submitting.set(false);
      host.failureMessage.set('Verifique os dados informados e tente novamente.');
      await fixture.whenStable();

      expect(control('name').disabled).toBe(false);
      expect(control('name').value).toBe('  pet_amigo ');
      expect(control('telephone').value).toBe('(35) 99567-8901');
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
        'Verifique os dados informados e tente novamente.',
      );
      for (const field of ['name', 'details', 'address', 'email', 'telephone'] as const) {
        expect(fieldError(field)).toBeUndefined();
      }
    });
  });
});
