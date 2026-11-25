import { HttpErrorResponse } from '@angular/common/http';
import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ApiResponseDto } from '../../../core/api/api-response.dto';
import { RegisterResponseDataDto } from '../models/register-response-data.dto';
import {
  GENERIC_ERROR_TEXT,
  REGISTRATION_TIMEOUT_IN_MILLISECONDS,
  SUCCESS_FALLBACK_TEXT,
} from '../register-content';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { RegistrationStore } from './registration.store';

type RegisterResponse = ApiResponseDto<RegisterResponseDataDto>;

const INPUT = { name: 'Maria', email: 'maria@example.com', password: 'senha123' };

function successResponse(message: string): RegisterResponse {
  return { statusCode: 201, success: true, message, data: null, error: null };
}

describe('RegistrationStore', () => {
  let responses: Subject<RegisterResponse>;
  let register: ReturnType<typeof vi.fn>;
  let store: RegistrationStore;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    responses = new Subject<RegisterResponse>();
    register = vi.fn(() => responses.asObservable());
    TestBed.configureTestingModule({
      providers: [RegistrationStore, { provide: AuthApiService, useValue: { register } }],
    });
    store = TestBed.inject(RegistrationStore);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    vi.useRealTimers();
  });

  function newResponses(): void {
    responses = new Subject<RegisterResponse>();
  }

  it('should start idle with no messages', () => {
    expect(store.status()).toBe('idle');
    expect(store.isSubmitting()).toBe(false);
    expect(store.successMessage()).toBeNull();
    expect(store.failure()).toBeNull();
    expect(store.formErrorMessage()).toBeNull();
  });

  it('should send the PascalCase DTO and become submitting', () => {
    store.submit(INPUT);
    expect(register).toHaveBeenCalledWith({
      Name: 'Maria',
      Email: 'maria@example.com',
      Password: 'senha123',
    });
    expect(store.status()).toBe('submitting');
    expect(store.isSubmitting()).toBe(true);
  });

  it('should succeed with the service message', () => {
    store.submit(INPUT);
    responses.next(successResponse('Cadastro realizado com sucesso.'));
    responses.complete();
    expect(store.status()).toBe('succeeded');
    expect(store.successMessage()).toBe('Cadastro realizado com sucesso.');
  });

  it('should use the fallback text when the success message is empty', () => {
    store.submit(INPUT);
    responses.next(successResponse(''));
    expect(store.successMessage()).toBe(SUCCESS_FALLBACK_TEXT);
  });

  it('should ignore a second submit while submitting', () => {
    store.submit(INPUT);
    store.submit(INPUT);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('should clear the success message on a new submit', () => {
    store.submit(INPUT);
    responses.next(successResponse('ok'));
    newResponses();
    store.submit(INPUT);
    expect(store.successMessage()).toBeNull();
    expect(store.status()).toBe('submitting');
  });

  it('should fail with the mapped failure on an HTTP error', () => {
    store.submit(INPUT);
    responses.error(
      new HttpErrorResponse({ status: 500, error: { message: 'Serviço em manutenção.' } }),
    );
    expect(store.status()).toBe('failed');
    expect(store.failure()?.kind).toBe('server-message');
    expect(store.formErrorMessage()).toBe('Serviço em manutenção.');
  });

  it('should not show a general message when the e-mail is taken', () => {
    store.submit(INPUT);
    responses.error(new HttpErrorResponse({ status: 409, error: { message: 'Em uso.' } }));
    expect(store.failure()?.fieldErrors).toEqual({ email: 'Em uso.' });
    expect(store.formErrorMessage()).toBeNull();
  });

  it('should fail with the generic text after the timeout', () => {
    vi.useFakeTimers();
    store.submit(INPUT);
    vi.advanceTimersByTime(REGISTRATION_TIMEOUT_IN_MILLISECONDS - 1);
    expect(store.status()).toBe('submitting');
    vi.advanceTimersByTime(1);
    expect(store.status()).toBe('failed');
    expect(store.formErrorMessage()).toBe(GENERIC_ERROR_TEXT);
    expect(responses.observed).toBe(false);
  });

  it('should clear the failure on a new submit', () => {
    store.submit(INPUT);
    responses.error(new Error('boom'));
    newResponses();
    store.submit(INPUT);
    expect(store.failure()).toBeNull();
    expect(store.formErrorMessage()).toBeNull();
  });

  it('should cancel the request without errors when destroyed while submitting', () => {
    const injector = createEnvironmentInjector(
      [RegistrationStore],
      TestBed.inject(EnvironmentInjector),
    );
    injector.get(RegistrationStore).submit(INPUT);
    expect(responses.observed).toBe(true);
    expect(() => injector.destroy()).not.toThrow();
    expect(responses.observed).toBe(false);
  });
});
