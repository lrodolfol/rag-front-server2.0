import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Mínimo de caracteres medido sobre o valor com `trim` (o envio faz o mesmo trim). O valor vazio
 * fica para `Validators.required`/`notBlankValidator`.
 */
export function trimmedMinLength(minLength: number): ValidatorFn {
  return (control: AbstractControl<unknown>): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string') {
      return null;
    }
    const actualLength = value.trim().length;
    if (actualLength === 0 || actualLength >= minLength) {
      return null;
    }
    return { trimmedMinLength: { requiredLength: minLength, actualLength } };
  };
}
