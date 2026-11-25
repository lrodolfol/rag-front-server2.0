import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthRedirectService } from '../../core/auth/auth-redirect.service';
import { NavigationItem } from '../../core/layout/navigation-item';
import { SiteHeader } from '../../core/layout/site-header/site-header';
import { AppPaths, toRouterLink } from '../../core/routing/app-paths';
import { BusinessCard } from './business-card/business-card';
import { BusinessEmptyState } from './business-empty-state/business-empty-state';
import { ChatbotPreviewCard } from './chatbot-preview-card/chatbot-preview-card';
import {
  DASHBOARD_HEADING,
  DASHBOARD_NAVIGATION_ITEMS,
  DASHBOARD_SUBHEADING,
  LOAD_ERROR_TEXT,
  LOADING_TEXT,
  NEW_BUSINESS_LABEL,
  RETRY_LABEL,
  SIGN_OUT_LABEL,
} from './dashboard-content';
import { DashboardStore } from './state/dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    SiteHeader,
    MatProgressSpinner,
    MatButton,
    MatIcon,
    RouterLink,
    BusinessCard,
    BusinessEmptyState,
    ChatbotPreviewCard,
  ],
  // Um store por visita à página: o estado morre com ela e a requisição pendente é cancelada.
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly store = inject(DashboardStore);
  private readonly authRedirect = inject(AuthRedirectService);

  protected readonly navigationItems: readonly NavigationItem[] = DASHBOARD_NAVIGATION_ITEMS;
  protected readonly heading = DASHBOARD_HEADING;
  protected readonly subheading = DASHBOARD_SUBHEADING;
  protected readonly newBusinessLabel = NEW_BUSINESS_LABEL;
  protected readonly loadingText = LOADING_TEXT;
  protected readonly loadErrorText = LOAD_ERROR_TEXT;
  protected readonly retryLabel = RETRY_LABEL;
  protected readonly signOutLabel = SIGN_OUT_LABEL;
  protected readonly registerBusinessLink = toRouterLink(AppPaths.registerBusiness);

  /** "Novo negócio" só para quem ainda não tem negócio (1 negócio por cliente). */
  protected readonly showNewBusinessAction = computed(() => this.store.status() === 'empty');

  constructor() {
    this.store.load();
  }

  protected retry(): void {
    this.store.load();
  }

  protected signOut(): void {
    this.authRedirect.signOut();
  }
}
