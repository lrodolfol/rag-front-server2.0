import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, timeout } from 'rxjs';
import { parseApiResponseBody } from '../../../core/api/api-response-body';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { BusinessApiService } from '../../../core/business/business-api.service';
import { BusinessLoadResult } from '../../../core/business/business-load-result';
import {
  errorToBusinessLoadResult,
  toBusinessLoadResult,
} from '../../../core/business/business-response.mapper';
import { FeedbackSnackbarService } from '../../../core/feedback/feedback-snackbar.service';
import { FeedbackType } from '../../../core/feedback/feedback-type';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import {
  ALREADY_REGISTERED_TEXT,
  BUSINESS_REGISTRATION_TIMEOUT_MS,
  REGISTER_SUCCESS_TEXT,
  SNACKBAR_CLOSE_LABEL,
} from '../business-registration-content';
import { BusinessRegistrationFailure } from '../models/business-registration-failure';
import { BusinessRegistrationInput } from '../models/business-registration-input';
import { BusinessRegistrationStatus } from '../models/business-registration-status';
import {
  failureMessage,
  mapBusinessRegistrationError,
} from '../services/business-registration-error.mapper';
import { toRegisterBusinessRequestDto } from '../services/business-registration-input.mapper';

type SubmitOutcome = { readonly kind: 'succeeded' } | BusinessRegistrationFailure;

const SUCCEEDED: SubmitOutcome = { kind: 'succeeded' };
const GENERIC_FAILURE: SubmitOutcome = { kind: 'generic' };

const CHECK_ALLOWED: ReadonlySet<BusinessRegistrationStatus> = new Set(['checking', 'check-failed']);
const SUBMIT_ALLOWED: ReadonlySet<BusinessRegistrationStatus> = new Set(['ready', 'submit-failed']);
const FORM_VISIBLE: ReadonlySet<BusinessRegistrationStatus> = new Set([
  'ready',
  'submitting',
  'submit-failed',
]);

/**
 * Estado do cadastro de negócio (data-model.md §6). Provido pela página: o estado morre com ela e a
 * requisição pendente é cancelada. Todo erro vira estado — nada chega ao console.
 */
@Injectable()
export class BusinessRegistrationStore {
  private readonly api = inject(BusinessApiService);
  private readonly session = inject(AuthSessionService);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(FeedbackSnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statusState = signal<BusinessRegistrationStatus>('checking');
  private readonly failureMessageState = signal<string | null>(null);
  private requestInFlight = false;

  readonly status = this.statusState.asReadonly();
  readonly failureMessage = this.failureMessageState.asReadonly();
  readonly isSubmitting = computed(() => this.statusState() === 'submitting');
  readonly showForm = computed(() => FORM_VISIBLE.has(this.statusState()));

  /** Verifica se o cliente ainda não tem negócio (só então o formulário aparece). */
  check(): void {
    const clientId = this.startRequest(CHECK_ALLOWED);
    if (clientId === null) {
      return;
    }
    this.statusState.set('checking');
    this.guard(
      this.api.getClientBusiness(clientId).pipe(
        map(toBusinessLoadResult),
        timeout(BUSINESS_REGISTRATION_TIMEOUT_MS),
        catchError((error: unknown) => of(errorToBusinessLoadResult(error))),
      ),
    ).subscribe((result) => this.applyCheck(result));
  }

  submit(input: BusinessRegistrationInput): void {
    const clientId = this.startRequest(SUBMIT_ALLOWED);
    if (clientId === null) {
      return;
    }
    this.failureMessageState.set(null);
    this.statusState.set('submitting');
    this.guard(
      this.api.registerBusiness(clientId, toRegisterBusinessRequestDto(input)).pipe(
        map((response: unknown) => (isRejected(response) ? GENERIC_FAILURE : SUCCEEDED)),
        timeout(BUSINESS_REGISTRATION_TIMEOUT_MS),
        catchError((error: unknown) => of(mapBusinessRegistrationError(error))),
      ),
    ).subscribe((outcome) => this.applySubmit(outcome));
  }

  /** Trava contra requisições simultâneas; devolve o `clientId` da sessão ou `null` se recusado. */
  private startRequest(allowed: ReadonlySet<BusinessRegistrationStatus>): number | null {
    if (this.requestInFlight || !allowed.has(this.statusState())) {
      return null;
    }
    const session = this.session.read();
    if (session === null) {
      this.authRedirect.redirectToLogin();
      return null;
    }
    this.requestInFlight = true;
    return session.clientId;
  }

  private guard<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      // O interceptor pode completar sem emitir (401): libera a trava mesmo assim.
      finalize(() => (this.requestInFlight = false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  private applyCheck(result: BusinessLoadResult): void {
    switch (result.kind) {
      case 'not-found':
        this.statusState.set('ready');
        return;
      case 'found':
        this.goToDashboard();
        return;
      case 'invalid':
        this.statusState.set('check-failed');
        return;
    }
  }

  private applySubmit(outcome: SubmitOutcome): void {
    switch (outcome.kind) {
      case 'succeeded':
        this.goToDashboard(REGISTER_SUCCESS_TEXT, 'success');
        return;
      case 'already-registered':
        this.goToDashboard(ALREADY_REGISTERED_TEXT, 'warning');
        return;
      default:
        this.failureMessageState.set(failureMessage(outcome));
        this.statusState.set('submit-failed');
    }
  }

  private goToDashboard(message?: string, type?: FeedbackType): void {
    void this.router
      .navigateByUrl(toRouterLink(AppPaths.dashboard), { replaceUrl: true })
      .catch(() => undefined);
    if (message !== undefined && type !== undefined) {
      this.snackbar.open(message, type, SNACKBAR_CLOSE_LABEL);
    }
  }
}

/** 2xx com `success: false` no envelope conta como falha; qualquer outro corpo é sucesso. */
function isRejected(response: unknown): boolean {
  return parseApiResponseBody(response)?.['success'] === false;
}
