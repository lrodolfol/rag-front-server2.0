export type ChatFailureKind = 'rate-limited' | 'server-message' | 'generic';

export interface ChatFailure {
  readonly kind: ChatFailureKind;
  /** Sempre em linguagem natural, sem status/código/stack. */
  readonly text: string;
}
