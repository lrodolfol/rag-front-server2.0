import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChildren,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { notBlankValidator } from '../../../core/forms/not-blank.validator';
import { trimmedEmailValidator } from '../../../core/forms/trimmed-email.validator';
import * as content from '../business-registration-content';
import { DiscardChangesDialog } from '../discard-changes-dialog/discard-changes-dialog';
import { BusinessRegistrationField, FIELD_ORDER } from '../models/business-registration-field';
import { BusinessRegistrationInput } from '../models/business-registration-input';
import { businessFieldMessage } from '../services/business-field-message';
import { toBusinessRegistrationInput } from '../services/business-registration-input.mapper';
import { extractDigits, formatPhone } from '../services/phone-mask';
import { brazilianPhoneValidator } from '../validators/brazilian-phone.validator';
import { trimmedMinLength } from '../validators/trimmed-min-length.validator';

const PASTE_INPUT_TYPES: ReadonlySet<string> = new Set(['insertFromPaste', 'insertFromDrop']);

@Component({
  selector: 'app-business-registration-form',
  imports: [
    ReactiveFormsModule,
    CdkTextareaAutosize,
    MatCard,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: './business-registration-form.html',
  styleUrl: './business-registration-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessRegistrationForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly inputs = viewChildren(MatInput);

  readonly submitting = input(false);
  readonly failureMessage = input<string | null>(null);
  readonly submitted = output<BusinessRegistrationInput>();
  readonly back = output<void>();

  protected readonly text = content;

  protected readonly form = this.formBuilder.group({
    name: ['', requiredText(content.NAME_MIN_LENGTH, content.NAME_MAX_LENGTH)],
    description: ['', [Validators.maxLength(content.DESCRIPTION_MAX_LENGTH)]],
    details: ['', requiredText(content.DETAILS_MIN_LENGTH, content.DETAILS_MAX_LENGTH)],
    address: ['', requiredText(content.ADDRESS_MIN_LENGTH, content.ADDRESS_MAX_LENGTH)],
    email: ['', [trimmedEmailValidator, Validators.maxLength(content.EMAIL_MAX_LENGTH)]],
    telephone: ['', [brazilianPhoneValidator]],
  });

  constructor() {
    // Reactive Forms não aceitam binding de `disabled`: o envio em curso é refletido no FormGroup.
    // `enable()` preserva os valores digitados (falha de envio) e nunca aplica erros do serviço.
    effect(() => {
      const submitting = this.submitting();
      untracked(() => (submitting ? this.form.disable() : this.form.enable()));
    });
  }

  protected errorMessage(field: BusinessRegistrationField): string | null {
    return businessFieldMessage(this.form.controls[field].errors);
  }

  protected characterCount(field: BusinessRegistrationField, maxLength: number): string {
    return `${this.form.controls[field].value.length}/${maxLength}`;
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }
    this.submitted.emit(toBusinessRegistrationInput(this.form.getRawValue()));
  }

  /** Máscara do telefone: digitação para em 11 dígitos; colagem maior é mantida (e inválida). */
  protected formatTelephone(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const pasted = event instanceof InputEvent && PASTE_INPUT_TYPES.has(event.inputType);
    const digits = extractDigits(target.value);
    const kept = pasted ? digits : digits.slice(0, content.TELEPHONE_MAX_DIGITS);
    const control = this.form.controls.telephone;
    control.setValue(formatPhone(kept), { emitEvent: false });
    control.updateValueAndValidity();
  }

  protected async goBack(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    if (!this.hasContent()) {
      this.back.emit();
      return;
    }
    const dialogRef = this.dialog.open<DiscardChangesDialog, unknown, boolean>(DiscardChangesDialog);
    if ((await firstValueFrom(dialogRef.afterClosed())) === true) {
      this.back.emit();
    }
  }

  private hasContent(): boolean {
    return Object.values(this.form.getRawValue()).some((value) => value.trim().length > 0);
  }

  private focusFirstInvalidField(): void {
    const index = FIELD_ORDER.findIndex((field) => this.form.controls[field].invalid);
    if (index >= 0) {
      this.inputs()[index]?.focus();
    }
  }
}

/** Texto obrigatório: não vazio, não só espaços, entre `minLength` (com trim) e `maxLength`. */
function requiredText(minLength: number, maxLength: number): ValidatorFn[] {
  return [
    Validators.required,
    notBlankValidator,
    trimmedMinLength(minLength),
    Validators.maxLength(maxLength),
  ];
}
