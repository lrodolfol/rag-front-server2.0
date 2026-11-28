import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthRedirectService } from '../../core/auth/auth-redirect.service';
import { NavigationItem } from '../../core/layout/navigation-item';
import { SiteHeader } from '../../core/layout/site-header/site-header';
import { AppPaths, toRouterLink } from '../../core/routing/app-paths';
import { DASHBOARD_NAVIGATION_ITEMS, SIGN_OUT_LABEL } from '../dashboard/dashboard-content';
import {
  CHECK_ERROR_TEXT,
  CHECKING_TEXT,
  PAGE_HEADING,
  PAGE_SUBHEADING,
  RETRY_LABEL,
} from './business-registration-content';
import { BusinessRegistrationForm } from './business-registration-form/business-registration-form';
import { BusinessRegistrationStore } from './state/business-registration.store';

@Component({
  selector: 'app-business-registration-page',
  imports: [
    NgTemplateOutlet,
    SiteHeader,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    BusinessRegistrationForm,
  ],
  // Um store por visita à página: a verificação roda em toda forma de acesso (URL, link, F5).
  providers: [BusinessRegistrationStore],
  templateUrl: './business-registration-page.html',
  styleUrl: './business-registration-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessRegistrationPage {
  protected readonly store = inject(BusinessRegistrationStore);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly router = inject(Router);

  protected readonly navigationItems: readonly NavigationItem[] = DASHBOARD_NAVIGATION_ITEMS;
  protected readonly signOutLabel = SIGN_OUT_LABEL;
  protected readonly heading = PAGE_HEADING;
  protected readonly subheading = PAGE_SUBHEADING;
  protected readonly checkingText = CHECKING_TEXT;
  protected readonly checkErrorText = CHECK_ERROR_TEXT;
  protected readonly retryLabel = RETRY_LABEL;

  constructor() {
    this.store.check();
  }

  protected retry(): void {
    this.store.check();
  }

  protected goToDashboard(): void {
    void this.router.navigateByUrl(toRouterLink(AppPaths.dashboard)).catch(() => undefined);
  }

  protected signOut(): void {
    this.authRedirect.signOut();
  }
}
