import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AUTH_SESSION_STORAGE_KEY } from './auth-session.service';

let protectedInstances = 0;

@Component({ template: '<p>área protegida</p>' })
class ProtectedStub {
  constructor() {
    protectedInstances++;
  }
}

@Component({ template: '<p>login</p>' })
class LoginStub {}

const VALID_SESSION = {
  accessToken: 'eyJhbGciOi.token.assinatura',
  tokenType: 'Bearer',
  expiresAt: '2999-01-01T00:00:00Z',
  clientId: 42,
};

describe('authGuard', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(async () => {
    sessionStorage.clear();
    protectedInstances = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: LoginStub },
          { path: 'protegida', component: ProtectedStub, canActivate: [authGuard] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    httpTesting.verify();
    sessionStorage.clear();
  });

  async function open(): Promise<string> {
    await harness.navigateByUrl('/protegida');
    return TestBed.inject(Router).url;
  }

  it('should redirect to /login without a session and never create the page', async () => {
    expect(await open()).toBe('/login');
    expect(protectedInstances).toBe(0);
  });

  it('should redirect to /login and drop an expired session', async () => {
    sessionStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({ ...VALID_SESSION, expiresAt: '2000-01-01T00:00:00Z' }),
    );
    expect(await open()).toBe('/login');
    expect(protectedInstances).toBe(0);
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should redirect to /login and drop a malformed session', async () => {
    sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, '{não é json');
    expect(await open()).toBe('/login');
    expect(protectedInstances).toBe(0);
    expect(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should activate the route with a valid session', async () => {
    sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(VALID_SESSION));
    expect(await open()).toBe('/protegida');
    expect(protectedInstances).toBe(1);
  });
});
