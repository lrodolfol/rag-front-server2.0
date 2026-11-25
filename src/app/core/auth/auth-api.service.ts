import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequestDto } from '../../features/login/models/login-request.dto';
import { LoginResponseDataDto } from '../../features/login/models/login-response-data.dto';
import { RegisterRequestDto } from '../../features/register/models/register-request.dto';
import { RegisterResponseDataDto } from '../../features/register/models/register-response-data.dto';
import { ApiResponseDto } from '../api/api-response.dto';
import { AUTH_API_URL } from '../config/auth-api-url.token';

/** Único ponto HTTP do serviço de autenticação (cadastro e login). Erros são propagados sem tratamento. */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_URL);

  register(request: RegisterRequestDto): Observable<ApiResponseDto<RegisterResponseDataDto>> {
    return this.http.post<ApiResponseDto<RegisterResponseDataDto>>(
      `${this.baseUrl}/register`,
      request,
    );
  }

  login(request: LoginRequestDto): Observable<ApiResponseDto<LoginResponseDataDto>> {
    return this.http.post<ApiResponseDto<LoginResponseDataDto>>(`${this.baseUrl}/login`, request);
  }
}
