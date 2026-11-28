import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, timeout } from 'rxjs';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DASHBOARD_TIMEOUT_MS } from '../dashboard-content';
import { Business } from '../../../core/business/business';
import { BusinessLoadResult } from '../../../core/business/business-load-result';
import { DashboardStatus } from '../models/dashboard-status';
import { BusinessApiService } from '../../../core/business/business-api.service';
import {
  errorToBusinessLoadResult,
  toBusinessLoadResult,
} from '../../../core/business/business-response.mapper';

const STATUS_BY_RESULT: Readonly<Record<BusinessLoadResult['kind'], DashboardStatus>> = {
  found: 'loaded',
  'not-found': 'empty',
  invalid: 'failed',
};

/**
 * Estado da área do cliente (data-model.md, "Transições"). Provido pela página: o estado morre com
 * ela e a requisição pendente é cancelada. Todo erro vira estado — nada chega ao console.
 */
@Injectable()
export class DashboardStore {
  private readonly api = inject(BusinessApiService);
  private readonly session = inject(AuthSessionService);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statusState = signal<DashboardStatus>('loading');
  private readonly businessState = signal<Business | null>(null);
  private requestInFlight = false;

  readonly status = this.statusState.asReadonly();
  readonly business = this.businessState.asReadonly();

  load(): void {
    if (this.requestInFlight) {
      return;
    }
    const session = this.session.read();
    if (session === null) {
      this.authRedirect.redirectToLogin();
      return;
    }
    this.requestInFlight = true;
    this.statusState.set('loading');
    this.businessState.set(null);

    this.api
      .getClientBusiness(session.clientId)
      .pipe(
        map(toBusinessLoadResult),
        timeout(DASHBOARD_TIMEOUT_MS),
        catchError((error: unknown) => {
          return of(errorToBusinessLoadResult(error));
        }),
        // O interceptor pode completar sem emitir (401): libera novas tentativas mesmo assim.
        finalize(() => (this.requestInFlight = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.apply(result));
  }

  private apply(result: BusinessLoadResult): void {
    this.businessState.set(result.kind === 'found' ? result.business : null);
    this.statusState.set(STATUS_BY_RESULT[result.kind]);
  }
}
