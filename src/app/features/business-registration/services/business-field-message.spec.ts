import { businessFieldMessage } from './business-field-message';

describe('businessFieldMessage', () => {
  it('should return null without errors', () => {
    expect(businessFieldMessage(null)).toBeNull();
    expect(businessFieldMessage({ unknown: true })).toBeNull();
  });

  it('should treat required and blank as a required field', () => {
    expect(businessFieldMessage({ required: true })).toBe('Campo obrigatório.');
    expect(businessFieldMessage({ blank: true })).toBe('Campo obrigatório.');
  });

  it('should explain the minimum and maximum lengths', () => {
    expect(
      businessFieldMessage({ trimmedMinLength: { requiredLength: 20, actualLength: 3 } }),
    ).toBe('Informe pelo menos 20 caracteres.');
    expect(businessFieldMessage({ maxlength: { requiredLength: 150, actualLength: 151 } })).toBe(
      'Use no máximo 150 caracteres.',
    );
  });

  it('should explain invalid e-mail and phone', () => {
    expect(businessFieldMessage({ email: true })).toBe('Informe um e-mail válido.');
    expect(businessFieldMessage({ phone: true })).toBe('Informe um telefone válido com DDD.');
  });

  it('should show one message at a time, by priority', () => {
    expect(businessFieldMessage({ blank: true, maxlength: { requiredLength: 5 } })).toBe(
      'Campo obrigatório.',
    );
    expect(
      businessFieldMessage({ maxlength: { requiredLength: 150 }, email: true }),
    ).toBe('Use no máximo 150 caracteres.');
  });
});
