import { NavigationItem } from '../../core/layout/navigation-item';
import { AppPaths } from '../../core/routing/app-paths';

export const DASHBOARD_PAGE_TITLE = 'Meus negócios — AchaLocal';

export const DASHBOARD_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Testar Chatbot', icon: 'chat', path: AppPaths.chatbot },
  { label: 'Meus negócios', icon: 'grid_view', path: AppPaths.dashboard },
];

export const SIGN_OUT_LABEL = 'Sair';

export const DASHBOARD_TIMEOUT_MS = 30_000;

export const DASHBOARD_HEADING = 'Meus negócios';
export const DASHBOARD_SUBHEADING = 'Gerencie os negócios que você cadastrou no diretório.';
export const NEW_BUSINESS_LABEL = 'Novo negócio';

export const LOADING_TEXT = 'Carregando seus dados';

export const LOAD_ERROR_TEXT =
  'Não foi possível carregar seus dados agora. Tente novamente em instantes.';
export const RETRY_LABEL = 'Tentar novamente';

export const EMPTY_HEADING = 'Nenhum negócio ainda';
export const EMPTY_TEXT = 'Cadastre seu primeiro negócio para aparecer no chatbot.';
export const REGISTER_NOW_LABEL = 'Cadastrar agora';

export const EDIT_LABEL = 'Editar';
export const DELETE_ARIA_LABEL = 'Excluir negócio';

export const CHATBOT_PREVIEW_HEADING = 'Veja como aparece no chatbot';
export const CHATBOT_PREVIEW_TEXT = 'Teste perguntas como "estou com fome" no simulador.';
export const OPEN_CHAT_LABEL = 'Abrir o chat';
