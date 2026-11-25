/**
 * Negócio do cliente exibido na área do cliente (modelo de apresentação).
 * `name` já vem com `trim()` e nunca é vazio. Sem imagem: a API não a fornece (research R-05).
 */
export interface Business {
  readonly name: string;
}
