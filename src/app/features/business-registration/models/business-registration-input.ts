/** Valores do formulário normalizados (`trim`) — data-model.md §2. */
export interface BusinessRegistrationInput {
  readonly name: string;
  readonly description: string | null;
  readonly details: string;
  readonly address: string;
  readonly email: string | null;
  /**
   * Só dígitos, sem máscara (10 ou 11, ex.: `35995678901`); `null` se sem dígitos.
   * A máscara existe apenas no campo da tela.
   */
  readonly telephone: string | null;
}
