import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CLOSING_BENEFITS } from '../landing-content';
import { ContactCard } from './contact-card/contact-card';

@Component({
  selector: 'app-closing-call-section',
  imports: [MatIcon, ContactCard],
  templateUrl: './closing-call-section.html',
  styleUrl: './closing-call-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosingCallSection {
  protected readonly benefits = CLOSING_BENEFITS;
}
