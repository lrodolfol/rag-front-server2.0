import { Injectable } from '@angular/core';
import { AuthSession, parseAuthSession } from './auth-session';

export const AUTH_SESSION_STORAGE_KEY = 'achalocal.auth-session';

/**
 * Ponto único de acesso à sessão do cliente (contracts/auth-session.md, research R-03).
 * Persiste só em `sessionStorage` (morre com a aba), com cópia em memória para quando o storage
 * estiver indisponível. Falhas do storage são engolidas; nada vai para o console.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private session: AuthSession | null = null;

  save(session: AuthSession): void {
    this.session = session;
    try {
      sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage indisponível (modo privado, cota): a sessão continua em memória.
    }
  }

  /** Sessão válida e não expirada, ou `null` (descartando a inválida/expirada). */
  read(): AuthSession | null {
    const session = this.session ?? this.readStorage();
    if (session === null || Date.parse(session.expiresAt) <= Date.now()) {
      this.clear();
      return null;
    }
    this.session = session;
    return session;
  }

  clear(): void {
    this.session = null;
    try {
      sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // Nada a fazer: a cópia em memória já foi descartada.
    }
  }

  private readStorage(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      return raw === null ? null : parseAuthSession(JSON.parse(raw) as unknown);
    } catch {
      return null;
    }
  }
}
