import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  // Pré-carrega os chunks lazy para que o primeiro teste não estoure o timeout em execução a frio.
  beforeAll(async () => {
    await import('./features/coming-soon/coming-soon-page');
  }, 30000);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [provideRouter(routes, withComponentInputBinding())],
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

  it('should navigate from the header "testar chatbot" link to the chatbot page', async () => {
    await harness.navigateByUrl('/');
    const link = Array.from(
      harness.routeNativeElement?.querySelectorAll<HTMLAnchorElement>('header a') ?? [],
    ).find((candidate) => candidate.textContent?.includes('testar chatbot'));
    link?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/chatbot');
    expect(routeHeading()).toBe('Chatbot — em breve');
  });

  it('should render the coming soon page for business registration', async () => {
    await harness.navigateByUrl('/cadastrar-negocio');
    expect(routeHeading()).toBe('Cadastro de negócio — em breve');
    expect(TestBed.inject(Title).getTitle()).toBe('Cadastro de negócio — em breve');
  });

  it('should render the coming soon page for the chatbot', async () => {
    await harness.navigateByUrl('/chatbot');
    expect(routeHeading()).toBe('Chatbot — em breve');
    expect(TestBed.inject(Title).getTitle()).toBe('Chatbot — em breve');
  });
});
