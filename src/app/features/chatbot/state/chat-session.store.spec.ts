import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, TimeoutError } from 'rxjs';
import { EMPTY_RESULT_TEXT, GENERIC_ERROR_TEXT } from '../chatbot-content';
import { ChatRequestDto } from '../models/chat-request.dto';
import { ChatStreamEvent } from '../models/chat-stream-event';
import { ChatApiService } from '../services/chat-api.service';
import { ChatSessionStore } from './chat-session.store';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('ChatSessionStore', () => {
  let store: ChatSessionStore;
  let stream: Subject<ChatStreamEvent>;
  let sendSpy: ReturnType<typeof vi.fn<(request: ChatRequestDto) => Subject<ChatStreamEvent>>>;

  beforeEach(() => {
    sendSpy = vi.fn((_request: ChatRequestDto) => {
      stream = new Subject<ChatStreamEvent>();
      return stream;
    });
    TestBed.configureTestingModule({
      providers: [ChatSessionStore, { provide: ChatApiService, useValue: { send: sendSpy } }],
    });
    store = TestBed.inject(ChatSessionStore);
  });

  describe('fluxo de sucesso', () => {
    it('should generate a UUID user code that stays the same between sends', () => {
      expect(store.userCode).toMatch(UUID_PATTERN);
      store.send('primeira');
      stream.next({ type: 'chunk', text: 'ok' });
      stream.next({ type: 'done' });
      store.send('segunda');
      expect(sendSpy.mock.calls.map(([request]) => request.user_code)).toEqual([
        store.userCode,
        store.userCode,
      ]);
    });

    it('should send the trimmed text with the user code', () => {
      store.send('  oi  ');
      expect(sendSpy).toHaveBeenCalledWith({ message: 'oi', user_code: store.userCode });
    });

    it('should add the visitor message and switch to waiting synchronously', () => {
      store.send('oi');
      const [message] = store.messages();
      expect(message).toMatchObject({ author: 'visitor', kind: 'text', text: 'oi' });
      expect(message.sentAt).toBeInstanceOf(Date);
      expect(store.status()).toBe('waiting');
      expect(store.isWaiting()).toBe(true);
      expect(store.canSend()).toBe(false);
      expect(store.hasStarted()).toBe(true);
    });

    it('should ignore a second send while waiting (double submit)', () => {
      store.send('oi');
      store.send('de novo');
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(store.messages().length).toBe(1);
    });

    it('should ignore blank text and text longer than 50 characters', () => {
      store.send('   ');
      store.send('a'.repeat(51));
      expect(sendSpy).not.toHaveBeenCalled();
      expect(store.messages()).toEqual([]);
      expect(store.hasStarted()).toBe(false);
    });

    it('should add one assistant message per chunk in order and become idle on done', () => {
      store.send('oi');
      stream.next({ type: 'chunk', text: 'a' });
      stream.next({ type: 'chunk', text: 'b' });
      expect(store.isWaiting()).toBe(true);
      stream.next({ type: 'done' });
      expect(store.messages().map(({ author, kind, text }) => ({ author, kind, text }))).toEqual([
        { author: 'visitor', kind: 'text', text: 'oi' },
        { author: 'assistant', kind: 'text', text: 'a' },
        { author: 'assistant', kind: 'text', text: 'b' },
      ]);
      expect(store.status()).toBe('idle');
      expect(store.canSend()).toBe(true);
    });

    it('should add the empty result notice when done arrives without chunks', () => {
      store.send('oi');
      stream.next({ type: 'done' });
      expect(store.messages()[1]).toMatchObject({
        author: 'assistant',
        kind: 'error',
        text: EMPTY_RESULT_TEXT,
      });
      expect(store.status()).toBe('idle');
    });

    it('should assign unique sequential ids', () => {
      store.send('oi');
      stream.next({ type: 'chunk', text: 'a' });
      stream.next({ type: 'done' });
      store.send('outra');
      const ids = store.messages().map((message) => message.id);
      expect(ids).toEqual([...ids].sort((first, second) => first - second));
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should cancel the subscription silently when destroyed while waiting (FR-027)', () => {
      store.send('oi');
      expect(stream.observed).toBe(true);
      expect(() => TestBed.resetTestingModule()).not.toThrow();
      expect(stream.observed).toBe(false);
      stream.next({ type: 'chunk', text: 'tarde demais' });
      expect(store.messages().length).toBe(1);
    });
  });

  describe('falhas', () => {
    let consoleSpies: ReturnType<typeof vi.spyOn>[];
    let errorHandlerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );
      errorHandlerSpy = vi.spyOn(TestBed.inject(ErrorHandler), 'handleError');
    });

    afterEach(() => {
      for (const spy of [...consoleSpies, errorHandlerSpy]) {
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
      }
    });

    function lastMessage() {
      return store.messages().at(-1);
    }

    it('should show the service message and release the field on a 500', () => {
      store.send('oi');
      stream.error(new HttpErrorResponse({ status: 500, error: '{"detail":"x"}' }));
      expect(lastMessage()).toMatchObject({ author: 'assistant', kind: 'error', text: 'x' });
      expect(store.status()).toBe('idle');
    });

    it('should warn and block on a 429, ignoring further sends (SC-004)', () => {
      store.send('oi');
      stream.error(new HttpErrorResponse({ status: 429, error: '{"message":"Limite."}' }));
      expect(lastMessage()).toMatchObject({
        author: 'assistant',
        kind: 'warning',
        text: 'Limite.',
      });
      expect(store.status()).toBe('blocked');
      expect(store.isBlocked()).toBe(true);
      expect(store.canSend()).toBe(false);
      store.send('oi');
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('should show the generic text on timeout', () => {
      store.send('oi');
      stream.error(new TimeoutError());
      expect(lastMessage()).toMatchObject({ kind: 'error', text: GENERIC_ERROR_TEXT });
      expect(store.status()).toBe('idle');
    });

    it('should keep the answers already received when the stream breaks', () => {
      store.send('oi');
      stream.next({ type: 'chunk', text: 'a' });
      stream.next({ type: 'chunk', text: 'b' });
      stream.error(new HttpErrorResponse({ status: 0 }));
      expect(store.messages().map((message) => message.text)).toEqual([
        'oi',
        'a',
        'b',
        GENERIC_ERROR_TEXT,
      ]);
      expect(store.status()).toBe('idle');
    });

    it('should show the generic text on a network failure (status 0)', () => {
      store.send('oi');
      stream.error(new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }));
      expect(lastMessage()).toMatchObject({ kind: 'error', text: GENERIC_ERROR_TEXT });
    });
  });
});
