import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponseDto } from '../api/api-response.dto';
import { API_BASE_URL } from '../config/api-base-url.token';
import { BusinessResponseDataDto } from './business-response-data.dto';
import { BusinessApiService } from './business-api.service';
import { RegisterBusinessRequestDto } from '../../features/business-registration/models/register-business-request.dto';

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

  describe('registerBusiness', () => {
    const REQUEST: RegisterBusinessRequestDto = {
      name: 'pet_amigo',
      descricao: 'pet shop e cuidados para animais',
      email: null,
      address: 'avenida das acacias - 310',
      telephone: '35995678901',
      detalhes: 'O Pet Amigo oferece banho e tosa, produtos para cães e gatos.',
    };

    it('should POST the DTO to {base}/{clientId}/business without Authorization', () => {
      let received: unknown;
      service.registerBusiness(42, REQUEST).subscribe((response) => (received = response));

      const request = httpTesting.expectOne(BUSINESS_URL);
      expect(request.request.method).toBe('POST');
      expect(request.request.urlWithParams).toBe(BUSINESS_URL);
      expect(request.request.body).toEqual(REQUEST);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({ ...RESPONSE, statusCode: 201 }, { status: 201, statusText: 'Created' });

      expect(received).toEqual({ ...RESPONSE, statusCode: 201 });
    });

    it('should propagate HTTP errors untouched', () => {
      let error: unknown;
      service
        .registerBusiness(42, REQUEST)
        .subscribe({ error: (caught: unknown) => (error = caught) });

      httpTesting.expectOne(BUSINESS_URL).flush(null, { status: 409, statusText: 'Conflict' });

      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect((error as HttpErrorResponse).status).toBe(409);
    });
  });

  it('should propagate HTTP errors untouched', () => {
    let error: unknown;
    service.getClientBusiness(42).subscribe({ error: (caught: unknown) => (error = caught) });

    httpTesting.expectOne(BUSINESS_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(500);
  });
});
