import { LoginInput } from '../models/login-input';
import { LoginRequestDto } from '../models/login-request.dto';

/** E-mail com `trim` + minúsculas; senha exatamente como digitada. */
export function toLoginInput(raw: { email: string; password: string }): LoginInput {
  return { email: raw.email.trim().toLowerCase(), password: raw.password };
}

export function toLoginRequestDto(input: LoginInput): LoginRequestDto {
  return { Email: input.email, Password: input.password };
}
