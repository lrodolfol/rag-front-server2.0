import { registerLocaleData } from '@angular/common';
import { HttpEventType, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { CHAT_API_URL } from '../../core/config/chat-api-url.token';
import { BLOCKED_HINT_TEXT, GENERIC_ERROR_TEXT } from './chatbot-content';
import { ChatbotPage } from './chatbot-page';
import { ChatSessionStore } from './state/chat-session.store';

const URL = 'http://test/chat';

describe('ChatbotPage', () => {
  let fixture: ComponentFixture<ChatbotPage>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    registerLocaleData(localePt);
    Element.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ChatbotPage, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CHAT_API_URL, useValue: URL },
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatbotPage);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  function textarea(): HTMLTextAreaElement {
    return element.querySelector('app-chat-composer textarea') as HTMLTextAreaElement;
  }

  function sendButton(): HTMLButtonElement {
    return element.querySelector('app-chat-composer button') as HTMLButtonElement;
  }

  function bubbles(author: 'visitor' | 'assistant'): string[] {
    return Array.from(element.querySelectorAll(`.bubble--${author} .bubble__text`)).map(
      (bubble) => bubble.textContent ?? '',
    );
  }

  function typingIndicator(): Element | null {
    return element.querySelector('app-chat-typing-indicator');
  }

  async function ask(text: string): Promise<TestRequest> {
    textarea().value = text;
    textarea().dispatchEvent(new Event('input'));
    textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    await fixture.whenStable();
    return httpTesting.expectOne(URL);
  }

  function progress(request: TestRequest, partialText: string): void {
    request.event({
      type: HttpEventType.DownloadProgress,
      loaded: partialText.length,
      partialText,
    });
  }

  it('should show the site header with "início" and "cadastrar" links', () => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('app-site-header a[mat-button]'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual(['início', 'cadastrar']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/cadastrar-negocio']);
  });

  it('should provide its own session store instance', () => {
    expect(fixture.debugElement.injector.get(ChatSessionStore)).toBeInstanceOf(ChatSessionStore);
  });

  it('should show each answer as soon as it arrives and release the field at the end', async () => {
    const request = await ask('estou com fome');
    expect(bubbles('visitor')).toEqual(['estou com fome']);
    expect(textarea().value).toBe('');
    expect(textarea().disabled).toBe(true);
    expect(sendButton().disabled).toBe(true);
    expect(typingIndicator()).not.toBeNull();

    const first = 'data: {"message": "Resposta 1"}\n';
    progress(request, first);
    await fixture.whenStable();
    expect(bubbles('assistant')).toEqual(['Resposta 1']);
    expect(typingIndicator()).not.toBeNull();

    request.flush(first + 'data: {"message": "Resposta 2"}');
    await fixture.whenStable();
    expect(bubbles('assistant')).toEqual(['Resposta 1', 'Resposta 2']);
    expect(typingIndicator()).toBeNull();
    expect(textarea().disabled).toBe(false);
    expect(document.activeElement).toBe(textarea());
    expect(element.querySelectorAll('time')[0]?.textContent?.trim()).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should use the same user code for every question of the visit', async () => {
    const first = await ask('primeira');
    first.flush('data: {"message": "ok"}\n');
    await fixture.whenStable();
    const second = await ask('segunda');
    const firstCode = (first.request.body as { user_code: string }).user_code;
    expect(firstCode).toBeTruthy();
    expect((second.request.body as { user_code: string }).user_code).toBe(firstCode);
    expect(second.request.body).toEqual({ message: 'segunda', user_code: firstCode });
  });

  describe('falhas', () => {
    function renderedText(): string {
      return element.textContent ?? '';
    }

    function expectNoTechnicalDetails(): void {
      for (const forbidden of ['429', '503', 'Http', URL]) {
        expect(renderedText()).not.toContain(forbidden);
      }
    }

    it('should block the chat on a 429 and send nothing else', async () => {
      const request = await ask('oi');
      request.flush('{"message":"Limite atingido."}', {
        status: 429,
        statusText: 'Too Many Requests',
      });
      await fixture.whenStable();
      expect(element.querySelector('.bubble--warning .bubble__text')?.textContent).toBe(
        'Limite atingido.',
      );
      expect(textarea().disabled).toBe(true);
      expect(sendButton().disabled).toBe(true);
      expect(renderedText()).toContain(BLOCKED_HINT_TEXT);

      textarea().value = 'de novo';
      textarea().dispatchEvent(new Event('input'));
      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
      await fixture.whenStable();
      httpTesting.expectNone(URL);
      expectNoTechnicalDetails();
    });

    it('should show the generic text for a 503 without body and release the field', async () => {
      const request = await ask('oi');
      request.flush('', { status: 503, statusText: 'Service Unavailable' });
      await fixture.whenStable();
      expect(element.querySelector('.bubble--error .bubble__text')?.textContent).toBe(
        GENERIC_ERROR_TEXT,
      );
      expect(textarea().disabled).toBe(false);
      expectNoTechnicalDetails();
    });

    it('should show the generic text on a network failure', async () => {
      const request = await ask('oi');
      request.error(new ProgressEvent('error'));
      await fixture.whenStable();
      expect(element.querySelector('.bubble--error .bubble__text')?.textContent).toBe(
        GENERIC_ERROR_TEXT,
      );
      expectNoTechnicalDetails();
    });
  });
});
