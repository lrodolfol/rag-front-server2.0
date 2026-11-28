import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseDto } from '../api/api-response.dto';
import { API_BASE_URL } from '../config/api-base-url.token';
import { RegisterBusinessRequestDto } from '../../features/business-registration/models/register-business-request.dto';
import {
  BusinessResponseDataDto,
  ClientBusinessResponseDataDto,
} from './business-response-data.dto';

/**
 * Único ponto HTTP do recurso de negócio (contracts/business-api.md da feature 006 e
 * contracts/business-registration-api.md). O cabeçalho `Authorization` é incluído pelo
 * `authTokenInterceptor`; erros são propagados sem tratamento e sem timeout (fica nos stores).
 */
@Injectable({ providedIn: 'root' })
export class BusinessApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getClientBusiness(clientId: number): Observable<ApiResponseDto<ClientBusinessResponseDataDto>> {
    return this.http.get<ApiResponseDto<ClientBusinessResponseDataDto>>(
      this.businessUrl(clientId),
    );
  }

  registerBusiness(
    clientId: number,
    request: RegisterBusinessRequestDto,
  ): Observable<ApiResponseDto<BusinessResponseDataDto>> {
    return this.http.post<ApiResponseDto<BusinessResponseDataDto>>(
      this.businessUrl(clientId),
      request,
    );
  }

  private businessUrl(clientId: number): string {
    return `${this.baseUrl}/${clientId}/business`;
  }
}
