import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChatMessage } from '../../models/chat-message';

@Component({
  selector: 'app-chat-message-bubble',
  imports: [DatePipe],
  templateUrl: './chat-message-bubble.html',
  styleUrl: './chat-message-bubble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageBubble {
  readonly message = input.required<ChatMessage>();

  protected readonly modifierClasses = computed(() => {
    const { author, kind } = this.message();
    return {
      'bubble--visitor': author === 'visitor',
      'bubble--assistant': author === 'assistant',
      'bubble--warning': kind === 'warning',
      'bubble--error': kind === 'error',
    };
  });
}
