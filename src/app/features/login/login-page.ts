import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationItem } from '../../core/layout/navigation-item';
import { SiteHeader } from '../../core/layout/site-header/site-header';
import { LOGIN_NAVIGATION_ITEMS } from './login-content';
import { LoginForm } from './login-form/login-form';
import { LoginStore } from './state/login.store';

@Component({
  selector: 'app-login-page',
  imports: [SiteHeader, LoginForm],
  // Um store por visita à página: o estado morre com ela e a requisição pendente é cancelada.
  providers: [LoginStore],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly navigationItems: readonly NavigationItem[] = LOGIN_NAVIGATION_ITEMS;
}
