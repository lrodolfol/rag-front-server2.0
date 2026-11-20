import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ContactCard } from './contact-card';

describe('ContactCard', () => {
  let fixture: ComponentFixture<ContactCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCard, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactCard);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the title and e-mail only notice', () => {
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Fale com a gente');
    expect(element.textContent).toContain('Atendimento somente por e-mail.');
  });

  it('should show the contact address as visible text', () => {
    expect(element.querySelector('.email')?.textContent?.trim()).toBe(
      'contato@tinosnegocios.com.br',
    );
  });

  it('should open the e-mail client through a mailto link', () => {
    const link = element.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Enviar e-mail');
    expect(link?.getAttribute('href')).toBe('mailto:contato@tinosnegocios.com.br');
    expect(link?.querySelector('mat-icon[svgIcon="mail"]')).not.toBeNull();
  });

  it('should not render a contact form', () => {
    expect(element.querySelector('form')).toBeNull();
    expect(element.querySelector('input')).toBeNull();
  });
});
