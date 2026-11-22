import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SUGGESTIONS, SUGGESTIONS_LABEL } from '../../chatbot-content';

@Component({
  selector: 'app-chat-suggestions',
  imports: [MatButton],
  templateUrl: './chat-suggestions.html',
  styleUrl: './chat-suggestions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSuggestions {
  readonly disabled = input<boolean>(false);
  readonly suggestionSelected = output<string>();

  protected readonly suggestionsLabel = SUGGESTIONS_LABEL;
  protected readonly suggestions = SUGGESTIONS;
  protected readonly labelId = 'chat-suggestions-label';

  protected select(suggestion: string): void {
    if (this.disabled()) {
      return;
    }
    this.suggestionSelected.emit(suggestion);
  }
}
