import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { BusinessCard } from './business-card';

describe('BusinessCard', () => {
  let fixture: ComponentFixture<BusinessCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessCard, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BusinessCard);
    element = fixture.nativeElement as HTMLElement;
  });

  async function render(name: string): Promise<void> {
    fixture.componentRef.setInput('business', { name });
    await fixture.whenStable();
  }

  it('should show the name in an h2 with the full name as title', async () => {
    await render('Padaria Pão Quente');
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Padaria Pão Quente');
    expect(heading?.getAttribute('title')).toBe('Padaria Pão Quente');
  });

  it('should show the default image icon hidden from screen readers', async () => {
    await render('Padaria');
    const icon = element.querySelector('mat-icon[data-mat-icon-name="image"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should link "Editar" to /editar-negocio', async () => {
    await render('Padaria');
    const edit = Array.from(element.querySelectorAll('a')).find(
      (link) => link.textContent?.trim() === 'Editar',
    );
    expect(edit?.getAttribute('href')).toBe('/editar-negocio');
    expect(edit?.querySelector('mat-icon[data-mat-icon-name="edit"]')).not.toBeNull();
  });

  it('should link the delete icon button to /excluir-negocio with an accessible label', async () => {
    await render('Padaria');
    const remove = element.querySelector<HTMLAnchorElement>('a[aria-label="Excluir negócio"]');
    expect(remove?.getAttribute('href')).toBe('/excluir-negocio');
    expect(remove?.querySelector('mat-icon[data-mat-icon-name="delete"]')).not.toBeNull();
  });

  it('should keep a very long name on one line with ellipsis', async () => {
    const longName = 'Padaria '.repeat(60).trim();
    await render(longName);
    const heading = element.querySelector('h2');
    expect(heading?.classList).toContain('name');
    expect(heading?.getAttribute('title')).toBe(longName);
  });

  it('should render HTML in the name as plain text', async () => {
    await render('<b>Padaria</b>');
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('<b>Padaria</b>');
    expect(heading?.querySelector('b')).toBeNull();
  });
});
