import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { HowItWorksSection } from './how-it-works-section';

describe('HowItWorksSection', () => {
  let fixture: ComponentFixture<HowItWorksSection>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItWorksSection, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HowItWorksSection);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the heading and subtitle', () => {
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Como funciona');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(element.textContent).toContain(
      'Dois lados de uma mesma plataforma: quem oferece e quem precisa.',
    );
  });

  it('should render the three steps in order', () => {
    const titles = Array.from(element.querySelectorAll('app-step-card h3')).map((title) =>
      title.textContent?.trim(),
    );
    expect(titles).toEqual(['1. Cadastre', '2. Usuário pergunta', '3. Recomendação']);
  });

  it('should render the natural language block', () => {
    const subheading = Array.from(element.querySelectorAll('h3')).find(
      (candidate) => candidate.textContent?.trim() === 'Funciona com linguagem natural.',
    );
    expect(subheading).toBeDefined();
    expect(element.textContent).toContain(
      'Os usuários não precisam saber o nome certo da categoria. O serviço entende o contexto e encontra o negócio certo na sua base.',
    );
  });

  it('should link "testar agora" to the chatbot', () => {
    const link = Array.from(element.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.includes('testar agora'),
    );
    expect(link?.getAttribute('href')).toBe('/chatbot');
    expect(link?.querySelector('mat-icon[svgIcon="arrow_forward"]')).not.toBeNull();
  });

  it('should render the chat simulation', () => {
    expect(element.querySelector('app-chat-simulation')).not.toBeNull();
  });
});
