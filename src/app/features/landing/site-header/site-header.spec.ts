import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function findLink(text: string): HTMLAnchorElement {
    const link = Array.from(element.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.includes(text),
    );
    if (!link) {
      throw new Error(`Link "${text}" não encontrado.`);
    }
    return link;
  }

  it('should render the brand linking to the home page', () => {
    const brand = findLink('AchaLocal');
    expect(element.querySelector('header')).not.toBeNull();
    expect(brand.getAttribute('href')).toBe('/');
    const icon = brand.querySelector('mat-icon[svgIcon="storefront"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should scroll to the top when the brand is clicked', () => {
    const scroller = TestBed.inject(ViewportScroller);
    const scrollSpy = vi.spyOn(scroller, 'scrollToPosition');
    findLink('AchaLocal').click();
    expect(scrollSpy).toHaveBeenCalledWith([0, 0]);
  });

  it('should link "testar chatbot" to the chatbot page', () => {
    const link = findLink('testar chatbot');
    expect(link.getAttribute('href')).toBe('/chatbot');
    expect(link.querySelector('mat-icon[svgIcon="chat"]')).not.toBeNull();
  });

  it('should not show authenticated user items to visitors (FR-004)', () => {
    const header = element.querySelector('header') as HTMLElement;
    expect(header.querySelectorAll('a').length).toBe(2);
    expect(header.textContent).not.toContain('meus negócios');
    expect(header.textContent).not.toContain('sair');
  });
});
