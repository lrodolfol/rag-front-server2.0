import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../routing/app-paths';
import { NavigationItem } from '../navigation-item';

@Component({
  selector: 'app-site-header',
  imports: [MatToolbar, MatButton, MatIcon, MatDivider, RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  private readonly viewportScroller = inject(ViewportScroller);

  readonly navigationItems = input.required<readonly NavigationItem[]>();

  protected readonly homeLink = toRouterLink(AppPaths.home);
  protected readonly toRouterLink = toRouterLink;

  protected scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
