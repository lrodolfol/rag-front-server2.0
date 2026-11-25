import { Business } from './business';

/** Resultado da consulta do negócio do cliente, produzido pelo mapper (research R-04). */
export type BusinessLoadResult =
  | { readonly kind: 'found'; readonly business: Business }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'invalid' };
