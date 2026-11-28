export const AppPaths = {
  home: '',
  registerBusiness: 'cadastrar-negocio',
  chatbot: 'chatbot',
  register: 'register',
  login: 'login',
  dashboard: 'dashboard',
  newBusiness: 'dashboard/new',
  editBusiness: 'editar-negocio',
  deleteBusiness: 'excluir-negocio',
} as const;

export const toRouterLink = (path: string): string => '/' + path;
