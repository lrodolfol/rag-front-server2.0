export interface Plan {
  readonly name: string;
  /** Inteiro, evita erro de ponto flutuante. */
  readonly monthlyPriceInCents: number;
  /** Ao menos um benefício. */
  readonly benefits: readonly string[];
  readonly cancellationNote: string;
}
