import { isRecord } from '../../../core/api/api-response-body';
import { AuthSession, parseAuthSession } from '../../../core/auth/auth-session';

/**
 * Resposta de sucesso do login → `AuthSession` (research R-04), ou `null` quando o envelope diz
 * `success: false` ou faltam dados de sessão. A expiração é verificada só na leitura da sessão.
 */
export function toAuthSession(response: unknown): AuthSession | null {
  if (!isRecord(response) || response['success'] === false) {
    return null;
  }
  return parseAuthSession(response['data']);
}
