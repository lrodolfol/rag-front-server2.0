import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../core/routing/app-paths';

@Component({
  selector: 'app-coming-soon-page',
  imports: [MatButton, RouterLink],
  templateUrl: './coming-soon-page.html',
  styleUrl: './coming-soon-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPage {
  readonly featureName = input.required<string>();

  protected readonly homeLink = toRouterLink(AppPaths.home);
}
