import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, defer, EMPTY, from, Observable, timeout } from 'rxjs';
import { CHAT_API_URL } from '../../../core/config/chat-api-url.token';
import { RESPONSE_TIMEOUT_IN_MILLISECONDS } from '../chatbot-content';
import { ChatRequestDto } from '../models/chat-request.dto';
import { ChatStreamEvent } from '../models/chat-stream-event';
import { StreamDataParser } from './stream-data-parser';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(CHAT_API_URL);

  /** Envia a pergunta e emite cada resposta do fluxo assim que chega; erros são propagados. */
  send(request: ChatRequestDto): Observable<ChatStreamEvent> {
    return defer(() => {
      const parser = new StreamDataParser();
      return this.http
        .post(this.url, request, { observe: 'events', reportProgress: true, responseType: 'text' })
        .pipe(
          timeout({ each: RESPONSE_TIMEOUT_IN_MILLISECONDS }),
          concatMap((event) => toStreamEvents(event, parser)),
        );
    });
  }
}

function toStreamEvents(
  event: HttpEvent<string>,
  parser: StreamDataParser,
): Observable<ChatStreamEvent> {
  switch (event.type) {
    case HttpEventType.DownloadProgress:
      return event.partialText === undefined
        ? EMPTY
        : from(parser.push(event.partialText).map(toChunk));
    case HttpEventType.Response:
      return from([...parser.flush(event.body ?? '').map(toChunk), { type: 'done' } as const]);
    default:
      return EMPTY;
  }
}

function toChunk(text: string): ChatStreamEvent {
  return { type: 'chunk', text };
}
