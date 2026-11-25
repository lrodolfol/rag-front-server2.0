import { InjectionToken } from '@angular/core';

/** Base da API de negócio (ex.: `{base}/{clientId}/business`). Requisições sob ela levam o token. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
