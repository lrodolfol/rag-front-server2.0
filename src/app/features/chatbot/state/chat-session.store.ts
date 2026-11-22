import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { EMPTY_RESULT_TEXT, MESSAGE_MAX_LENGTH } from '../chatbot-content';
import { ChatMessage, ChatMessageAuthor, ChatMessageKind } from '../models/chat-message';
import { ChatStatus } from '../models/chat-status';
import { ChatStreamEvent } from '../models/chat-stream-event';
import { ChatApiService } from '../services/chat-api.service';
import { mapChatError } from '../services/chat-error.mapper';

/** Estado e regras da conversa. Provido pela página: a sessão morre com ela (R-07). */
@Injectable()
export class ChatSessionStore {
  private readonly api = inject(ChatApiService);
  private readonly destroyRef = inject(DestroyRef);

  // Exige contexto seguro (HTTPS ou localhost) — ver plan.md, Technical Context.
  readonly userCode = crypto.randomUUID();

  private readonly messagesState = signal<readonly ChatMessage[]>([]);
  private readonly statusState = signal<ChatStatus>('idle');
  private nextMessageId = 1;

  readonly messages = this.messagesState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly hasStarted = computed(() => this.messages().length > 0);
  readonly canSend = computed(() => this.status() === 'idle');
  readonly isWaiting = computed(() => this.status() === 'waiting');
  readonly isBlocked = computed(() => this.status() === 'blocked');

  send(text: string): void {
    const trimmed = text.trim();
    if (!this.canSend() || trimmed.length === 0 || trimmed.length > MESSAGE_MAX_LENGTH) {
      return;
    }
    this.addMessage('visitor', 'text', trimmed);
    this.statusState.set('waiting');

    let answerCount = 0;
    this.api
      .send({ message: trimmed, user_code: this.userCode })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: unknown) => {
          this.fail(error);
          return EMPTY;
        }),
      )
      .subscribe((event: ChatStreamEvent) => {
        // Erros lançados aqui não passam pelo catchError acima; por isso a guarda local.
        try {
          if (event.type === 'chunk') {
            this.addMessage('assistant', 'text', event.text);
            answerCount++;
            return;
          }
          if (answerCount === 0) {
            this.addMessage('assistant', 'error', EMPTY_RESULT_TEXT);
          }
          this.statusState.set('idle');
        } catch (error: unknown) {
          this.fail(error);
        }
      });
  }

  private fail(error: unknown): void {
    const failure = mapChatError(error);
    const isRateLimited = failure.kind === 'rate-limited';
    this.addMessage('assistant', isRateLimited ? 'warning' : 'error', failure.text);
    this.statusState.set(isRateLimited ? 'blocked' : 'idle');
  }

  private addMessage(author: ChatMessageAuthor, kind: ChatMessageKind, text: string): void {
    const message: ChatMessage = {
      id: this.nextMessageId++,
      author,
      kind,
      text,
      sentAt: new Date(),
    };
    this.messagesState.update((messages) => [...messages, message]);
  }
}
