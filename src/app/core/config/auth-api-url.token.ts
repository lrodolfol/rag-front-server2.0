import { InjectionToken } from '@angular/core';

/** Base do serviço de autenticação (sem o endpoint, ex.: `/register`) — R-01. */
export const AUTH_API_URL = new InjectionToken<string>('AUTH_API_URL');
