import { toLoginFieldErrorMessage } from './login-field-message';

describe('toLoginFieldErrorMessage', () => {
  it('should return null without errors', () => {
    expect(toLoginFieldErrorMessage(null)).toBeNull();
  });

  it('should explain required and invalid e-mail', () => {
    expect(toLoginFieldErrorMessage({ required: true })).toBe('Campo obrigatório');
    expect(toLoginFieldErrorMessage({ email: true })).toBe('Informe um e-mail válido');
  });

  it('should prioritize required', () => {
    expect(toLoginFieldErrorMessage({ required: true, email: true })).toBe('Campo obrigatório');
  });

  it('should ignore maxlength (unreachable through the maxlength attribute)', () => {
    expect(toLoginFieldErrorMessage({ maxlength: { requiredLength: 64, actualLength: 65 } })).toBeNull();
  });
});
