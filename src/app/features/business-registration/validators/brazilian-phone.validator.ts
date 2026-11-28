import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { extractDigits } from '../services/phone-mask';

/** Telefone opcional: sem dígitos é válido; senão exige 10 ou 11 dígitos (DDD + número). */
export const brazilianPhoneValidator: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string') {
    return null;
  }
  const length = extractDigits(value).length;
  return length === 0 || length === 10 || length === 11 ? null : { phone: true };
};
