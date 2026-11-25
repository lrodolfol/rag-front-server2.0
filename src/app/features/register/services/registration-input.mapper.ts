import { RegisterRequestDto } from '../models/register-request.dto';
import { RegistrationInput } from '../models/registration-input';

/** Valor bruto do formulário, exatamente como digitado. */
export interface RawRegistrationValue {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/** Normaliza o que foi digitado: trim no nome e no e-mail, e-mail em minúsculas, senha intocada. */
export function toRegistrationInput(raw: RawRegistrationValue): RegistrationInput {
  return {
    name: raw.name.trim(),
    email: raw.email.trim().toLowerCase(),
    password: raw.password,
  };
}

export function toRegisterRequestDto(input: RegistrationInput): RegisterRequestDto {
  return { Name: input.name, Email: input.email, Password: input.password };
}
