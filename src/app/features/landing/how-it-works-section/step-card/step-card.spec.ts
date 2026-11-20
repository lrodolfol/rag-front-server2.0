import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { By } from '@angular/platform-browser';
import { HOW_IT_WORKS_STEPS } from '../../landing-content';
import { StepCard } from './step-card';

describe('StepCard', () => {
  let fixture: ComponentFixture<StepCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepCard, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StepCard);
    fixture.componentRef.setInput('step', HOW_IT_WORKS_STEPS[0]);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the numbered title', () => {
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('1. Cadastre');
  });

  it('should render the description', () => {
    expect(element.querySelector('p')?.textContent?.trim()).toBe(HOW_IT_WORKS_STEPS[0].description);
  });

  it('should render the step icon as decorative', () => {
    const icon = fixture.debugElement.query(By.directive(MatIcon));
    expect(icon.injector.get(MatIcon).svgIcon).toBe('edit_note');
    expect(icon.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });
});
