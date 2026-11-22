import { FormControl } from '@angular/forms';
import { trimmedEmailValidator } from './trimmed-email.validator';

describe('trimmedEmailValidator', () => {
  it('should flag an incomplete e-mail', () => {
    expect(trimmedEmailValidator(new FormControl('maria@'))).toEqual({ email: true });
  });

  it('should accept a valid e-mail surrounded by spaces', () => {
    expect(trimmedEmailValidator(new FormControl(' maria@example.com '))).toBeNull();
  });

  it('should leave an empty value to the required validator', () => {
    expect(trimmedEmailValidator(new FormControl(''))).toBeNull();
  });
});
