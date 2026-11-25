import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { BusinessResponseDataDto } from '../models/business-response-data.dto';

/**
 * Único ponto HTTP da área do cliente (contracts/business-api.md). O cabeçalho `Authorization` é
 * incluído pelo `authTokenInterceptor`; erros são propagados sem tratamento e sem timeout.
 */
@Injectable({ providedIn: 'root' })
export class BusinessApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getClientBusiness(clientId: number): Observable<ApiResponseDto<BusinessResponseDataDto>> {
    return this.http.get<ApiResponseDto<BusinessResponseDataDto>>(
      `${this.baseUrl}/${clientId}/business`,
    );
  }
}
