/** Leitura segura de corpos de resposta de tipo desconhecido (envelope `ApiResponseDto`). */
export type UnknownRecord = Readonly<Record<string, unknown>>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reconhece o envelope `ApiResponseDto` (ou parte dele) num corpo de tipo desconhecido. */
export function isApiResponse(body: unknown): body is UnknownRecord {
  return isRecord(body) && ('message' in body || 'error' in body || 'success' in body);
}

/** Aceita o corpo como objeto ou string JSON; qualquer outra coisa (ou JSON inválido) → `null`. */
export function parseApiResponseBody(body: unknown): UnknownRecord | null {
  const value = typeof body === 'string' ? parseJson(body) : body;
  return isApiResponse(value) ? value : null;
}

/** Texto não vazio (com `trim`) ou `null`. */
export function readableMessage(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
