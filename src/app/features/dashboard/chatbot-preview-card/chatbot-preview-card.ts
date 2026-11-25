import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import {
  CHATBOT_PREVIEW_HEADING,
  CHATBOT_PREVIEW_TEXT,
  OPEN_CHAT_LABEL,
} from '../dashboard-content';

@Component({
  selector: 'app-chatbot-preview-card',
  imports: [MatCard, MatIcon, MatButton, RouterLink],
  templateUrl: './chatbot-preview-card.html',
  styleUrl: './chatbot-preview-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotPreviewCard {
  protected readonly heading = CHATBOT_PREVIEW_HEADING;
  protected readonly text = CHATBOT_PREVIEW_TEXT;
  protected readonly openChatLabel = OPEN_CHAT_LABEL;
  protected readonly chatbotLink = toRouterLink(AppPaths.chatbot);
}
