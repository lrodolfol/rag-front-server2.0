import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { HowItWorksStep } from '../../models/how-it-works-step';

@Component({
  selector: 'app-step-card',
  imports: [MatCard, MatIcon],
  templateUrl: './step-card.html',
  styleUrl: './step-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCard {
  readonly step = input.required<HowItWorksStep>();
}
