import { BusinessRegistrationField } from '../models/business-registration-field';
import { BusinessRegistrationInput } from '../models/business-registration-input';
import { RegisterBusinessRequestDto } from '../models/register-business-request.dto';
import { extractDigits } from './phone-mask';

export type BusinessRegistrationFormValue = Readonly<Record<BusinessRegistrationField, string>>;

/** Formulário → valores normalizados: `trim`, opcionais vazios → `null`, telefone só com dígitos. */
export function toBusinessRegistrationInput(
  formValue: BusinessRegistrationFormValue,
): BusinessRegistrationInput {
  const telephone = extractDigits(formValue.telephone);
  return {
    name: formValue.name.trim(),
    description: emptyToNull(formValue.description.trim()),
    details: formValue.details.trim(),
    address: formValue.address.trim(),
    email: emptyToNull(formValue.email.trim()),
    telephone: emptyToNull(telephone),
  };
}

/** Valores normalizados → corpo do `POST` (`description` → `descricao`, `details` → `detalhes`). */
export function toRegisterBusinessRequestDto(
  input: BusinessRegistrationInput,
): RegisterBusinessRequestDto {
  return {
    name: input.name,
    descricao: input.description,
    email: input.email,
    address: input.address,
    telephone: input.telephone,
    detalhes: input.details,
  };
}

function emptyToNull(value: string): string | null {
  return value.length === 0 ? null : value;
}
