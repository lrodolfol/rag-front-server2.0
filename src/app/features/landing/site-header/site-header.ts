import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';

@Component({
  selector: 'app-site-header',
  imports: [MatToolbar, MatButton, MatIcon, MatDivider, RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  private readonly viewportScroller = inject(ViewportScroller);

  protected readonly homeLink = toRouterLink(AppPaths.home);
  protected readonly chatbotLink = toRouterLink(AppPaths.chatbot);

  protected scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
