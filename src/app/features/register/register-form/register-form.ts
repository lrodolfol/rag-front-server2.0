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
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RegistrationField } from '../models/registration-field';
import { RegistrationStatus } from '../models/registration-status';
import {
  EMAIL_LABEL,
  EMAIL_MAX_LENGTH,
  HIDE_PASSWORD_LABEL,
  NAME_LABEL,
  NAME_MAX_LENGTH,
  PASSWORD_HINT_TEXT,
  PASSWORD_LABEL,
  PASSWORD_MAX_LENGTH,
  REGISTER_SUBTITLE_TEXT,
  REGISTER_TITLE_TEXT,
  SHOW_PASSWORD_LABEL,
  SUBMIT_BUTTON_LABEL,
  SUBMITTING_LABEL,
} from '../register-content';
import { toFieldErrorMessage } from '../services/registration-field-message';
import { toRegistrationInput } from '../services/registration-input.mapper';
import { RegistrationStore } from '../state/registration.store';
import { notBlankValidator } from '../validators/not-blank.validator';
import { passwordStrengthValidator } from '../validators/password-strength.validator';
import { trimmedEmailValidator } from '../../../core/forms/trimmed-email.validator';

/** Ordem dos campos na tela (e dos `MatInput` no template): define qual recebe o foco. */
const FIELD_ORDER: readonly RegistrationField[] = ['name', 'email', 'password'];

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatSuffix,
    MatInput,
    MatIconButton,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterForm {
  private readonly store = inject(RegistrationStore);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly inputs = viewChildren(MatInput);
  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, notBlankValidator, Validators.maxLength(NAME_MAX_LENGTH)]],
    email: [
      '',
      [Validators.required, trimmedEmailValidator, Validators.maxLength(EMAIL_MAX_LENGTH)],
    ],
    password: [
      '',
      [Validators.required, passwordStrengthValidator, Validators.maxLength(PASSWORD_MAX_LENGTH)],
    ],
  });

  protected readonly isSubmitting = this.store.isSubmitting;
  protected readonly successMessage = this.store.successMessage;
  protected readonly formErrorMessage = this.store.formErrorMessage;

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

  protected readonly titleText = REGISTER_TITLE_TEXT;
  protected readonly subtitleText = REGISTER_SUBTITLE_TEXT;
  protected readonly nameLabel = NAME_LABEL;
  protected readonly emailLabel = EMAIL_LABEL;
  protected readonly passwordLabel = PASSWORD_LABEL;
  protected readonly passwordHintText = PASSWORD_HINT_TEXT;
  protected readonly submitLabel = SUBMIT_BUTTON_LABEL;
  protected readonly submittingLabel = SUBMITTING_LABEL;
  protected readonly nameMaxLength = NAME_MAX_LENGTH;
  protected readonly emailMaxLength = EMAIL_MAX_LENGTH;
  protected readonly passwordMaxLength = PASSWORD_MAX_LENGTH;

  constructor() {
    // Reactive Forms não aceitam binding de `disabled`: o estado do store é refletido no FormGroup.
    effect(() => {
      const status = this.store.status();
      untracked(() => this.applyStatus(status));
    });
  }

  protected errorMessage(field: RegistrationField): string | null {
    return toFieldErrorMessage(this.form.controls[field].errors);
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.isSubmitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }
    // Lido antes do `disable()` disparado pelo novo status.
    this.store.submit(toRegistrationInput(this.form.getRawValue()));
  }

  private applyStatus(status: RegistrationStatus): void {
    switch (status) {
      case 'submitting':
        this.form.disable();
        return;
      case 'succeeded':
        this.form.enable();
        this.formDirective().resetForm();
        return;
      case 'failed':
        this.form.enable();
        this.applyServerErrors();
        return;
    }
  }

  /** Aplicado só depois do `enable()`, que recalcula os validadores e apagaria estes erros. */
  private applyServerErrors(): void {
    const fieldErrors = this.store.failure()?.fieldErrors ?? {};
    for (const field of FIELD_ORDER) {
      const message = fieldErrors[field];
      if (message !== undefined) {
        this.form.controls[field].setErrors({ server: message });
        this.form.controls[field].markAsTouched();
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      this.focusFirstInvalidField();
    }
  }

  private focusFirstInvalidField(): void {
    const index = FIELD_ORDER.findIndex((field) => this.form.controls[field].invalid);
    if (index >= 0) {
      this.inputs()[index]?.focus();
    }
  }
}
