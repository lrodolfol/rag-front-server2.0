import { AppIconName } from '../icons/app-icon-name';

export interface NavigationItem {
  readonly label: string;
  readonly icon: AppIconName;
  readonly path: string;
}
