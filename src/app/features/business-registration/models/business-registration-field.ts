export type BusinessRegistrationField =
  | 'name'
  | 'description'
  | 'details'
  | 'address'
  | 'email'
  | 'telephone';

/** Ordem dos campos na tela (e dos `MatInput` no template): define qual recebe o foco. */
export const FIELD_ORDER: readonly BusinessRegistrationField[] = [
  'name',
  'description',
  'details',
  'address',
  'email',
  'telephone',
];
