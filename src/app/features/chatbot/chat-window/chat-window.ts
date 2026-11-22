import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BLOCKED_HINT_TEXT } from '../chatbot-content';
import { ChatSessionStore } from '../state/chat-session.store';
import { ChatComposer } from './chat-composer/chat-composer';
import { ChatMessageList } from './chat-message-list/chat-message-list';
import { ChatSuggestions } from './chat-suggestions/chat-suggestions';
import { ChatWindowHeader } from './chat-window-header/chat-window-header';

@Component({
  selector: 'app-chat-window',
  imports: [ChatWindowHeader, ChatMessageList, ChatSuggestions, ChatComposer],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindow {
  protected readonly store = inject(ChatSessionStore);

  protected readonly blockedHint = computed(() =>
    this.store.isBlocked() ? BLOCKED_HINT_TEXT : null,
  );
}
