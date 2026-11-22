import { TestBed } from '@angular/core/testing';
import { TYPING_INDICATOR_LABEL } from '../../chatbot-content';
import { ChatTypingIndicator } from './chat-typing-indicator';

describe('ChatTypingIndicator', () => {
  it('should render three hidden dots and a screen reader label', async () => {
    await TestBed.configureTestingModule({ imports: [ChatTypingIndicator] }).compileComponents();
    const fixture = TestBed.createComponent(ChatTypingIndicator);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const dots = Array.from(element.querySelectorAll('.dot'));
    expect(dots.length).toBe(3);
    expect(dots.every((dot) => dot.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(element.querySelector('.visually-hidden')?.textContent?.trim()).toBe(
      TYPING_INDICATOR_LABEL,
    );
  });
});
