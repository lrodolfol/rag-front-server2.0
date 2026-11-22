import { StreamDataParser } from './stream-data-parser';

describe('StreamDataParser', () => {
  let parser: StreamDataParser;

  beforeEach(() => {
    parser = new StreamDataParser();
  });

  it('should emit the message of a complete data line', () => {
    expect(parser.push('data: {"message":"a"}\n')).toEqual(['a']);
  });

  it('should emit two lines received in the same chunk in order', () => {
    expect(parser.push('data: {"message":"a"}\ndata: {"message":"b"}\n')).toEqual(['a', 'b']);
  });

  it('should emit only new lines on each push of the accumulated text', () => {
    const first = 'data: {"message":"a"}\n';
    const second = first + 'data: {"message":"b"}\n';
    expect(parser.push(first)).toEqual(['a']);
    expect(parser.push(second)).toEqual(['b']);
  });

  it('should emit a line split between two pushes only once, when complete', () => {
    expect(parser.push('data: {"mess')).toEqual([]);
    expect(parser.push('data: {"message":"a"}')).toEqual([]);
    expect(parser.push('data: {"message":"a"}\n')).toEqual(['a']);
    expect(parser.flush('data: {"message":"a"}\n')).toEqual([]);
  });

  it('should accept CRLF line endings', () => {
    expect(parser.push('data: {"message":"a"}\r\ndata: {"message":"b"}\r\n')).toEqual(['a', 'b']);
  });

  it('should silently ignore invalid or unexpected lines', () => {
    const text = [
      '',
      ': comentário',
      '{"message":"sem prefixo"}',
      'data: não é json',
      'data: {"message": ""}',
      'data: {"message": 1}',
      'data: {"text":"x"}',
      'data: null',
      'data: {"message":"válido"}',
      '',
    ].join('\n');
    expect(parser.push(text)).toEqual(['válido']);
  });

  it('should process the last line without a trailing newline on flush', () => {
    const body = 'data: {"message":"a"}\ndata: {"message":"b"}';
    expect(parser.push(body)).toEqual(['a']);
    expect(parser.flush(body)).toEqual(['b']);
  });

  it('should process the whole body on flush when nothing was pushed before', () => {
    expect(parser.flush('data: {"message":"a"}\ndata: {"message":"b"}\n')).toEqual(['a', 'b']);
  });

  it('should not re-emit already emitted lines on flush', () => {
    const body = 'data: {"message":"a"}\n';
    expect(parser.push(body)).toEqual(['a']);
    expect(parser.flush(body)).toEqual([]);
  });

  it('should accept "data:" without a space after the colon', () => {
    expect(parser.push('data:{"message":"a"}\n')).toEqual(['a']);
  });

  it('should preserve escaped line breaks inside the JSON', () => {
    expect(parser.push('data: {"message":"linha 1\\nlinha 2"}\n')).toEqual(['linha 1\nlinha 2']);
  });
});
