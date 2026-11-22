import { NavigationItem } from '../../core/layout/navigation-item';
import { AppPaths } from '../../core/routing/app-paths';

export const CHATBOT_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'início', icon: 'home', path: AppPaths.home },
  { label: 'cadastrar', icon: 'add_business', path: AppPaths.registerBusiness },
];

export const ASSISTANT_NAME = 'AchaLocalBot';
export const ASSISTANT_STATUS_TEXT = 'online';

export const WELCOME_TITLE = '👋 Olá! Eu sou o AchaLocalBot';
export const WELCOME_TEXT = 'Como posso ajudar você hoje? Digite sua pergunta abaixo.';

export const SUGGESTIONS_LABEL = 'experimente:';
export const SUGGESTIONS: readonly string[] = [
  'estou com fome',
  'preciso reformar minha casa',
  'onde comprar roupas novas?',
  'quero cortar cabelo',
  'quero aprender inglês',
  'manutenção de celular',
];

export const MESSAGE_MAX_LENGTH = 50;
export const RESPONSE_TIMEOUT_IN_MILLISECONDS = 60_000;

export const GENERIC_ERROR_TEXT = 'Não consegui responder agora. Tente novamente em instantes.';
export const EMPTY_RESULT_TEXT =
  'Não encontrei resultados para isso. Tente descrever de outro jeito.';
export const RATE_LIMIT_FALLBACK_TEXT =
  'Você atingiu o limite de mensagens. Tente novamente mais tarde.';
export const BLOCKED_HINT_TEXT =
  'Limite de mensagens atingido. Recarregue a página mais tarde para continuar.';

export const TYPING_INDICATOR_LABEL = 'AchaLocalBot está digitando';
export const MESSAGE_INPUT_LABEL = 'Digite sua pergunta';
export const SEND_BUTTON_LABEL = 'Enviar mensagem';
export const CONVERSATION_LABEL = 'Conversa com o AchaLocalBot';
