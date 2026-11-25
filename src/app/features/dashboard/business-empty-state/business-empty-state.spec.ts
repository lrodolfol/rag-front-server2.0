import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { BusinessEmptyState } from './business-empty-state';

describe('BusinessEmptyState', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessEmptyState, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(BusinessEmptyState);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should show the storefront icon hidden from screen readers', () => {
    const icon = element.querySelector('mat-icon[data-mat-icon-name="storefront"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show the heading and the invitation text', () => {
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Nenhum negócio ainda');
    expect(element.querySelector('p')?.textContent?.trim()).toBe(
      'Cadastre seu primeiro negócio para aparecer no chatbot.',
    );
  });

  it('should link "Cadastrar agora" to /cadastrar-negocio with the add icon', () => {
    const link = element.querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent?.trim()).toBe('Cadastrar agora');
    expect(link?.getAttribute('href')).toBe('/cadastrar-negocio');
    expect(link?.querySelector('mat-icon[data-mat-icon-name="add"]')).not.toBeNull();
  });
});
