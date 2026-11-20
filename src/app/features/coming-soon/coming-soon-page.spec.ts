import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ComingSoonPage } from './coming-soon-page';

describe('ComingSoonPage', () => {
  let fixture: ComponentFixture<ComingSoonPage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComingSoonPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComingSoonPage);
    fixture.componentRef.setInput('featureName', 'Chatbot');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the feature name as coming soon', () => {
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Chatbot — em breve');
  });

  it('should render the support text', () => {
    expect(element.querySelector('p')?.textContent).toContain(
      'Estamos preparando este recurso. Volte em breve!',
    );
  });

  it('should link back to the home page', () => {
    const link = element.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Voltar para a página inicial');
    expect(link?.getAttribute('href')).toBe('/');
  });
});
