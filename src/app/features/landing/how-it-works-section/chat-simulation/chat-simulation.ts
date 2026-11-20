import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChatMessage } from '../../models/chat-message';

@Component({
  selector: 'app-chat-simulation',
  imports: [MatIcon],
  templateUrl: './chat-simulation.html',
  styleUrl: './chat-simulation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSimulation {
  readonly messages = input.required<readonly ChatMessage[]>();
}
