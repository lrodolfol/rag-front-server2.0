import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
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
  {
    path: AppPaths.register,
    title: 'Cadastro — AchaLocal',
    loadComponent: () =>
      import('./features/register/register-page').then((module) => module.RegisterPage),
  },
  {
    path: AppPaths.login,
    title: 'Login — AchaLocal',
    loadComponent: () =>
      import('./features/login/login-page').then((module) => module.LoginPage),
  },
  {
    path: AppPaths.dashboard,
    title: 'Meus negócios — AchaLocal',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage),
  },
  {
    path: AppPaths.editBusiness,
    title: 'Edição de negócio — em breve',
    data: { featureName: 'Edição de negócio' },
    canActivate: [authGuard],
    loadComponent: loadComingSoonPage,
  },
  {
    path: AppPaths.deleteBusiness,
    title: 'Exclusão de negócio — em breve',
    data: { featureName: 'Exclusão de negócio' },
    canActivate: [authGuard],
    loadComponent: loadComingSoonPage,
  },
  ...DEV_ROUTES,
];
