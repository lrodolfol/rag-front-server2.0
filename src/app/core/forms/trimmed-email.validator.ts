import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** `Validators.email` aplicado ao valor sem espaços nas pontas (o envio faz o mesmo trim). */
export const trimmedEmailValidator: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : Validators.email(new FormControl(trimmed));
};
