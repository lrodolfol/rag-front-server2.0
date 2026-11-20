export const AppPaths = {
  home: '',
  registerBusiness: 'cadastrar-negocio',
  chatbot: 'chatbot',
} as const;

export const toRouterLink = (path: string): string => '/' + path;
