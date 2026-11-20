import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ESSENTIAL_PLAN } from '../../landing-content';
import { PlanCard } from './plan-card';

describe('PlanCard', () => {
  let fixture: ComponentFixture<PlanCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    registerLocaleData(localePt);
    await TestBed.configureTestingModule({
      imports: [PlanCard, MatIconTestingModule],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanCard);
    fixture.componentRef.setInput('plan', ESSENTIAL_PLAN);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the plan name', () => {
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Essencial');
  });

  it('should render the monthly price formatted in Brazilian reais', () => {
    const price = element.querySelector('.price')?.textContent?.replace(/ /g, ' ').trim();
    expect(price).toBe('R$ 9,99/mês');
  });

  it('should render the benefits with a check icon', () => {
    const item = element.querySelector('li');
    expect(item?.textContent?.trim()).toBe('respostas ilimitadas');
    expect(item?.querySelector('mat-icon[svgIcon="check"]')).not.toBeNull();
  });

  it('should render the cancellation note', () => {
    expect(element.querySelector('.note')?.textContent?.trim()).toBe('cancele quando quiser');
  });
});
