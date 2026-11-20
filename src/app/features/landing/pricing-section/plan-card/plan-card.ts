import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Plan } from '../../models/plan';

@Component({
  selector: 'app-plan-card',
  imports: [MatCard, MatIcon, CurrencyPipe],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCard {
  readonly plan = input.required<Plan>();

  protected readonly price = computed(() => this.plan().monthlyPriceInCents / 100);
}
