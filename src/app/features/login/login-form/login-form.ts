import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  FormGroupDirective,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { trimmedEmailValidator } from '../../../core/forms/trimmed-email.validator';
import {
  EMAIL_LABEL,
  EMAIL_MAX_LENGTH,
  HIDE_PASSWORD_LABEL,
  LOGIN_HEADING,
  LOGIN_SUBHEADING,
  PASSWORD_LABEL,
  PASSWORD_MAX_LENGTH,
  SHOW_PASSWORD_LABEL,
  SUBMIT_LABEL,
  SUBMITTING_LABEL,
} from '../login-content';
import { LOGIN_FIELDS, LoginField } from '../models/login-field';
import { LoginStatus } from '../models/login-status';
import { toLoginFieldErrorMessage } from '../services/login-field-message';
import { toLoginInput } from '../services/login-input.mapper';
import { LoginStore } from '../state/login.store';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatIconButton,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  protected readonly store = inject(LoginStore);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly inputs = viewChildren(MatInput);
  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, trimmedEmailValidator, Validators.maxLength(EMAIL_MAX_LENGTH)]],
    password: ['', [Validators.required, Validators.maxLength(PASSWORD_MAX_LENGTH)]],
  });

  /** Campos, toggle e botão ficam bloqueados durante o envio e após o sucesso (até navegar). */
  protected readonly isLocked = computed(() => {
    const status = this.store.status();
    return status === 'submitting' || status === 'succeeded';
  });

  protected readonly passwordVisible = signal(false);
  protected readonly passwordInputType = computed(() =>
    this.passwordVisible() ? 'text' : 'password',
  );
  protected readonly passwordToggleIcon = computed(() =>
    this.passwordVisible() ? 'visibility_off' : 'visibility',
  );
  protected readonly passwordToggleLabel = computed(() =>
    this.passwordVisible() ? HIDE_PASSWORD_LABEL : SHOW_PASSWORD_LABEL,
  );

  protected readonly headingText = LOGIN_HEADING;
  protected readonly subheadingText = LOGIN_SUBHEADING;
  protected readonly emailLabel = EMAIL_LABEL;
  protected readonly passwordLabel = PASSWORD_LABEL;
  protected readonly submitLabel = SUBMIT_LABEL;
  protected readonly submittingLabel = SUBMITTING_LABEL;
  protected readonly emailMaxLength = EMAIL_MAX_LENGTH;
  protected readonly passwordMaxLength = PASSWORD_MAX_LENGTH;

  constructor() {
    // Reactive Forms não aceitam binding de `disabled`: o estado do store é refletido no FormGroup.
    effect(() => {
      const status = this.store.status();
      untracked(() => this.applyStatus(status));
    });
  }

  protected errorMessage(field: LoginField): string | null {
    return toLoginFieldErrorMessage(this.form.controls[field].errors);
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.isLocked()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }
    // Lido antes do `disable()` disparado pelo novo status.
    this.store.submit(toLoginInput(this.form.getRawValue()));
  }

  private applyStatus(status: LoginStatus): void {
    switch (status) {
      case 'submitting':
      case 'succeeded':
        this.form.disable({ emitEvent: false });
        return;
      case 'failed':
        this.form.enable({ emitEvent: false });
        // A senha nunca fica na tela após uma falha. `resetForm` também zera o `submitted` da
        // diretiva, senão o Material mostraria "Campo obrigatório" na senha recém-apagada.
        this.formDirective().resetForm({ email: this.form.controls.email.value, password: '' });
        return;
    }
  }

  private focusFirstInvalidField(): void {
    const index = LOGIN_FIELDS.findIndex((field) => this.form.controls[field].invalid);
    if (index >= 0) {
      this.inputs()[index]?.focus();
    }
  }
}
