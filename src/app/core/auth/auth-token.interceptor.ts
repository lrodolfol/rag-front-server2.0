import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url.token';
import { AUTH_API_URL } from '../config/auth-api-url.token';
import { AuthRedirectService } from './auth-redirect.service';
import { AuthSessionService } from './auth-session.service';

/**
 * Inclui `Authorization` nas requisições à API de negócio e trata sessão expirada/401
 * (research R-02, contracts/access-control.md). O `/` final no prefixo evita casar `/api/v10`.
 * Fora do escopo (chat, login, cadastro, ícones) a requisição passa intacta.
 */
export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const authApiUrl = inject(AUTH_API_URL);
  const inScope =
    request.url.startsWith(apiBaseUrl + '/') && !request.url.startsWith(authApiUrl + '/');
  if (!inScope) {
    return next(request);
  }

  const authRedirect = inject(AuthRedirectService);
  const session = inject(AuthSessionService).read();
  if (session === null) {
    authRedirect.redirectToLogin();
    return EMPTY;
  }

  const authorized = request.clone({
    setHeaders: { Authorization: `${session.tokenType} ${session.accessToken}` },
  });
  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
        authRedirect.redirectToLogin();
        return EMPTY;
      }
      return throwError(() => error);
    }),
  );
};
