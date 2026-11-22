import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { CHAT_API_URL } from './core/config/chat-api-url.token';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  // Pré-carrega os chunks lazy para que o primeiro teste não estoure o timeout em execução a frio.
  beforeAll(async () => {
    await import('./features/coming-soon/coming-soon-page');
    await import('./features/chatbot/chatbot-page');
  }, 30000);

  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CHAT_API_URL, useValue: 'http://test/chat' },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  function routeHeading(): string | undefined {
    return harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();
  }

  it('should render the landing page at the root', async () => {
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-landing-page');
    expect(TestBed.inject(Title).getTitle()).toBe('AchaLocal — diretório local com IA');
  });

  it('should render the coming soon page for business registration', async () => {
    await harness.navigateByUrl('/cadastrar-negocio');
    expect(routeHeading()).toBe('Cadastro de negócio — em breve');
    expect(TestBed.inject(Title).getTitle()).toBe('Cadastro de negócio — em breve');
  });

  it('should render the chatbot page at /chatbot (FR-001)', async () => {
    await harness.navigateByUrl('/chatbot');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-chatbot-page');
    expect(harness.routeNativeElement?.querySelector('app-chat-window')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Chatbot — AchaLocal');
  });

  for (const trigger of ['testar chatbot', 'testar o chat online', 'testar agora']) {
    it(`should open the working chatbot from the landing "${trigger}" link (FR-025)`, async () => {
      await harness.navigateByUrl('/');
      const link = Array.from(
        harness.routeNativeElement?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((candidate) => candidate.textContent?.includes(trigger));
      expect(link).toBeDefined();
      link?.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/chatbot');
      expect(harness.routeNativeElement?.querySelector('app-chat-window')).not.toBeNull();
      expect(harness.routeNativeElement?.querySelector('app-coming-soon-page')).toBeNull();
    });
  }
});
