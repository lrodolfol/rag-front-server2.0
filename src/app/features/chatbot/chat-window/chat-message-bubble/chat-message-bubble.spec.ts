import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessage } from '../../models/chat-message';
import { ChatMessageBubble } from './chat-message-bubble';

const BASE_MESSAGE: ChatMessage = {
  id: 1,
  author: 'assistant',
  kind: 'text',
  text: 'Olá',
  sentAt: new Date(2026, 10, 21, 9, 5),
};

describe('ChatMessageBubble', () => {
  let fixture: ComponentFixture<ChatMessageBubble>;
  let element: HTMLElement;

  beforeEach(async () => {
    registerLocaleData(localePt);
    await TestBed.configureTestingModule({
      imports: [ChatMessageBubble],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatMessageBubble);
    element = fixture.nativeElement as HTMLElement;
  });

  async function render(message: Partial<ChatMessage> = {}): Promise<HTMLElement> {
    fixture.componentRef.setInput('message', { ...BASE_MESSAGE, ...message });
    await fixture.whenStable();
    return element.querySelector('.bubble') as HTMLElement;
  }

  it('should render the text as plain text (FR-019)', async () => {
    await render({ text: '<b>x</b>' });
    expect(element.querySelector('.bubble__text')?.textContent).toBe('<b>x</b>');
    expect(element.querySelector('b')).toBeNull();
  });

  it('should render the time as HH:mm', async () => {
    await render();
    expect(element.querySelector('time')?.textContent?.trim()).toBe('09:05');
  });

  it('should mark the side of the visitor and of the assistant', async () => {
    expect((await render({ author: 'visitor' })).classList).toContain('bubble--visitor');
    expect((await render({ author: 'assistant' })).classList).toContain('bubble--assistant');
  });

  it('should highlight warnings and errors with distinct classes', async () => {
    const warning = await render({ kind: 'warning' });
    expect(warning.classList).toContain('bubble--warning');
    expect(warning.classList).not.toContain('bubble--error');
    const error = await render({ kind: 'error' });
    expect(error.classList).toContain('bubble--error');
    expect(error.classList).not.toContain('bubble--warning');
    const text = await render({ kind: 'text' });
    expect(text.classList).not.toContain('bubble--warning');
    expect(text.classList).not.toContain('bubble--error');
  });

  it('should keep line breaks through the pre-line text class', async () => {
    await render({ text: 'linha 1\nlinha 2' });
    const text = element.querySelector('.bubble__text');
    expect(text?.textContent).toBe('linha 1\nlinha 2');
    expect(text?.classList).toContain('bubble__text');
  });
});
