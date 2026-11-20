import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  let fixture: ComponentFixture<HeroSection>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSection, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSection);
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

  it('should render a single h1 labelling the section', () => {
    const headings = element.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Seu negócio encontrado no estilo WhatsApp.');
    const section = element.querySelector('section');
    expect(section?.getAttribute('aria-labelledby')).toBe(headings[0].id);
  });

  it('should render the support text', () => {
    expect(element.querySelector('p')?.textContent).toContain(
      'Cadastre uma vez. Quando alguém perguntar “estou com fome” ou “preciso reformar”, nosso chatbot recomenda você — com endereço, preço e contato.',
    );
  });

  it('should link the primary action to business registration', () => {
    const link = findLink('cadastrar meu negócio');
    expect(link.getAttribute('href')).toBe('/cadastrar-negocio');
    expect(link.hasAttribute('mat-flat-button')).toBe(true);
    expect(link.querySelector('mat-icon[svgIcon="add_business"]')).not.toBeNull();
  });

  it('should link the secondary action to the chatbot', () => {
    const link = findLink('testar o chat online');
    expect(link.getAttribute('href')).toBe('/chatbot');
    expect(link.hasAttribute('mat-stroked-button')).toBe(true);
    expect(link.querySelector('mat-icon[svgIcon="chat"]')).not.toBeNull();
  });

  it('should render the illustration with fixed dimensions and alt text', () => {
    const image = element.querySelector('img');
    expect(image?.getAttribute('alt')).toBe(
      'Ilustração de negócios locais — padaria, barbearia, loja de ferramentas e professor de idiomas — com balões de conversa e marcadores de localização',
    );
    expect(image?.getAttribute('width')).toBe('1440');
    expect(image?.getAttribute('height')).toBe('810');
    expect(image?.getAttribute('src')).toBe('images/hero-1440.webp');
    expect(image?.getAttribute('srcset')).toContain('images/hero-960.webp 960w');
  });
});
