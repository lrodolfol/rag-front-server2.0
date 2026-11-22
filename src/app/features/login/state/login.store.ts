import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, timeout } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import { GENERIC_ERROR_TEXT, LOGIN_TIMEOUT_MS } from '../login-content';
import { LoginInput } from '../models/login-input';
import { LoginStatus } from '../models/login-status';
import { mapLoginError } from '../services/login-error.mapper';
import { toLoginRequestDto } from '../services/login-input.mapper';
import { toAuthSession } from '../services/login-session.mapper';

/**
 * Estado e regras do envio do login. Provido pela página: o estado morre com ela e sair da página
 * cancela a requisição. Todo erro é capturado aqui — nada chega ao console.
 */
@Injectable()
export class LoginStore {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statusState = signal<LoginStatus>('idle');
  private readonly errorMessageState = signal<string | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly isSubmitting = computed(() => this.status() === 'submitting');

  submit(input: LoginInput): void {
    if (this.isSubmitting() || this.status() === 'succeeded') {
      return;
    }
    this.errorMessageState.set(null);
    this.statusState.set('submitting');

    this.api
      .login(toLoginRequestDto(input))
      .pipe(
        timeout(LOGIN_TIMEOUT_MS),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: unknown) => {
          this.fail(mapLoginError(error));
          return EMPTY;
        }),
      )
      .subscribe((response) => this.handleResponse(response));
  }

  dismissError(): void {
    this.errorMessageState.set(null);
  }

  private handleResponse(response: unknown): void {
    const session = toAuthSession(response);
    if (session === null) {
      this.fail(GENERIC_ERROR_TEXT);
      return;
    }
    this.session.save(session);
    this.statusState.set('succeeded');
    void this.router
      .navigateByUrl(toRouterLink(AppPaths.dashboard))
      .catch(() => undefined);
  }

  private fail(message: string): void {
    this.errorMessageState.set(message);
    this.statusState.set('failed');
  }
}
