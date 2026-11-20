import { AppIconName } from '../../../core/icons/app-icon-name';

export interface HowItWorksStep {
  /** 1, 2 ou 3; único; define a ordem de exibição. */
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly icon: AppIconName;
}
