import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import { EMPTY_HEADING, EMPTY_TEXT, REGISTER_NOW_LABEL } from '../dashboard-content';

@Component({
  selector: 'app-business-empty-state',
  imports: [MatCard, MatIcon, MatButton, RouterLink],
  templateUrl: './business-empty-state.html',
  styleUrl: './business-empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessEmptyState {
  protected readonly heading = EMPTY_HEADING;
  protected readonly text = EMPTY_TEXT;
  protected readonly registerNowLabel = REGISTER_NOW_LABEL;
  protected readonly newBusinessLink = toRouterLink(AppPaths.newBusiness);
}
