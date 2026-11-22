import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ASSISTANT_NAME, ASSISTANT_STATUS_TEXT } from '../../chatbot-content';

@Component({
  selector: 'app-chat-window-header',
  imports: [MatIcon],
  templateUrl: './chat-window-header.html',
  styleUrl: './chat-window-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowHeader {
  protected readonly assistantName = ASSISTANT_NAME;
  protected readonly statusText = ASSISTANT_STATUS_TEXT;
}
