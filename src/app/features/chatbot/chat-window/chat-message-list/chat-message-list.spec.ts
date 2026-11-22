import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONVERSATION_LABEL } from '../../chatbot-content';
import { ChatMessage } from '../../models/chat-message';
import { ChatMessageList } from './chat-message-list';

function message(id: number, text: string): ChatMessage {
  return { id, author: id % 2 ? 'visitor' : 'assistant', kind: 'text', text, sentAt: new Date() };
}

describe('ChatMessageList', () => {
  let fixture: ComponentFixture<ChatMessageList>;
  let element: HTMLElement;
  let scrollSpy: ReturnType<typeof vi.fn<(options?: boolean | ScrollIntoViewOptions) => void>>;

  beforeEach(async () => {
    scrollSpy = vi.fn<(options?: boolean | ScrollIntoViewOptions) => void>();
    Element.prototype.scrollIntoView = scrollSpy;
    await TestBed.configureTestingModule({ imports: [ChatMessageList] }).compileComponents();
    fixture = TestBed.createComponent(ChatMessageList);
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('isWaiting', false);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should expose the conversation as a polite live log', () => {
    const log = element.querySelector('[role="log"]');
    expect(log?.getAttribute('aria-live')).toBe('polite');
    expect(log?.getAttribute('aria-label')).toBe(CONVERSATION_LABEL);
  });

  it('should render one bubble per message in order', async () => {
    fixture.componentRef.setInput('messages', [message(1, 'a'), message(2, 'b')]);
    await fixture.whenStable();
    const texts = Array.from(element.querySelectorAll('app-chat-message-bubble')).map(
      (bubble) => bubble.querySelector('.bubble__text')?.textContent,
    );
    expect(texts).toEqual(['a', 'b']);
  });

  it('should keep the welcome as the first item before the first bubble', async () => {
    fixture.componentRef.setInput('messages', [message(1, 'a')]);
    await fixture.whenStable();
    const tags = Array.from(element.querySelector('[role="log"]')?.children ?? []).map((child) =>
      child.tagName.toLowerCase(),
    );
    expect(tags.slice(0, 2)).toEqual(['app-chat-welcome', 'app-chat-message-bubble']);
  });

  it('should show the typing indicator only while waiting', async () => {
    expect(element.querySelector('app-chat-typing-indicator')).toBeNull();
    fixture.componentRef.setInput('isWaiting', true);
    await fixture.whenStable();
    expect(element.querySelector('app-chat-typing-indicator')).not.toBeNull();
  });

  it('should scroll the end sentinel into view when a message is added', async () => {
    scrollSpy.mockClear();
    fixture.componentRef.setInput('messages', [message(1, 'a')]);
    await fixture.whenStable();
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'end' });
    expect(scrollSpy.mock.contexts.at(-1)).toBe(element.querySelector('.end'));
  });
});
