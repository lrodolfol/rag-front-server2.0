import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { By } from '@angular/platform-browser';
import { ClosingCallSection } from './closing-call-section';

describe('ClosingCallSection', () => {
  let fixture: ComponentFixture<ClosingCallSection>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosingCallSection, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClosingCallSection);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the heading labelling the section', () => {
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Pronto para alcançar maiores resultados?');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading?.id);
  });

  it('should render the explanatory text', () => {
    const text = element.querySelector('.description')?.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toBe(
      'Não fazemos pedidos ou integração com empresas: disponibilizamos informações e ajudamos o cliente a encontrar o seu serviço.',
    );
  });

  it('should render the three benefits in order with icons', () => {
    const items = Array.from(element.querySelectorAll('.benefits li'));
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Setup em 5 minutos',
      'Sem conhecimento técnico',
      'Resultados rápidos',
    ]);
    const icons = fixture.debugElement
      .queryAll(By.css('.benefits mat-icon'))
      .map((icon) => icon.injector.get(MatIcon).svgIcon);
    expect(icons).toEqual(['bolt', 'sentiment_satisfied', 'trending_up']);
  });

  it('should render the contact card', () => {
    expect(element.querySelector('app-contact-card')).not.toBeNull();
  });
});
