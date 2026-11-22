export const AppPaths = {
  home: '',
  registerBusiness: 'cadastrar-negocio',
  chatbot: 'chatbot',
  register: 'register',
  login: 'login',
  dashboard: 'dashboard',
} as const;

export const toRouterLink = (path: string): string => '/' + path;
