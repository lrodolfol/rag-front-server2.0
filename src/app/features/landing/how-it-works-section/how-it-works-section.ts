import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';
import { CHAT_MESSAGES, HOW_IT_WORKS_STEPS } from '../landing-content';
import { ChatSimulation } from './chat-simulation/chat-simulation';
import { StepCard } from './step-card/step-card';

@Component({
  selector: 'app-how-it-works-section',
  imports: [MatButton, MatIcon, RouterLink, StepCard, ChatSimulation],
  templateUrl: './how-it-works-section.html',
  styleUrl: './how-it-works-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksSection {
  protected readonly steps = HOW_IT_WORKS_STEPS;
  protected readonly chatMessages = CHAT_MESSAGES;
  protected readonly chatbotLink = toRouterLink(AppPaths.chatbot);
}
