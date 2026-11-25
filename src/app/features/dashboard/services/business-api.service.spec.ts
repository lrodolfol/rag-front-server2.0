import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { BusinessResponseDataDto } from '../models/business-response-data.dto';
import { BusinessApiService } from './business-api.service';

const BASE_URL = 'http://api.test/api/v1';
const BUSINESS_URL = `${BASE_URL}/42/business`;
const RESPONSE: ApiResponseDto<BusinessResponseDataDto> = {
  statusCode: 200,
  success: true,
  message: 'Negócio encontrado com sucesso.',
  data: {
    name: 'Padaria Pão Quente',
    description: 'Padaria artesanal com pães de fermentação natural.',
    email: 'contato@paoquente.com.br',
    telephone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    details: 'Aberto de seg. a sáb., 6h às 20h.',
    createdAt: '2026-11-01T14:32:10+00:00',
    updatedAt: '2026-11-20T09:15:44+00:00',
  },
  error: null,
};

describe('BusinessApiService', () => {
  let service: BusinessApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    service = TestBed.inject(BusinessApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should GET {base}/{clientId}/business without body, query or Authorization', () => {
    let received: unknown;
    service.getClientBusiness(42).subscribe((response) => (received = response));

    const request = httpTesting.expectOne(BUSINESS_URL);
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    expect(request.request.urlWithParams).toBe(BUSINESS_URL);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(RESPONSE);

    expect(received).toEqual(RESPONSE);
  });

  it('should propagate HTTP errors untouched', () => {
    let error: unknown;
    service.getClientBusiness(42).subscribe({ error: (caught: unknown) => (error = caught) });

    httpTesting.expectOne(BUSINESS_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(500);
  });
});
