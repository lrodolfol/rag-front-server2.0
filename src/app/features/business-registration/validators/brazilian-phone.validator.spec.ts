import { FormControl } from '@angular/forms';
import { brazilianPhoneValidator } from './brazilian-phone.validator';

describe('brazilianPhoneValidator', () => {
  for (const value of ['', '   ', '1133333333', '11987654321', '(11) 3333-3333', '(11) 98765-4321']) {
    it(`should accept "${value}"`, () => {
      expect(brazilianPhoneValidator(new FormControl(value))).toBeNull();
    });
  }

  for (const value of ['119876543', '(11) 9876', '5511987654321', '+55 11 98765-4321']) {
    it(`should reject "${value}"`, () => {
      expect(brazilianPhoneValidator(new FormControl(value))).toEqual({ phone: true });
    });
  }
});
