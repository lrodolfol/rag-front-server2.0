import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { CONVERSATION_LABEL } from '../../chatbot-content';
import { ChatMessage } from '../../models/chat-message';
import { ChatMessageBubble } from '../chat-message-bubble/chat-message-bubble';
import { ChatTypingIndicator } from '../chat-typing-indicator/chat-typing-indicator';
import { ChatWelcome } from '../chat-welcome/chat-welcome';

@Component({
  selector: 'app-chat-message-list',
  imports: [ChatWelcome, ChatMessageBubble, ChatTypingIndicator],
  templateUrl: './chat-message-list.html',
  styleUrl: './chat-message-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageList {
  readonly messages = input.required<readonly ChatMessage[]>();
  readonly isWaiting = input.required<boolean>();

  protected readonly conversationLabel = CONVERSATION_LABEL;

  private readonly end = viewChild.required<ElementRef<HTMLElement>>('end');

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.isWaiting();
      // FR-018: rola até a última mensagem (exceção de DOM — plan.md, Complexity Tracking).
      this.end().nativeElement.scrollIntoView({ block: 'end' });
    });
  }
}
