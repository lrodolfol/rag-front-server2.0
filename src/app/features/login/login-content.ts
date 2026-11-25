import { NavigationItem } from '../../core/layout/navigation-item';
import { AppPaths } from '../../core/routing/app-paths';

export const LOGIN_PAGE_TITLE = 'Login — AchaLocal';

export const LOGIN_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'início', icon: 'home', path: AppPaths.home },
];

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MAX_LENGTH = 64;

export const LOGIN_TIMEOUT_MS = 30_000;

export const LOGIN_HEADING = 'Acesse sua conta';
export const LOGIN_SUBHEADING = 'Gerencie seus negócios no AchaLocal.';

export const EMAIL_LABEL = 'E-mail';
export const PASSWORD_LABEL = 'Senha';

export const SUBMIT_LABEL = 'entrar';
export const SHOW_PASSWORD_LABEL = 'Mostrar senha';
export const HIDE_PASSWORD_LABEL = 'Ocultar senha';
export const SUBMITTING_LABEL = 'Entrando';

export const REQUIRED_TEXT = 'Campo obrigatório';
export const INVALID_EMAIL_TEXT = 'Informe um e-mail válido';

export const GENERIC_ERROR_TEXT = 'Não foi possível entrar agora. Tente novamente em instantes.';
