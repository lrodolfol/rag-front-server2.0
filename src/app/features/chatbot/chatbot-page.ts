import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationItem } from '../../core/layout/navigation-item';
import { SiteHeader } from '../../core/layout/site-header/site-header';
import { ChatWindow } from './chat-window/chat-window';
import { CHATBOT_NAVIGATION_ITEMS } from './chatbot-content';
import { ChatSessionStore } from './state/chat-session.store';

@Component({
  selector: 'app-chatbot-page',
  imports: [SiteHeader, ChatWindow],
  // Uma sessão por visita à página: o estado morre com ela (R-07, FR-026).
  providers: [ChatSessionStore],
  templateUrl: './chatbot-page.html',
  styleUrl: './chatbot-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotPage {
  protected readonly navigationItems: readonly NavigationItem[] = CHATBOT_NAVIGATION_ITEMS;
}
