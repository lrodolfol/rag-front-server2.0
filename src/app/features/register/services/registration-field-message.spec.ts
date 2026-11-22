import {
  INVALID_EMAIL_TEXT,
  PASSWORD_MISSING_LETTER_TEXT,
  PASSWORD_MISSING_NUMBER_TEXT,
  PASSWORD_TOO_SHORT_TEXT,
  REQUIRED_FIELD_TEXT,
} from '../register-content';
import { toFieldErrorMessage } from './registration-field-message';

describe('toFieldErrorMessage', () => {
  it('should return null when there are no errors', () => {
    expect(toFieldErrorMessage(null)).toBeNull();
  });

  it('should prefer the server message over every other error', () => {
    expect(toFieldErrorMessage({ server: 'X', required: true })).toBe('X');
  });

  it('should show the required text for empty and blank values', () => {
    expect(toFieldErrorMessage({ required: true })).toBe(REQUIRED_FIELD_TEXT);
    expect(toFieldErrorMessage({ blank: true })).toBe(REQUIRED_FIELD_TEXT);
  });

  it('should show the invalid e-mail text', () => {
    expect(toFieldErrorMessage({ email: true })).toBe(INVALID_EMAIL_TEXT);
  });

  it('should show one password message at a time, length first', () => {
    expect(toFieldErrorMessage({ minLength: true, missingNumber: true })).toBe(
      PASSWORD_TOO_SHORT_TEXT,
    );
    expect(toFieldErrorMessage({ missingLetter: true })).toBe(PASSWORD_MISSING_LETTER_TEXT);
    expect(toFieldErrorMessage({ missingNumber: true })).toBe(PASSWORD_MISSING_NUMBER_TEXT);
  });

  it('should return null for maxlength, which the input attribute makes unreachable', () => {
    expect(toFieldErrorMessage({ maxlength: { requiredLength: 100, actualLength: 101 } })).toBeNull();
  });
});
