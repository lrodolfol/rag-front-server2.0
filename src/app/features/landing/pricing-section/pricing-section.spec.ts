import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { PricingSection } from './pricing-section';

describe('PricingSection', () => {
  let fixture: ComponentFixture<PricingSection>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingSection, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingSection);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the heading labelling the section', () => {
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Planos mensais');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading?.id);
  });

  it('should render one plan card', () => {
    expect(element.querySelectorAll('app-plan-card').length).toBe(1);
  });
});
