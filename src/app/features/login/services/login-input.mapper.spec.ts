import { toLoginInput, toLoginRequestDto } from './login-input.mapper';

describe('login-input.mapper', () => {
  it('should trim and lowercase the e-mail and keep the password intact', () => {
    expect(toLoginInput({ email: '  Maria@Example.COM ', password: ' Senha 1 ' })).toEqual({
      email: 'maria@example.com',
      password: ' Senha 1 ',
    });
  });

  it('should convert the input into the PascalCase DTO', () => {
    expect(toLoginRequestDto({ email: 'maria@example.com', password: 'NovaSenha123' })).toEqual({
      Email: 'maria@example.com',
      Password: 'NovaSenha123',
    });
  });
});
