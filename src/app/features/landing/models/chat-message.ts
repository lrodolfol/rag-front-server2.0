export interface ChatMessage {
  readonly author: 'user' | 'assistant';
  readonly text: string;
}
