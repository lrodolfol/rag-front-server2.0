import { FormControl } from '@angular/forms';
import { passwordStrengthValidator } from './password-strength.validator';

describe('passwordStrengthValidator', () => {
  it('should flag a password without numbers', () => {
    expect(passwordStrengthValidator(new FormControl('abcdefgh'))).toEqual({
      missingNumber: true,
    });
  });

  it('should flag a password shorter than 8 characters', () => {
    expect(passwordStrengthValidator(new FormControl('1234567'))).toEqual(
      expect.objectContaining({ minLength: true }),
    );
  });

  it('should flag a password without letters', () => {
    expect(passwordStrengthValidator(new FormControl('12345678'))).toEqual({
      missingLetter: true,
    });
  });

  it('should accept letters and numbers with at least 8 characters', () => {
    expect(passwordStrengthValidator(new FormControl('senha123'))).toBeNull();
  });

  it('should accept accented letters', () => {
    expect(passwordStrengthValidator(new FormControl('ãéíóú123'))).toBeNull();
  });

  it('should leave an empty value to the required validator', () => {
    expect(passwordStrengthValidator(new FormControl(''))).toBeNull();
  });
});
