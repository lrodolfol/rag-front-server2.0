import { TestBed } from '@angular/core/testing';
import { WELCOME_TEXT, WELCOME_TITLE } from '../../chatbot-content';
import { ChatWelcome } from './chat-welcome';

describe('ChatWelcome', () => {
  it('should render the welcome title and text', async () => {
    await TestBed.configureTestingModule({ imports: [ChatWelcome] }).compileComponents();
    const fixture = TestBed.createComponent(ChatWelcome);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.title')?.textContent?.trim()).toBe(WELCOME_TITLE);
    expect(element.textContent).toContain(WELCOME_TEXT);
  });
});
