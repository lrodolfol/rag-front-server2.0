import { HttpErrorResponse } from '@angular/common/http';
import { GENERIC_ERROR_TEXT, RATE_LIMIT_FALLBACK_TEXT } from '../chatbot-content';
import { ChatFailure } from '../models/chat-failure';

const PLAIN_TEXT_MAX_LENGTH = 300;
const TOO_MANY_REQUESTS = 429;

const GENERIC_FAILURE: ChatFailure = { kind: 'generic', text: GENERIC_ERROR_TEXT };

/** Converte qualquer erro do fluxo de chat em um aviso em linguagem natural (R-04). */
export function mapChatError(error: unknown): ChatFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC_FAILURE;
  }
  const readableText = extractReadableText(error.error);
  if (error.status === TOO_MANY_REQUESTS) {
    return { kind: 'rate-limited', text: readableText ?? RATE_LIMIT_FALLBACK_TEXT };
  }
  if (error.status !== 0 && readableText !== null) {
    return { kind: 'server-message', text: readableText };
  }
  return GENERIC_FAILURE;
}

function extractReadableText(body: unknown): string | null {
  if (typeof body === 'string') {
    const parsed = parseJson(body);
    if (parsed.isJson) {
      return readMessageField(parsed.value);
    }
    return isReadablePlainText(body) ? body.trim() : null;
  }
  return readMessageField(body);
}

function parseJson(text: string): { isJson: true; value: unknown } | { isJson: false } {
  try {
    return { isJson: true, value: JSON.parse(text) as unknown };
  } catch {
    return { isJson: false };
  }
}

function readMessageField(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  for (const field of ['message', 'detail']) {
    const candidate: unknown = (value as Record<string, unknown>)[field];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

function isReadablePlainText(text: string): boolean {
  const length = text.trim().length;
  return length > 0 && length <= PLAIN_TEXT_MAX_LENGTH && !text.includes('<');
}
