import { Routes } from '@angular/router';

export const DEV_ROUTES: Routes = [
  {
    path: 'dev/tema',
    title: 'Demonstração do tema',
    loadComponent: () =>
      import('./theme-showcase/theme-showcase').then((module) => module.ThemeShowcase),
  },
];
