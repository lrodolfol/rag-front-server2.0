import {
  BusinessRegistrationFormValue,
  toBusinessRegistrationInput,
  toRegisterBusinessRequestDto,
} from './business-registration-input.mapper';

const FORM_VALUE: BusinessRegistrationFormValue = {
  name: '  pet_amigo  ',
  description: ' pet shop e cuidados para animais ',
  details: '  O Pet Amigo oferece banho e tosa.  ',
  address: ' avenida das acacias - 310 ',
  email: ' atendimento@petamigo.com.br ',
  telephone: '(35) 99567-8901',
};

describe('business-registration-input.mapper', () => {
  describe('toBusinessRegistrationInput', () => {
    it('should trim every field and keep only the phone digits', () => {
      expect(toBusinessRegistrationInput(FORM_VALUE)).toEqual({
        name: 'pet_amigo',
        description: 'pet shop e cuidados para animais',
        details: 'O Pet Amigo oferece banho e tosa.',
        address: 'avenida das acacias - 310',
        email: 'atendimento@petamigo.com.br',
        telephone: '35995678901',
      });
    });

    it('should turn empty or blank optional fields into null', () => {
      const input = toBusinessRegistrationInput({
        ...FORM_VALUE,
        description: '   ',
        email: '',
        telephone: '() -',
      });
      expect(input.description).toBeNull();
      expect(input.email).toBeNull();
      expect(input.telephone).toBeNull();
    });
  });

  describe('toRegisterBusinessRequestDto', () => {
    it('should copy the input and rename description to descricao and details to detalhes', () => {
      const input = toBusinessRegistrationInput({ ...FORM_VALUE, email: '' });
      const dto = toRegisterBusinessRequestDto(input);
      expect(dto).toEqual({
        name: 'pet_amigo',
        descricao: 'pet shop e cuidados para animais',
        email: null,
        address: 'avenida das acacias - 310',
        telephone: '35995678901',
        detalhes: 'O Pet Amigo oferece banho e tosa.',
      });
      expect(dto).not.toHaveProperty('description');
      expect(dto).not.toHaveProperty('details');
    });

    it('should send descricao as null when the quick description is blank', () => {
      const input = toBusinessRegistrationInput({ ...FORM_VALUE, description: '   ' });
      expect(toRegisterBusinessRequestDto(input).descricao).toBeNull();
    });
  });
});
