import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthRedirectService } from './auth-redirect.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthRedirectService', () => {
  let service: AuthRedirectService;
  let router: Router;
  let session: AuthSessionService;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AuthRedirectService);
    router = TestBed.inject(Router);
    session = TestBed.inject(AuthSessionService);
    consoleSpies = (['error', 'warn', 'log'] as const).map((method) =>
      vi.spyOn(console, method),
    );
  });

  afterEach(() => {
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
  });

  it('should clear the session and go to /login on redirectToLogin()', () => {
    const clear = vi.spyOn(session, 'clear');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.redirectToLogin();

    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('should clear the session and replace the URL with / on signOut()', () => {
    const clear = vi.spyOn(session, 'clear');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.signOut();

    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('should swallow a rejected navigation without unhandled errors', async () => {
    vi.spyOn(router, 'navigateByUrl').mockRejectedValue(new Error('navegação cancelada'));

    service.redirectToLogin();
    service.signOut();
    await Promise.resolve();
    await Promise.resolve();
  });
});
