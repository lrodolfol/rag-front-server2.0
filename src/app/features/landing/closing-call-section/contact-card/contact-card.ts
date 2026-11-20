import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { CONTACT_EMAIL } from '../../landing-content';

@Component({
  selector: 'app-contact-card',
  imports: [MatCard, MatButton, MatIcon],
  templateUrl: './contact-card.html',
  styleUrl: './contact-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCard {
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly mailtoLink = `mailto:${CONTACT_EMAIL}`;
}
