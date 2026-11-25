import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths, toRouterLink } from '../routing/app-paths';
import { AuthSessionService } from './auth-session.service';

/**
 * "Descartar a sessão + navegar", compartilhado por interceptor, store e página
 * (contracts/access-control.md). Navegações rejeitadas são engolidas: nada vai para o console.
 */
@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);

  redirectToLogin(): void {
    this.session.clear();
    void this.router.navigateByUrl(toRouterLink(AppPaths.login)).catch(() => undefined);
  }

  signOut(): void {
    this.session.clear();
    void this.router
      .navigateByUrl(toRouterLink(AppPaths.home), { replaceUrl: true })
      .catch(() => undefined);
  }
}
