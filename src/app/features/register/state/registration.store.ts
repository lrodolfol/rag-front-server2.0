import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, timeout } from 'rxjs';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { RegisterResponseDataDto } from '../models/register-response-data.dto';
import { RegistrationFailure } from '../models/registration-failure';
import { RegistrationInput } from '../models/registration-input';
import { RegistrationStatus } from '../models/registration-status';
import { REGISTRATION_TIMEOUT_IN_MILLISECONDS, SUCCESS_FALLBACK_TEXT } from '../register-content';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { mapRegistrationError } from '../services/registration-error.mapper';
import { toRegisterRequestDto } from '../services/registration-input.mapper';

/**
 * Estado e regras do envio do cadastro. Provido pela página: o estado morre com ela e sair da
 * página cancela a requisição (R-07). Todo erro é capturado aqui — nada chega ao console.
 */
@Injectable()
export class RegistrationStore {
  private readonly api = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statusState = signal<RegistrationStatus>('idle');
  private readonly successMessageState = signal<string | null>(null);
  private readonly failureState = signal<RegistrationFailure | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly successMessage = this.successMessageState.asReadonly();
  readonly failure = this.failureState.asReadonly();
  readonly isSubmitting = computed(() => this.status() === 'submitting');
  readonly formErrorMessage = computed(() => this.failure()?.message ?? null);

  submit(input: RegistrationInput): void {
    if (this.isSubmitting()) {
      return;
    }
    this.successMessageState.set(null);
    this.failureState.set(null);
    this.statusState.set('submitting');

    this.api
      .register(toRegisterRequestDto(input))
      .pipe(
        timeout(REGISTRATION_TIMEOUT_IN_MILLISECONDS),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: unknown) => {
          this.fail(error);
          return EMPTY;
        }),
      )
      .subscribe((response) => this.succeed(response));
  }

  private succeed(response: ApiResponseDto<RegisterResponseDataDto> | null): void {
    const message = response?.message;
    const readableMessage = typeof message === 'string' ? message.trim() : '';
    this.successMessageState.set(readableMessage || SUCCESS_FALLBACK_TEXT);
    this.statusState.set('succeeded');
  }

  private fail(error: unknown): void {
    this.failureState.set(mapRegistrationError(error));
    this.statusState.set('failed');
  }
}
