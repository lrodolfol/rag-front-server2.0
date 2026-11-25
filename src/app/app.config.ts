import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/auth/auth-token.interceptor';
import { API_BASE_URL } from './core/config/api-base-url.token';
import { AUTH_API_URL } from './core/config/auth-api-url.token';
import { CHAT_API_URL } from './core/config/chat-api-url.token';
import { provideAppIcons } from './core/icons/provide-app-icons';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor])),
    provideAppIcons(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: CHAT_API_URL, useValue: environment.chatApiUrl },
    { provide: AUTH_API_URL, useValue: environment.authApiUrl },
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
};
