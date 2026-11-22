import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WELCOME_TEXT, WELCOME_TITLE } from '../../chatbot-content';

@Component({
  selector: 'app-chat-welcome',
  templateUrl: './chat-welcome.html',
  styleUrl: './chat-welcome.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWelcome {
  protected readonly welcomeTitle = WELCOME_TITLE;
  protected readonly welcomeText = WELCOME_TEXT;
}
