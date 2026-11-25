import { toRegisterRequestDto, toRegistrationInput } from './registration-input.mapper';

describe('registration input mapper', () => {
  it('should trim the name', () => {
    expect(toRegistrationInput({ name: '  Maria  ', email: 'a@b.com', password: 'x' }).name).toBe(
      'Maria',
    );
  });

  it('should trim the e-mail and convert it to lower case', () => {
    expect(
      toRegistrationInput({ name: 'Maria', email: ' Maria@Example.COM ', password: 'x' }).email,
    ).toBe('maria@example.com');
  });

  it('should keep the password exactly as typed, spaces included', () => {
    expect(
      toRegistrationInput({ name: 'Maria', email: 'a@b.com', password: ' senha 123 ' }).password,
    ).toBe(' senha 123 ');
  });

  it('should convert the input to the PascalCase request DTO', () => {
    expect(
      toRegisterRequestDto({ name: 'Maria', email: 'maria@example.com', password: 'senha123' }),
    ).toEqual({ Name: 'Maria', Email: 'maria@example.com', Password: 'senha123' });
  });
});
