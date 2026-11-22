import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationItem } from '../../core/layout/navigation-item';
import { SiteHeader } from '../../core/layout/site-header/site-header';
import { RegisterForm } from './register-form/register-form';
import { REGISTER_NAVIGATION_ITEMS } from './register-content';
import { RegistrationStore } from './state/registration.store';

@Component({
  selector: 'app-register-page',
  imports: [SiteHeader, RegisterForm],
  // Um store por visita à página: o estado morre com ela e a requisição pendente é cancelada (R-07).
  providers: [RegistrationStore],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  protected readonly navigationItems: readonly NavigationItem[] = REGISTER_NAVIGATION_ITEMS;
}
