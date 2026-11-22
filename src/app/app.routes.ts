import { Routes } from '@angular/router';
import { AppPaths } from './core/routing/app-paths';
import { DEV_ROUTES } from './dev/dev.routes';
import { LandingPage } from './features/landing/landing-page';

const loadComingSoonPage = () =>
  import('./features/coming-soon/coming-soon-page').then((module) => module.ComingSoonPage);

export const routes: Routes = [
  {
    path: AppPaths.home,
    pathMatch: 'full',
    title: 'AchaLocal — diretório local com IA',
    // Carregamento imediato (não lazy): é a página de entrada e evita uma ida extra à rede antes do LCP (SC-003).
    component: LandingPage,
  },
  {
    path: AppPaths.registerBusiness,
    title: 'Cadastro de negócio — em breve',
    data: { featureName: 'Cadastro de negócio' },
    loadComponent: loadComingSoonPage,
  },
  {
    path: AppPaths.chatbot,
    title: 'Chatbot — AchaLocal',
    loadComponent: () =>
      import('./features/chatbot/chatbot-page').then((module) => module.ChatbotPage),
  },
  ...DEV_ROUTES,
];
