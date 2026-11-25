import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import { DELETE_ARIA_LABEL, EDIT_LABEL } from '../dashboard-content';
import { Business } from '../models/business';

@Component({
  selector: 'app-business-card',
  imports: [MatCard, MatIcon, MatButton, MatIconButton, RouterLink],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessCard {
  readonly business = input.required<Business>();

  protected readonly editLabel = EDIT_LABEL;
  protected readonly deleteAriaLabel = DELETE_ARIA_LABEL;
  protected readonly editLink = toRouterLink(AppPaths.editBusiness);
  protected readonly deleteLink = toRouterLink(AppPaths.deleteBusiness);
}
