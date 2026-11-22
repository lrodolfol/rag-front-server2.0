export type ChatMessageAuthor = 'visitor' | 'assistant';

/** `warning` = limite de uso; `error` = demais falhas e "sem resultados". */
export type ChatMessageKind = 'text' | 'warning' | 'error';

export interface ChatMessage {
  readonly id: number;
  readonly author: ChatMessageAuthor;
  readonly kind: ChatMessageKind;
  readonly text: string;
  readonly sentAt: Date;
}
