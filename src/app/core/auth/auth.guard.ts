import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppPaths, toRouterLink } from '../routing/app-paths';
import { AuthSessionService } from './auth-session.service';

/**
 * Libera a rota só com sessão completa e não expirada (contracts/access-control.md). Síncrono e
 * sem HTTP; `read()` já descarta a sessão inválida/expirada.
 */
export const authGuard: CanActivateFn = () =>
  inject(AuthSessionService).read() !== null ||
  inject(Router).createUrlTree([toRouterLink(AppPaths.login)]);
