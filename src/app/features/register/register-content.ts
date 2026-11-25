import { NavigationItem } from '../../core/layout/navigation-item';
import { AppPaths } from '../../core/routing/app-paths';

export const REGISTER_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'início', icon: 'home', path: AppPaths.home },
];

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_MIN_LENGTH = 8;

export const REGISTRATION_TIMEOUT_IN_MILLISECONDS = 30_000;

export const REGISTER_TITLE_TEXT = 'Crie sua conta';
export const REGISTER_SUBTITLE_TEXT = 'Cadastre e gerencie seus negócios no AchaLocal.';

export const NAME_LABEL = 'Seu nome';
export const EMAIL_LABEL = 'E-mail';
export const PASSWORD_LABEL = 'Senha';
export const PASSWORD_HINT_TEXT = 'Mínimo de 8 caracteres, com letras e números';

export const SUBMIT_BUTTON_LABEL = 'criar minha conta';
export const SHOW_PASSWORD_LABEL = 'Mostrar senha';
export const HIDE_PASSWORD_LABEL = 'Ocultar senha';
export const SUBMITTING_LABEL = 'Enviando cadastro';

export const REQUIRED_FIELD_TEXT = 'Campo obrigatório';
export const INVALID_EMAIL_TEXT = 'Informe um e-mail válido';
export const PASSWORD_TOO_SHORT_TEXT = 'A senha deve ter pelo menos 8 caracteres';
export const PASSWORD_MISSING_LETTER_TEXT = 'A senha deve conter pelo menos uma letra';
export const PASSWORD_MISSING_NUMBER_TEXT = 'A senha deve conter pelo menos um número';

export const EMAIL_TAKEN_FALLBACK_TEXT = 'Este e-mail já está cadastrado';
export const SUCCESS_FALLBACK_TEXT = 'Cadastro realizado!';
export const GENERIC_ERROR_TEXT =
  'Não foi possível concluir o cadastro agora. Tente novamente em instantes.';
