import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TYPING_INDICATOR_LABEL } from '../../chatbot-content';

@Component({
  selector: 'app-chat-typing-indicator',
  templateUrl: './chat-typing-indicator.html',
  styleUrl: './chat-typing-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTypingIndicator {
  protected readonly typingLabel = TYPING_INDICATOR_LABEL;
}
