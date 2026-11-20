import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ESSENTIAL_PLAN } from '../landing-content';
import { PlanCard } from './plan-card/plan-card';

@Component({
  selector: 'app-pricing-section',
  imports: [PlanCard],
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingSection {
  protected readonly plan = ESSENTIAL_PLAN;
}
