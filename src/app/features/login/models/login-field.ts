export type LoginField = 'email' | 'password';

/** Ordem dos campos na tela (e dos `MatInput` no template): define qual recebe o foco. */
export const LOGIN_FIELDS: readonly LoginField[] = ['email', 'password'];
