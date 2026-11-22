import { HttpErrorResponse, HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';
import { CHAT_API_URL } from '../../../core/config/chat-api-url.token';
import { ChatStreamEvent } from '../models/chat-stream-event';
import { ChatApiService } from './chat-api.service';

const URL = 'http://test/chat';
const REQUEST = { message: 'oi', user_code: 'code-1' };

describe('ChatApiService', () => {
  let service: ChatApiService;
  let httpTesting: HttpTestingController;
  let events: ChatStreamEvent[];
  let error: unknown;
  let completed: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CHAT_API_URL, useValue: URL },
      ],
    });
    service = TestBed.inject(ChatApiService);
    httpTesting = TestBed.inject(HttpTestingController);
    events = [];
    error = undefined;
    completed = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function subscribe() {
    return service.send(REQUEST).subscribe({
      next: (event) => events.push(event),
      error: (caught: unknown) => (error = caught),
      complete: () => (completed = true),
    });
  }

  it('should POST the exact body to the configured URL as text', () => {
    subscribe();
    const request = httpTesting.expectOne(URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(REQUEST);
    expect(request.request.responseType).toBe('text');
    expect(request.request.reportProgress).toBe(true);
  });

  it('should emit a chunk for each new line received in a progress event', () => {
    subscribe();
    const request = httpTesting.expectOne(URL);
    const first = 'data: {"message":"a"}\n';
    request.event({
      type: HttpEventType.DownloadProgress,
      loaded: first.length,
      partialText: first,
    });
    expect(events).toEqual([{ type: 'chunk', text: 'a' }]);

    const second = first + 'data: {"message":"b"}\n';
    request.event({
      type: HttpEventType.DownloadProgress,
      loaded: second.length,
      partialText: second,
    });
    expect(events).toEqual([
      { type: 'chunk', text: 'a' },
      { type: 'chunk', text: 'b' },
    ]);
    expect(completed).toBe(false);
  });

  it('should emit remaining chunks then done and complete on the final response', () => {
    subscribe();
    const request = httpTesting.expectOne(URL);
    const partial = 'data: {"message":"a"}\n';
    request.event({
      type: HttpEventType.DownloadProgress,
      loaded: partial.length,
      partialText: partial,
    });
    request.flush(partial + 'data: {"message":"b"}');
    expect(events).toEqual([
      { type: 'chunk', text: 'a' },
      { type: 'chunk', text: 'b' },
      { type: 'done' },
    ]);
    expect(completed).toBe(true);
  });

  it('should propagate HTTP errors untouched', () => {
    subscribe();
    httpTesting
      .expectOne(URL)
      .flush('{"message":"Limite"}', { status: 429, statusText: 'Too Many Requests' });
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(429);
  });

  it('should fail with TimeoutError after 60 s without events', () => {
    vi.useFakeTimers();
    subscribe();
    const request = httpTesting.expectOne(URL);
    vi.advanceTimersByTime(60_000);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(request.cancelled).toBe(true);
  });

  it('should not time out while events keep arriving within 60 s', () => {
    vi.useFakeTimers();
    subscribe();
    const request = httpTesting.expectOne(URL);
    let text = '';
    for (let index = 0; index < 3; index++) {
      vi.advanceTimersByTime(59_000);
      text += `data: {"message":"${index}"}\n`;
      request.event({
        type: HttpEventType.DownloadProgress,
        loaded: text.length,
        partialText: text,
      });
    }
    expect(error).toBeUndefined();
    expect(events.length).toBe(3);
  });

  it('should cancel the request when unsubscribed', () => {
    const subscription = subscribe();
    const request = httpTesting.expectOne(URL);
    subscription.unsubscribe();
    expect(request.cancelled).toBe(true);
  });
});
