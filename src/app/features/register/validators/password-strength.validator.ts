import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PASSWORD_MIN_LENGTH } from '../register-content';

const LETTER_PATTERN = /\p{L}/u;
const DIGIT_PATTERN = /\d/;

/**
 * Senha com pelo menos 8 caracteres, uma letra e um número. Os erros se acumulam
 * (`minLength`, `missingLetter`, `missingNumber`); o valor vazio fica para o `Validators.required`.
 */
export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const errors: ValidationErrors = {};
  if (value.length < PASSWORD_MIN_LENGTH) {
    errors['minLength'] = true;
  }
  if (!LETTER_PATTERN.test(value)) {
    errors['missingLetter'] = true;
  }
  if (!DIGIT_PATTERN.test(value)) {
    errors['missingNumber'] = true;
  }
  return Object.keys(errors).length > 0 ? errors : null;
};
