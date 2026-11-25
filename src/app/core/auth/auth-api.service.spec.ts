import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoginResponseDataDto } from '../../features/login/models/login-response-data.dto';
import { RegisterResponseDataDto } from '../../features/register/models/register-response-data.dto';
import { ApiResponseDto } from '../api/api-response.dto';
import { AUTH_API_URL } from '../config/auth-api-url.token';
import { AuthApiService } from './auth-api.service';

const BASE_URL = 'http://api.test/api/v1/auth';
const REGISTER_URL = `${BASE_URL}/register`;
const LOGIN_URL = `${BASE_URL}/login`;
const REQUEST = { Name: 'Maria', Email: 'maria@example.com', Password: 'senha123' };
const RESPONSE: ApiResponseDto<RegisterResponseDataDto> = {
  statusCode: 201,
  success: true,
  message: 'Cadastro realizado com sucesso. Confirme o cadastro com seu e-mail',
  data: {
    clientId: 2,
    accessCode: 'sE1CMP8iqfYV',
    name: 'Maria',
    email: 'maria@example.com',
    createdAt: '2026-11-22T19:27:48.2031803+00:00',
  },
  error: null,
};
const LOGIN_REQUEST = { Email: 'maria@example.com', Password: 'NovaSenha123' };
const LOGIN_RESPONSE: ApiResponseDto<LoginResponseDataDto> = {
  statusCode: 200,
  success: true,
  message: 'Login realizado com sucesso.',
  data: {
    accessToken: 'eyJhbGciOi.token.assinatura',
    tokenType: 'Bearer',
    expiresAt: '2026-11-22T21:27:48+00:00',
    clientId: 2,
    accessCode: 'sE1CMP8iqfYV',
    business: null,
  },
  error: null,
};

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_API_URL, useValue: BASE_URL },
      ],
    });
    service = TestBed.inject(AuthApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should POST the DTO in the body to {base}/register without query string', () => {
    let received: unknown;
    service.register(REQUEST).subscribe((response) => (received = response));

    const request = httpTesting.expectOne(REGISTER_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(REQUEST);
    expect(request.request.urlWithParams).toBe(REGISTER_URL);
    request.flush(RESPONSE, { status: 201, statusText: 'Created' });

    expect(received).toEqual(RESPONSE);
  });

  it('should propagate HTTP errors untouched', () => {
    let error: unknown;
    service.register(REQUEST).subscribe({ error: (caught: unknown) => (error = caught) });

    httpTesting.expectOne(REGISTER_URL).flush(null, { status: 409, statusText: 'Conflict' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(409);
  });

  describe('login', () => {
    it('should POST the credentials once to {base}/login without Authorization', () => {
      let received: unknown;
      service.login(LOGIN_REQUEST).subscribe((response) => (received = response));

      const request = httpTesting.expectOne(LOGIN_URL);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(LOGIN_REQUEST);
      expect(request.request.urlWithParams).toBe(LOGIN_URL);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush(LOGIN_RESPONSE);

      expect(received).toEqual(LOGIN_RESPONSE);
    });

    it('should propagate a 401 untouched', () => {
      let error: unknown;
      service.login(LOGIN_REQUEST).subscribe({ error: (caught: unknown) => (error = caught) });

      httpTesting
        .expectOne(LOGIN_URL)
        .flush({ message: 'E-mail ou senha inválidos.' }, { status: 401, statusText: 'Unauthorized' });

      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect((error as HttpErrorResponse).status).toBe(401);
    });
  });
});
