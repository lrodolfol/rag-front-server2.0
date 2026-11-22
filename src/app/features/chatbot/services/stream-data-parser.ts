import { isChatStreamChunk } from '../models/chat-stream-chunk.dto';

const DATA_PREFIX = 'data:';
const LINE_BREAK = /\r?\n/;

/**
 * Lê as linhas `data: {"message": "..."}` de um corpo recebido aos poucos (R-02).
 * Uma instância por requisição: guarda quanto do texto acumulado já foi consumido.
 */
export class StreamDataParser {
  private consumedLength = 0;
  private pendingLine = '';

  /** Recebe todo o texto acumulado até agora e devolve as mensagens das linhas novas completas. */
  push(partialText: string): readonly string[] {
    const lines = (this.pendingLine + this.consume(partialText)).split(LINE_BREAK);
    this.pendingLine = lines.pop() ?? '';
    return this.parseLines(lines);
  }

  /** Recebe o corpo completo e processa tudo o que ainda não foi lido, inclusive a última linha. */
  flush(fullText: string): readonly string[] {
    const lines = (this.pendingLine + this.consume(fullText)).split(LINE_BREAK);
    this.pendingLine = '';
    return this.parseLines(lines);
  }

  private consume(text: string): string {
    const newText = text.slice(this.consumedLength);
    this.consumedLength = Math.max(this.consumedLength, text.length);
    return newText;
  }

  private parseLines(lines: readonly string[]): readonly string[] {
    return lines.flatMap((line) => {
      const message = parseLine(line);
      return message === null ? [] : [message];
    });
  }
}

function parseLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith(DATA_PREFIX)) {
    return null;
  }
  try {
    const value: unknown = JSON.parse(trimmed.slice(DATA_PREFIX.length).trim());
    return isChatStreamChunk(value) ? value.message : null;
  } catch {
    return null;
  }
}
