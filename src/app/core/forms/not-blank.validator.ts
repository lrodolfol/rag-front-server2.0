import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Recusa valores só com espaços. O valor vazio fica para o `Validators.required`. */
export const notBlankValidator: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value.trim().length === 0 ? { blank: true } : null;
};
