import { isRecord } from '../api/api-response-body';

/** Sessão do cliente autenticado (contracts/auth-session.md). */
export interface AuthSession {
  readonly accessToken: string;
  readonly tokenType: string;
  /** ISO 8601. */
  readonly expiresAt: string;
  readonly clientId: number;
}

/**
 * Extrai uma `AuthSession` (só os 4 campos) de um valor desconhecido, ou `null` se algum campo
 * faltar ou for inválido. Não verifica expiração.
 */
export function parseAuthSession(value: unknown): AuthSession | null {
  if (!isRecord(value)) {
    return null;
  }
  const { accessToken, tokenType, expiresAt, clientId } = value;
  const valid =
    typeof accessToken === 'string' &&
    accessToken.length > 0 &&
    typeof tokenType === 'string' &&
    tokenType.length > 0 &&
    typeof expiresAt === 'string' &&
    !Number.isNaN(Date.parse(expiresAt)) &&
    typeof clientId === 'number' &&
    Number.isFinite(clientId);
  return valid ? { accessToken, tokenType, expiresAt, clientId } : null;
}
