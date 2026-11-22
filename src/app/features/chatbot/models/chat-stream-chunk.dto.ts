export interface ChatStreamChunkDto {
  readonly message: string;
}

export function isChatStreamChunk(value: unknown): value is ChatStreamChunkDto {
  if (typeof value !== 'object' || value === null || !('message' in value)) {
    return false;
  }
  const { message } = value;
  return typeof message === 'string' && message.trim().length > 0;
}
