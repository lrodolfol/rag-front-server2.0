import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CHAT_API_URL } from '../../../core/config/chat-api-url.token';
import { ChatSessionStore } from '../state/chat-session.store';
import { ChatWindow } from './chat-window';

const URL = 'http://test/chat';

describe('ChatWindow', () => {
  let fixture: ComponentFixture<ChatWindow>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ChatWindow, MatIconTestingModule],
      providers: [
        ChatSessionStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CHAT_API_URL, useValue: URL },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatWindow);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  function textarea(): HTMLTextAreaElement {
    return element.querySelector('app-chat-composer textarea') as HTMLTextAreaElement;
  }

  it('should render the header, the message list and the composer', () => {
    expect(element.querySelector('app-chat-window-header')).not.toBeNull();
    expect(element.querySelector('app-chat-message-list')).not.toBeNull();
    expect(element.querySelector('app-chat-composer')).not.toBeNull();
  });

  it('should send the composer text and disable the composer while waiting', async () => {
    textarea().value = 'oi';
    textarea().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    (element.querySelector('app-chat-composer button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const request = httpTesting.expectOne(URL);
    expect(request.request.method).toBe('POST');
    expect((request.request.body as { message: string }).message).toBe('oi');
    expect(textarea().disabled).toBe(true);
  });

  describe('boas-vindas e sugestões', () => {
    function suggestionButton(text: string): HTMLButtonElement {
      const button = Array.from(
        element.querySelectorAll<HTMLButtonElement>('app-chat-suggestions button'),
      ).find((candidate) => candidate.textContent?.trim() === text);
      if (!button) {
        throw new Error(`Sugestão "${text}" não encontrada.`);
      }
      return button;
    }

    it('should show the welcome and the suggestions before the first message', () => {
      expect(element.querySelector('app-chat-welcome')).not.toBeNull();
      expect(element.querySelector('app-chat-suggestions')).not.toBeNull();
    });

    it('should send the suggestion text, hide the suggestions and keep the welcome on top', async () => {
      suggestionButton('estou com fome').click();
      await fixture.whenStable();
      const request = httpTesting.expectOne(URL);
      expect((request.request.body as { message: string }).message).toBe('estou com fome');
      expect(element.querySelector('app-chat-suggestions')).toBeNull();

      const log = element.querySelector('[role="log"]') as HTMLElement;
      const tags = Array.from(log.children).map((child) => child.tagName.toLowerCase());
      expect(tags[0]).toBe('app-chat-welcome');
      expect(tags[1]).toBe('app-chat-message-bubble');
    });

    it('should not send a suggestion while waiting', () => {
      const store = TestBed.inject(ChatSessionStore);
      const button = suggestionButton('quero cortar cabelo');
      store.send('oi');
      httpTesting.expectOne(URL);
      button.click();
      httpTesting.expectNone(URL);
    });
  });
});
