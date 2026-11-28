/** Falha no envio do cadastro (data-model.md §5). 401 nunca chega aqui (interceptor). */
export type BusinessRegistrationFailure =
  | { readonly kind: 'generic' }
  | { readonly kind: 'invalid-data' }
  | { readonly kind: 'already-registered' };
